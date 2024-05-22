from datetime import datetime, timedelta, UTC
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import HTTPException, status
from fastapi.security import OAuth2PasswordBearer
import os
from dotenv import load_dotenv

from utils import get_db_connection

load_dotenv()

# Secret key to encode JWT tokens (you should use a secure, random value)
SECRET_KEY = os.environ["SECRET_KEY"]
ALGORITHM = os.environ["ALGORITHM"]
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.environ["ACCESS_TOKEN_EXPIRE_MINUTES"])

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# OAuth2 scheme
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(UTC) + expires_delta
    else:
        expire = datetime.now(UTC) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def authenticate_user(email: str, password: str):
    # This function should check the user credentials
    # and return the user object if successful
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    query = """
        SELECT id, username, email, password
        FROM Users
        WHERE email = %s
    """
    cursor.execute(query, (email,))
    user = cursor.fetchone()
    if user and verify_password(password, user['password']):
        return user
    return None

def verify_token(token: str):
    # This function should verify the token, by decoding the user_id from it,
    # and checking if the user_id exists in the database
    try:
        print(token)
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        print("gets here 1")
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=400, detail="Invalid token")
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        query = """
            SELECT EXISTS(SELECT 1 FROM Users WHERE user_id = %s) AS id_exists;
        """
        print("gets here 2")
        cursor.execute(query, (user_id,))
        result = cursor.fetchone()
        if not result['id_exists']:
            raise HTTPException(status_code=404, detail="User not found")
        print("gets here 3")
        return result['id_exists']
    except JWTError as e:
        print(e)
        raise HTTPException(status_code=401, detail="Invalid token")
