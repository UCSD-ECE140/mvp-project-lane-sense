# This file contains the functions to interact with the database for user related operations
from fastapi import HTTPException
from models import UserCreate, UserStats
from security import authenticate_user, create_access_token, get_password_hash
from utils import get_db_connection
from fastapi import HTTPException, status

import mysql.connector as mysql

def user_already_exists(email: str):
    conn = get_db_connection()
    cursor = conn.cursor()
    query = """
        SELECT COUNT(*)
        FROM Users
        WHERE email = %s
    """
    cursor.execute(query, (email,))
    count = cursor.fetchone()[0]
    return count > 0

def create_user(user: UserCreate):
    if user_already_exists(user.email):
        return {"message": "User already exists"}
    conn = get_db_connection()
    cursor = conn.cursor()
    user_query = """
        INSERT INTO Users (username, email, password)
        VALUES (%s, %s, %s)
    """
    pookie_query = """
        INSERT INTO Pookie (user_id, pookie_name)
        VALUES (%s, %s)
    """
    try:
        hashed_password = get_password_hash(user.password)
        cursor.execute(user_query, (user.username, user.email, hashed_password))
        conn.commit()
        new_user_id = cursor.lastrowid
        cursor.execute(pookie_query, (new_user_id, user.username + "'s Pookie"))
        conn.commit()
        return {"message": "User created"}
    except mysql.Error as e:
        raise HTTPException(status_code=500, detail=f"Database error: {e}")
    finally:
        cursor.close()
        conn.close()

def login_user(email: str, password: str):
    user = authenticate_user(email, password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = create_access_token(data={"sub": str(user['user_id'])})
    return {"access_token": access_token, "token_type": "bearer"}

def get_stats(user_id: int):
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Database connection failed")
    pass
    cursor = conn.cursor(dictionary=True)
    query = """
        SELECT harsh_turns, harsh_brakes, harsh_accelerations, driver_rating
        FROM Users
        WHERE user_id = %s
    """
    try:
        cursor.execute(query, (user_id,))
        stats = cursor.fetchone()
        if stats is None:
            raise HTTPException(status_code=404, detail="User not found")
        return UserStats(
            harsh_turns=stats['harsh_turns'],
            harsh_brakes=stats['harsh_brakes'],
            harsh_accelerations=stats['harsh_accelerations'],
            driver_rating=stats['driver_rating'],
        )
    except mysql.Error as e:
        raise HTTPException(status_code=500, detail=f"Database error: {e}")
    finally:
        cursor.close()
        conn.close()

def update_user_stats(user_id: int, stats: UserStats):
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Database connection failed")
    cursor = conn.cursor(dictionary=True)
    fetch_query = """
        SELECT harsh_turns, harsh_brakes, harsh_accelerations, driver_rating
        FROM Users
        WHERE user_id = %s
    """
    update_query = """
        UPDATE Users
        SET harsh_turns = %s, harsh_brakes = %s, harsh_accelerations = %s, driver_rating = %s
        WHERE user_id = %s
    """
    try:
        cursor.execute(fetch_query, (user_id,))
        user_stats = cursor.fetchone()
        if user_stats is None:
            raise HTTPException(status_code=404, detail="User not found")
        new_stats = (
            user_stats['harsh_turns'] + stats.harsh_turns,
            user_stats['harsh_brakes'] + stats.harsh_brakes,
            user_stats['harsh_accelerations'] + stats.harsh_accelerations,
            user_stats['driver_rating'] + stats.driver_rating,
            user_id
        )
        cursor.execute(update_query, new_stats)
        conn.commit()
        return "User stats updated"
    except mysql.Error as e:
        raise HTTPException(status_code=500, detail=f"Database error: {e}")
    finally:
        cursor.close()
        conn.close()