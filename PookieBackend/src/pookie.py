# This file contains the functions to interact with the database for user related operations
from fastapi import HTTPException
from models import PookieDetails
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

def update_pookie_details(user_id: int, pookieDetails: PookieDetails):
    conn = get_db_connection()
    cursor = conn.cursor()
    query = """
        UPDATE Pookie
        SET pookie_name = %s, level = %s, biscuits = %s, xp = %s
        WHERE user_id = %s
    """
    try:
        cursor.execute(query, (pookieDetails.pookie_name, pookieDetails.level, pookieDetails.biscuits, pookieDetails.xp, user_id))
        conn.commit()
        return {"message": "Pookie updated"}
    except mysql.Error as e:
        raise HTTPException(status_code=500, detail=f"Database error: {e}")
    finally:
        cursor.close()
        conn.close()