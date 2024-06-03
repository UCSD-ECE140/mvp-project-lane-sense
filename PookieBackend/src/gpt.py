from openai import OpenAI
import os
from dotenv import load_dotenv

load_dotenv()

client = OpenAI(
    api_key=os.environ.get("OPENAI_API_KEY"),
)

def generate_trip_summary(rating, distance, location, harsh_turns, harsh_brakes, harsh_accelerations):
    messages = [
        {"role": "system", "content": "You are a trip summary assistant."},
        {"role": "user", "content": (
            f"Generate a trip summary for the driving experience of a driving buddy named Pookie. Based on my driving performance.\n"
            f"Pookie is a device that records driving data for a trip. And reacts to my driving with facial expressions.\n"
            f"The trip details are as follows:\n"
            f"Rating: {rating} out of 5 stars\n"
            f"Distance: {distance} miles\n"
            f"Location: {location}\n"
            f"Harsh turns made: {harsh_turns}\n"
            f"Harsh brakes made: {harsh_brakes}\n"
            f"Harsh accelerations made: {harsh_accelerations}\n"
            f"Include some humor and feedback for improving the driving. "
            f"General example for a low rated trip: Pookie travelled 20 miles to visit Coronado Island. "
            f"Pookie ABHORRED this bumpy ride and couldn't enjoy any of the scenery. Drive better, for Pookie's sake!!!"
        )}
    ]
    completion = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=messages,
        max_tokens=300,
    )
    trip_summary = completion.choices[0].message.content.strip()
    return trip_summary