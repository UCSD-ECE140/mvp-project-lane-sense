# Necessary Imports
from typing import List
from fastapi import Depends, FastAPI, HTTPException                  # The main FastAPI import
from fastapi.responses import JSONResponse                  # Used for returning HTML responses
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.staticfiles import StaticFiles                 # Used for serving static files
import uvicorn                                              # Used for running the app                                             

from models import Token, UserCreate, UserLogin, UserStats, TripDetails, TripCreate, LocationUpdate, FriendRequest, FriendResponse
from security import authenticate_user, create_access_token, get_current_user, verify_token
from users import create_user, get_stats, login_user, update_user_stats
from trips import add_location_update, complete_trip, create_trip, trip_details, trip_route, user_trips, users_latest_trip
from friends import accept_friend_request, reject_friend_request, send_friend_request
from fastapi import status

# Configuration
app = FastAPI()
#app.mount("/static", StaticFiles(directory="static"), name="static")

# Test endpoint
@app.get("/test", response_class=JSONResponse)
async def test_get(request):
    return JSONResponse(content={"message": f"The request was {request}"})

### User Endpoints ###

# Create a new user
@app.post("/user/create", response_class=JSONResponse)
async def post_new_user(user: UserCreate):
    new_user_data = create_user(user)
    return JSONResponse(content=new_user_data)

# User login endpoint, returns an access token and user ID
@app.post("/user/login", response_class=JSONResponse)
async def login_for_access_token(form_data: UserLogin):
    result = login_user(form_data.email, form_data.password)
    return JSONResponse(content=result)

@app.post("/token/verify")
async def verify_token_endpoint(token: Token):
    result = verify_token(token.access_token)
    return JSONResponse(content={"valid": result})

# Get user stats
@app.get("/user/stats", response_model=UserStats)
async def get_user_stats(user_id: int = Depends(get_current_user)):
    stats = get_stats(user_id)
    return stats

# Update user stats with new values to add
@app.put("/user/{user_id}/stats", response_class=JSONResponse)
async def put_user_stats(user_id: int, stats: UserStats):
    message = update_user_stats(user_id, stats)
    return JSONResponse(content={"message": message})

# Get IDs of all trips for a given user, in sorted order
@app.get("/user/{user_id}/trips", response_model=List[int])
async def get_user_trips(user_id: int):
    trips = user_trips(user_id)
    return trips

# Get a user's most recent completed trip
@app.get("/user/{user_id}/latest_trip", response_model=TripDetails|None)
async def get_latest_trip(user_id: int):
    latest_trip = users_latest_trip(user_id)
    return latest_trip

# Get a user's friend requests
@app.get("/user/{user_id}/friend_requests", response_model=List[FriendRequest])
async def get_friend_requests(user_id: int):
    requests = get_friend_requests(user_id)
    return requests

# Gets a user's friends via a list of IDs
@app.get("/user/{user_id}/friends", response_model=List[int])
async def get_friends(user_id: int):
    friend_ids = get_friends(user_id)
    return friend_ids

### Trip Endpoints ###

# Create a new trip under a user
@app.post("/trip/{user_id}/create", response_class=JSONResponse)
async def post_new_trip(user_id, trip: TripCreate):
    new_trip_id = create_trip(user_id, trip)
    return JSONResponse(content={"trip_id": new_trip_id})

# Get details of a trip
@app.get("/trip/{trip_id}/details", response_model=TripDetails)
async def get_trip_details(trip_id: int):
    details = trip_details(trip_id)
    return details    

# Get a list of points corresponding to the route of a trip
@app.get("/trip/{trip_id}/route", response_model=List[LocationUpdate])
async def get_trip_route(trip_id: int):
    route = trip_route(trip_id)
    return route

# Add a new location update point to a trip
@app.post("/trip/{trip_id}/route", response_class=JSONResponse)
async def post_location_update(trip_id: int, location: LocationUpdate):
    message = add_location_update(trip_id, location)
    return JSONResponse(content={"message": message})

# Complete a trip
@app.put("/trip/{trip_id}/complete", response_class=JSONResponse)
async def put_trip_complete(trip_id: int):
    message = complete_trip(trip_id)
    return JSONResponse(content={"message": message})

### Friend Endpoints ###

# Make a friend request
@app.post("/friend/request", response_class=JSONResponse)
async def post_friend_request(request: FriendRequest):
    new_friendship_id = send_friend_request(request)
    return JSONResponse(content={"friendship_id": new_friendship_id})

# Accept a friend request
@app.put("/friend/accept", response_class=JSONResponse)
async def put_friend_request(response: FriendResponse):
    message = accept_friend_request(response)
    return JSONResponse(content={"message": message})

# Reject a friend request
@app.put("/friend/reject", response_class=JSONResponse)
async def put_friend_request(response: FriendResponse):
    message = reject_friend_request(response)
    return JSONResponse(content={"message": message})

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=6543)