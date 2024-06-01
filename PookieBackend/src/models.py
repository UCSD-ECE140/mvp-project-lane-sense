from datetime import datetime
from pydantic import BaseModel
from typing import List

class UserCreate(BaseModel):
    username: str
    email: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class Token(BaseModel):
    access_token: str

class UserStats(BaseModel):
    harsh_turns: int
    harsh_brakes: int
    fast_accelerations: int
    driver_rating: int

class PookieDetails(BaseModel):
    pookie_name: str
    level: int
    biscuits: int
    xp: int

class TripCreate(BaseModel):
    start_location: List[float]

class LocationUpdate(BaseModel):
    coordinates: List[float]
    timestamp: datetime

class TripDetails(BaseModel):
    trip_id: int
    user_id: int
    start_time: datetime
    end_time: datetime|None
    start_location: List[float]
    end_location: List[float]|None
    status: str
    rating: int
    rewards: int

class FriendRequest(BaseModel):
    user_id: int
    friend_id: int

class FriendResponse(BaseModel):
    user_id: int
    friend_id: int