from fastapi import HTTPException
from models import FriendRequest, FriendResponse
from utils import get_db_connection

import mysql.connector as mysql

def send_friend_request(request: FriendRequest):
    conn = get_db_connection()
    cursor = conn.cursor()
    query = """
        INSERT INTO Friends (user_id, friend_id, status)
        VALUES (%s, %s, 'pending')
    """
    try:
        cursor.execute(query, (request.user_id, request.friend_id))
        conn.commit()
        return cursor.lastrowid
    except mysql.Error as e:
        raise HTTPException(status_code=500, detail=f"Database error: {e}")
    finally:
        cursor.close()
        conn.close()

def accept_friend_request(response: FriendResponse):
    conn = get_db_connection()
    cursor = conn.cursor()
    query = """
        UPDATE Friends
        SET status = 'accepted'
        WHERE user_id = %s AND friend_id = %s
    """
    try:
        cursor.execute(query, (response.user_id, response.friend_id))
        conn.commit()
        return "Friend request accepted successfully"
    except mysql.Error as e:
        raise HTTPException(status_code=500, detail=f"Database error: {e}")
    finally:
        cursor.close()
        conn.close()

def reject_friend_request(response: FriendResponse):
    conn = get_db_connection()
    cursor = conn.cursor()
    query = """
        UPDATE Friends
        SET status = 'rejected'
        WHERE user_id = %s AND friend_id = %s
    """
    try:
        cursor.execute(query, (response.user_id, response.friend_id))
        conn.commit()
        return "Friend request rejected successfully"
    except mysql.Error as e:
        raise HTTPException(status_code=500, detail=f"Database error: {e}")
    finally:
        cursor.close()
        conn.close()

def get_friend_requests(user_id: int):
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Database connection failed")
    cursor = conn.cursor(dictionary=True)
    query = """
        SELECT user_id, friend_id
        FROM Friends
        WHERE friend_id = %s AND status = 'pending'
    """
    try:
        cursor.execute(query, (user_id,))
        return cursor.fetchall()
    except mysql.Error as e:
        raise HTTPException(status_code=500, detail=f"Database error: {e}")
    finally:
        cursor.close()
        conn.close()

def get_friends(user_id: int):
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Database connection failed")
    cursor = conn.cursor(dictionary=True)
    query = """
        SELECT user_id, friend_id, status
        FROM Friends
        WHERE user_id = %s AND status = 'accepted'
    """
    try:
        cursor.execute(query, (user_id,))
        return cursor.fetchall()
    except mysql.Error as e:
        raise HTTPException(status_code=500, detail=f"Database error: {e}")
    finally:
        cursor.close()
        conn.close()