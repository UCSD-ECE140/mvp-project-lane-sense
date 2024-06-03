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
    harsh_accelerations: int
    driver_rating: int

class PookieDetails(BaseModel):
    pookie_name: str
    level: int
    biscuits: int
    xp: int

class PookieStats(BaseModel):
    biscuits: int
    xp: int

class TripCreate(BaseModel):
    start_location: List[float]

class LocationUpdate(BaseModel):
    coordinates: List[float]

class RecentTripDetails(BaseModel):
    trip_id: int
    location: str
    distance: float
    biscuits: int
    stars: int

class TripDetails(BaseModel):
    start_location: List[float]
    end_location: List[float]
    stars: int
    trip_summary: str
    location_updates: List[List[float]]

class TripComplete(BaseModel):
    end_location: List[float]
    harsh_turns_made: int
    harsh_brakes_made: int
    harsh_accelerations_made: int

class FriendRequest(BaseModel):
    user_id: int
    friend_id: int

class FriendResponse(BaseModel):
    user_id: int
    friend_id: int