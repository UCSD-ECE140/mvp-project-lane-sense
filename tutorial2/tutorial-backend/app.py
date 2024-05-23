from fastapi import FastAPI, HTTPException, status
from pydantic import BaseModel
from fastapi.responses import JSONResponse
import uvicorn

from utils import get_db_connection
from security import create_access_token, get_password_hash
import mysql.connector as mysql

app = FastAPI()

class UserCreate(BaseModel):
    name: str
    email: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

@app.post("/user/create", response_class=JSONResponse)
async def create_user(user: UserCreate):
    conn = get_db_connection()
    cursor = conn.cursor()
    query = """
        INSERT INTO Users (username, email, password)
        VALUES (%s, %s, %s)
    """
    try:
        hashed_password = get_password_hash(user.password)
        cursor.execute(query, (user.username, user.email, hashed_password))
        conn.commit()
        user_id = cursor.lastrowid
        access_token = create_access_token(data={"sub": str(user_id)})
        return {"access_token": access_token, "token_type": "bearer"}
    except mysql.Error as e:
        raise HTTPException(status_code=500, detail=f"Database error: {e}")
    finally:
        cursor.close()
        conn.close()

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=6543)
    