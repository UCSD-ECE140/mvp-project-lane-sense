# This file contains the functions to interact with the database for user related operations
from fastapi import HTTPException
from models import PookieDetails, PookieStats
from security import authenticate_user, create_access_token, get_password_hash
from utils import get_db_connection
from fastapi import HTTPException, status

import mysql.connector as mysql

def pookie_details(user_id: int):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    query = """
        SELECT pookie_name, level, biscuits, xp
        FROM Pookie
        WHERE user_id = %s
    """
    try:
        cursor.execute(query, (user_id,))
        pookie = cursor.fetchone()
        if pookie is None:
            return None
        details = PookieDetails(
            pookie_name=pookie['pookie_name'],
            level=pookie['level'],
            biscuits=pookie['biscuits'],
            xp=pookie['xp']
        )
        return details
    except mysql.Error as e:
        raise HTTPException(status_code=500, detail=f"Database error: {e}")
    finally:
        cursor.close()
        conn.close()

def update_pookie_stats(user_id: int, stats: PookieStats):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    curent_stats_query = """
        SELECT level, xp
        FROM Pookie
        WHERE user_id = %s
    """
    update_query = """
        UPDATE Pookie
        SET level = %s, xp = %s, biscuits = biscuits + %s
        WHERE user_id = %s
    """
    try:
        # Get the current stats
        cursor.execute(curent_stats_query, (user_id,))
        current_stats = cursor.fetchone()
        current_level = current_stats['level']
        current_xp = current_stats['xp']
        # Calculate the new stats
        levels_gained, remaining_xp = calculate_gained_levels(current_level, current_xp + stats.xp)
        cursor.execute(update_query, (current_level + levels_gained, remaining_xp, stats.biscuits, user_id))
        conn.commit()
        return "Stats updated"
    except mysql.Error as e:
        raise HTTPException(status_code=500, detail=f"Database error: {e}")
    finally:
        cursor.close()
        conn.close()

def calculate_gained_levels(level:int, xp: int):
    if xp < 100:
        return 0, xp
    else:
        levels_gained = xp // 100
        xp -= 100 * levels_gained
        return level + levels_gained, xp