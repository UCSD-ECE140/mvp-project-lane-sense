# This file contains the functions that interact with the database to get information about trips
from typing import List
from fastapi import HTTPException
from gpt import generate_trip_summary
from models import LocationUpdate, PookieStats, TripComplete, TripCreate, TripDetails, UserStats
from pookie import update_pookie_stats
from users import update_user_stats
from utils import get_db_connection
from geopy import Nominatim
from geopy.distance import geodesic

import mysql.connector as mysql

def user_completed_trips(user_id: int):
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Database connection failed")
    cursor = conn.cursor(dictionary=True)
    query = """
        SELECT trip_id, location, distance, biscuits, stars
        FROM Trips
        WHERE user_id = %s AND status = 'completed'
        ORDER BY start_time DESC
    """
    try:
        cursor.execute(query, (user_id,))
        trips = cursor.fetchall()
        return trips
    except mysql.Error as e:
        raise HTTPException(status_code=500, detail=f"Database error: {e}")
    finally:
        cursor.close()
        conn.close()

def users_latest_trip(user_id: int):
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Database connection failed")
    cursor = conn.cursor(dictionary=True)
    query = """
        SELECT trip_id, start_time, end_time, 
               ST_X(start_location) as start_lat, ST_Y(start_location) as start_lon,
               ST_X(end_location) as end_lat, ST_Y(end_location) as end_lon,
               status
        FROM Trips
        WHERE user_id = %s
        ORDER BY start_time DESC
        LIMIT 1
    """
    try:
        cursor.execute(query, (user_id,))
        trip = cursor.fetchone()
        if trip is None:
            return None
        details = TripDetails(
            trip_id=trip['trip_id'],
            user_id=user_id,
            start_time=trip['start_time'],
            end_time=trip['end_time'] if trip['status']=='completed' else None,
            start_location=[trip['start_lat'], trip['start_lon']],
            end_location=[trip['end_lat'], trip['end_lon']] if trip['status']=='completed' else None,
            status=trip['status']
        )
        return details
    except mysql.Error as e:
        raise HTTPException(status_code=500, detail=f"Database error: {e}")
    finally:
        cursor.close()
        conn.close()

def create_trip(user_id: int, trip: TripCreate):
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Database connection failed")
    cursor = conn.cursor(dictionary=True)
    query = """
        INSERT INTO Trips (user_id, start_location, end_location)
        VALUES (%s, POINT(%s, %s), POINT(0, 0))
    """ # end_location is initialized to (0, 0), since the trip has not ended yet
    try:
        cursor.execute(query, (
            user_id,
            trip.start_location[0], trip.start_location[1],
        ))
        conn.commit()
        return cursor.lastrowid
    except mysql.Error as e:
        raise HTTPException(status_code=500, detail=f"Database error: {e}")
    finally:
        cursor.close()
        conn.close()

def trip_details(trip_id: int):
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Database connection failed")
    cursor = conn.cursor(dictionary=True)
    query = """
        SELECT ST_X(start_location) as start_lat, ST_Y(start_location) as start_lon, 
               ST_X(end_location) as end_lat, ST_Y(end_location) as end_lon,
               stars, trip_summary
        FROM Trips
        WHERE trip_id = %s
    """
    try:
        cursor.execute(query, (trip_id,))
        trip = cursor.fetchone()
        details = TripDetails(
            trip_id=trip_id,
            start_location=[trip['start_lat'], trip['start_lon']],
            end_location=[trip['end_lat'], trip['end_lon']],
            stars=trip['stars'],
            trip_summary=trip['trip_summary'],
            location_updates=trip_route(trip_id)
        )
        return details
    except mysql.Error as e:
        print(e)
        raise HTTPException(status_code=500, detail=f"Database error: {e}")
    finally:
        cursor.close()
        conn.close()

def trip_route(trip_id: int):
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Database connection failed")
    cursor = conn.cursor(dictionary=True)
    query = """
        SELECT timestamp, ST_X(location) as lat, ST_Y(location) as lon
        FROM location_updates
        WHERE trip_id = %s
    """
    try:
        cursor.execute(query, (trip_id,))
        route: List[List[float]] = []
        for location in cursor.fetchall():
            route.append([location['lat'], location['lon']])
        return route
    except mysql.Error as e:
        raise HTTPException(status_code=500, detail=f"Database error: {e}")
    finally:
        cursor.close()
        conn.close()

def add_location_update(trip_id: int, location: LocationUpdate):
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Database connection failed")
    cursor = conn.cursor()
    query = """
        INSERT INTO location_updates (trip_id, location)
        VALUES (%s, POINT(%s, %s))
    """
    try:
        cursor.execute(query, (
            trip_id,
            location.coordinates[0], location.coordinates[1]
        ))
        conn.commit()
        return "Location update added"
    except mysql.Error as e:
        raise HTTPException(status_code=500, detail=f"Database error: {e}")
    finally:
        cursor.close()
        conn.close()

def last_location_update(trip_id: int):
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Database connection failed")
    cursor = conn.cursor(dictionary=True)
    query = """
        SELECT timestamp, ST_X(location) as lat, ST_Y(location) as lon
        FROM location_updates
        WHERE trip_id = %s
        ORDER BY timestamp DESC
        LIMIT 1
    """
    try:
        cursor.execute(query, (trip_id,))
        location = cursor.fetchone()
        if location is None:
            return None
        return LocationUpdate(
            timestamp=location['timestamp'],
            coordinates=[location['lat'], location['lon']
        ])
    except mysql.Error as e:
        raise HTTPException(status_code=500, detail=f"Database error: {e}")
    finally:
        cursor.close()
        conn.close()

def complete_trip(trip_id: int, tripComplete: TripComplete, user_id: int):
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Database connection failed")
    cursor = conn.cursor()
    query = """
        UPDATE Trips
        SET end_location = POINT(%s, %s), location = %s, distance = %s, biscuits = %s, stars = %s, trip_summary = %s, status = 'completed'
        WHERE trip_id = %s
    """
    try:
        # update the end location
        lat = tripComplete.end_location[0]
        lon = tripComplete.end_location[1]
        # get the location name
        geolocator = Nominatim(user_agent="Pookie")
        location = geolocator.reverse((lat, lon), exactly_one=True).address
        # calulating distance, biscuits and stars, and generating trip summary
        distance = get_trip_distance(trip_id)
        biscuits, stars = calculate_trip_result(distance, tripComplete.harsh_turns_made, tripComplete.harsh_brakes_made, tripComplete.harsh_accelerations_made)
        trip_summary = generate_trip_summary(stars, distance, location, tripComplete.harsh_turns_made, tripComplete.harsh_brakes_made, tripComplete.harsh_accelerations_made)
        # update the trip details
        cursor.execute(query, (
            lat, lon, location, distance, biscuits, stars, trip_summary, trip_id
        ))
        conn.commit()
        # update the user's stats
        userStats = UserStats(
            harsh_turns=tripComplete.harsh_turns_made,
            harsh_brakes=tripComplete.harsh_brakes_made,
            harsh_accelerations=tripComplete.harsh_accelerations_made,
            driver_rating=0
        )
        # update the pookie's stats
        pookieStats = PookieStats(
            biscuits=biscuits,
            xp=biscuits,
        )
        # calls the update functions
        update_user_stats(user_id, userStats)
        update_pookie_stats(user_id, pookieStats)
        return "Trip completed successfully"
    except mysql.Error as e:
        print(e)
        raise HTTPException(status_code=500, detail=f"Database error: {e}")
    finally:
        cursor.close()
        conn.close()

# Calculate the biscuits and stars for a trip based on the distance and faults
def calculate_trip_result(distance: float, harsh_turns: int, harsh_brakes: int, harsh_accelerations: int):
    x = 10
    harsh_actions_per_x_miles = harsh_turns + harsh_brakes + harsh_accelerations / (distance / x)
    if harsh_actions_per_x_miles <= 3:
        base_biscuits = 10
        stars = 5
    elif harsh_actions_per_x_miles <= 6:
        base_biscuits = 5
        stars = 4
    elif harsh_actions_per_x_miles <= 9:
        base_biscuits = 2
        stars = 3
    elif harsh_actions_per_x_miles <= 12:
        base_biscuits = 1
        stars = 2
    else:
        base_biscuits = 0
        stars = 1
    biscuits = max(1, int(base_biscuits * distance / 10))
    return biscuits, stars

# Accumulate the distance of a trip by summing the distances between each pair of consecutive location updates
def get_trip_distance(trip_id: int):
    print("Calculating distance for trip", trip_id)
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Database connection failed")
    cursor = conn.cursor(dictionary=True)
    query = """
        SELECT ST_X(location) as lat, ST_Y(location) as lon
        FROM location_updates
        WHERE trip_id = %s
        ORDER BY timestamp
    """
    try:
        cursor.execute(query, (trip_id,))
        locations = cursor.fetchall()
        if len(locations) < 2:
            return 0
        distance = 0
        for i in range(1, len(locations)):
            start = (locations[i-1]['lat'], locations[i-1]['lon'])
            end = (locations[i]['lat'], locations[i]['lon'])
            distance += geodesic(start, end).meters
        distance_in_miles = distance * 0.000621371;
        return distance_in_miles
    except mysql.Error as e:
        raise HTTPException(status_code=500, detail=f"Database error: {e}")
    finally:
        cursor.close()
        conn.close()