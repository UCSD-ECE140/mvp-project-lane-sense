# Add the necessary imports
import mysql.connector as mysql
import os
from dotenv import load_dotenv

load_dotenv()

# Read Database connection variables
db_host = "localhost"
db_user = "root"
db_pass = os.environ['MYSQL_ROOT_PASSWORD']

# Connect to the db and create a cursor object
db = mysql.connect(user=db_user, password=db_pass, host=db_host)
cursor = db.cursor()

# Delete the database if it already exists
cursor.execute("DROP DATABASE IF EXISTS `my-database`;")

# Create Database if it does not exist yet, and use it
cursor.execute("CREATE DATABASE IF NOT EXISTS `my-database`;")
cursor.execute("USE `my-database`;")

# Initialize table and load data
cursor.execute("DROP TABLE IF EXISTS Friends;")
cursor.execute("DROP TABLE IF EXISTS location_updates;")
cursor.execute("DROP TABLE IF EXISTS Trips;")
cursor.execute("DROP TABLE IF EXISTS Users;")

try:
    cursor.execute("""
        CREATE TABLE Users (
            user_id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(100) NOT NULL,
            email VARCHAR(100) UNIQUE NOT NULL,
            password VARCHAR(100) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            harsh_turns INT DEFAULT 0,
            harsh_brakes INT DEFAULT 0,
            harsh_accelerations INT DEFAULT 0,
            driver_rating INT DEFAULT 0
        );
    """)
    cursor.execute("""
        CREATE TABLE Pookie (
            pookie_id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            pookie_name VARCHAR(100) NOT NULL,
            level INT DEFAULT 1,
            biscuits INT DEFAULT 0,
            xp INT DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES Users(user_id)
        );           
    """)
    cursor.execute("""
        CREATE TABLE Trips (
            trip_id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            end_time TIMESTAMP NULL,
            start_location POINT NOT NULL,
            end_location POINT NOT NULL,
            status ENUM('active', 'completed') DEFAULT 'active',
            location VARCHAR(256) NULL DEFAULT '',
            distance FLOAT NULL DEFAULT 0.0,
            biscuits INT NULL DEFAULT 0,
            stars INT NULL DEFAULT 0,
            FOREIGN KEY (user_id) REFERENCES Users(user_id),
            SPATIAL INDEX (start_location),
            SPATIAL INDEX (end_location)
        );
    """)
    cursor.execute("""
        CREATE TABLE location_updates (
            update_id INT AUTO_INCREMENT PRIMARY KEY,
            trip_id INT NOT NULL,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            location POINT NOT NULL,
            FOREIGN KEY (trip_id) REFERENCES Trips(trip_id),
            SPATIAL INDEX (location)
        );
    """)
    cursor.execute("""
        CREATE TABLE Friendships (
            friendship_id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            friend_id INT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            status ENUM('pending', 'accepted', 'rejected') DEFAULT 'pending',
            FOREIGN KEY (user_id) REFERENCES Users(user_id),
            FOREIGN KEY (friend_id) REFERENCES Users(user_id)
        );
    """)

except RuntimeError as err:
   print("runtime error: {0}".format(err))

# Commit changes and close database connection
db.commit()
db.close()