# Necessary Imports
from typing import List
from fastapi import Depends, FastAPI                        # The main FastAPI import
from fastapi.responses import JSONResponse                  # Used for returning HTML responses
from fastapi.staticfiles import StaticFiles                 # Used for serving static files
import uvicorn                                              # Used for running the app                                             

from models import PookieDetails, RecentTripDetails, Token, TripComplete, UserCreate, UserLogin, UserStats, TripDetails, TripCreate, LocationUpdate, FriendRequest, FriendResponse
from pookie import pookie_details, update_pookie_details
from security import verify_token
from users import create_user, get_stats, login_user, update_user_stats
from trips import add_location_update, complete_trip, create_trip, trip_details, trip_route, user_completed_trips, users_latest_trip
from friends import accept_friend_request, reject_friend_request, send_friend_request

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
async def get_user_stats(user_id: int = Depends(verify_token)):
    stats = get_stats(user_id)
    return stats

# Update user stats with new values to add
@app.put("/user/stats", response_class=JSONResponse)
async def put_user_stats(stats: UserStats, user_id: int = Depends(verify_token)):
    message = update_user_stats(user_id, stats)
    return JSONResponse(content={"message": message})

# Get a list of all a user's completed trips with details of each
@app.get("/user/recent_trips", response_model=List[RecentTripDetails])
async def get_user_completed_trips(user_id: int = Depends(verify_token)):
    completed_trips = user_completed_trips(user_id)
    return completed_trips

# Get a user's most recent completed trip
@app.get("/user/latest_trip", response_model=TripDetails|None)
async def get_latest_trip(user_id: int = Depends(verify_token)):
    latest_trip = users_latest_trip(user_id)
    return latest_trip

# Get a user's friend requests
@app.get("/user/friend_requests", response_model=List[FriendRequest])
async def get_friend_requests(user_id: int = Depends(verify_token)):
    requests = get_friend_requests(user_id)
    return requests

# Gets a user's friends via a list of IDs
@app.get("/user/friends", response_model=List[int])
async def get_friends(user_id: int = Depends(verify_token)):
    friend_ids = get_friends(user_id)
    return friend_ids

### Pookie Endpoints ###

# Get a user's pookie details
@app.get("/pookie/details", response_model=PookieDetails)
async def get_pookie_details(user_id: int = Depends(verify_token)):
    details = pookie_details(user_id)
    return details

# Update a user's pookie details
@app.put("/pookie/details", response_class=JSONResponse)
async def put_pookie_details(details: PookieDetails, user_id: int = Depends(verify_token)):
    message = update_pookie_details(user_id, details)
    return JSONResponse(content={"message": message})

### Trip Endpoints ###

# Create a new trip under a user
@app.post("/trip/create", response_class=JSONResponse)
async def post_new_trip(trip: TripCreate, user_id: int = Depends(verify_token)):
    new_trip_id = create_trip(user_id, trip)
    return JSONResponse(content={"trip_id": new_trip_id})

# Get details of a trip
@app.get("/trip/{trip_id}/details", response_model=TripDetails)
async def get_trip_details(trip_id: int, user_id: int = Depends(verify_token)):
    details = trip_details(trip_id)
    return details    

# Get a list of points corresponding to the route of a trip
@app.get("/trip/{trip_id}/route", response_model=List[LocationUpdate])
async def get_trip_route(trip_id: int, user_id: int = Depends(verify_token)):
    route = trip_route(trip_id)
    return route

# Add a new location update point to a trip
@app.post("/trip/{trip_id}/location_update", response_class=JSONResponse)
async def post_location_update(trip_id: int, location: LocationUpdate, user_id: int = Depends(verify_token)):
    message = add_location_update(trip_id, location)
    return JSONResponse(content={"message": message})

# Complete a trip
@app.put("/trip/{trip_id}/complete", response_class=JSONResponse)
async def put_trip_complete(trip_id: int, tripComplete: TripComplete, user_id: int = Depends(verify_token)):
    message = complete_trip(trip_id, tripComplete)
    return JSONResponse(content={"message": message})

### Friend Endpoints ###

# Make a friend request
@app.post("/friend/request", response_class=JSONResponse)
async def post_friend_request(request: FriendRequest, user_id: int = Depends(verify_token)):
    new_friendship_id = send_friend_request(request)
    return JSONResponse(content={"friendship_id": new_friendship_id})

# Accept a friend request
@app.put("/friend/accept", response_class=JSONResponse)
async def put_friend_request(response: FriendResponse, user_id: int = Depends(verify_token)):
    message = accept_friend_request(response)
    return JSONResponse(content={"message": message})

# Reject a friend request
@app.put("/friend/reject", response_class=JSONResponse)
async def put_friend_request(response: FriendResponse, user_id: int = Depends(verify_token)):
    message = reject_friend_request(response)
    return JSONResponse(content={"message": message})

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=6543)