# This file contains the functions that interact with the database to get information about trips
from fastapi import HTTPException
from models import LocationUpdate, TripComplete, TripCreate, TripDetails, UserStats
from utils import get_db_connection
from geopy import Nominatim

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
        SELECT trip_id, user_id, start_time, end_time,
                ST_X(start_location) as start_lat, ST_Y(start_location) as start_lon,
                ST_X(end_location) as end_lat, ST_Y(end_location) as end_lon,
                status, location, distance, biscuits, stars
        FROM Trips
        WHERE trip_id = %s
    """
    try:
        cursor.execute(query, (trip_id,))
        trip = cursor.fetchone()
        details = """ TripDetails(
            trip_id=trip['trip_id'],
            user_id=trip['user_id'],
            start_time=trip['start_time'],
            end_time=trip['end_time'],
            start_location=[trip['start_lat'], trip['start_lon']],
            end_location=[trip['end_lat'], trip['end_lon']],
            status=trip['status'],
            location=trip['location'],
            distance=trip['distance'],
            biscuits=trip['biscuits'],
            stars=trip['stars']
        ) """
        return details
    except mysql.Error as e:
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
        route = []
        for location in cursor.fetchall():
            route.append(LocationUpdate(
                timestamp=location['timestamp'],
                coordinates=[location['lat'], location['lon']]
            ))
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

def complete_trip(trip_id: int, tripComplete: TripComplete):
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Database connection failed")
    cursor = conn.cursor()
    query = """
        UPDATE Trips
        SET end_time = %s, end_location = POINT(%s, %s), status = 'completed',
            location = %s, distance = %s, biscuits = %s, stars = %s
        WHERE trip_id = %s
    """
    try:
        # take the end location from the request if it is provided
        last_update = tripComplete.end_location
        if last_update is None:
            # otherwise, get the last location update from the database
            last_update = last_location_update(trip_id)
        # get a name of the location
        lat = last_update.coordinates[0]
        lon = last_update.coordinates[1]
        geolocator = Nominatim(user_agent="Pookie")
        location = geolocator.reverse((lat, lon), exactly_one=True).address
        # calculate distance, biscuits, and stars
        distance = get_trip_distance(trip_id)
        # just giving one for now, will calculate properly later
        biscuits = 1
        stars = 1 
        cursor.execute(query, (
            last_update.timestamp, last_update.coordinates[0], last_update.coordinates[1],
            location, distance, biscuits, stars,
        ))
        conn.commit()
        # update the user's stats
        """ userStats = UserStats(
            harsh_turns=tripComplete.harsh_turns_made,
            harsh_brakes=tripComplete.harsh_brakes_made,
            harsh_accelerations=tripComplete.harsh_accelerations_made,
        )
        update_user_stats(trip_id, tripComplete) """
        return "Trip completed successfully"
    except mysql.Error as e:
        raise HTTPException(status_code=500, detail=f"Database error: {e}")
    finally:
        cursor.close()
        conn.close()

def get_trip_distance(trip_id: int):
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Database connection failed")
    cursor = conn.cursor()
    query = """
        SELECT ST_Distance_Sphere(start_location, end_location) AS distance
        FROM Trips
        WHERE trip_id = %s
    """
    try:
        cursor.execute(query, (trip_id,))
        distance = cursor.fetchone()
        return distance[0]
    except mysql.Error as e:
        raise HTTPException(status_code=500, detail=f"Database error: {e}")
    finally:
        cursor.close()
        conn.close()