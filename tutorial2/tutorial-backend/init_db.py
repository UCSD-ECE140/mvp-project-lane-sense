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
cursor.execute("DROP TABLE IF EXISTS Users;")
try:
    cursor.execute("""
        CREATE TABLE Users (
            user_id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(100) NOT NULL,
            email VARCHAR(100) UNIQUE NOT NULL,
            password VARCHAR(100) NOT NULL
        );
    """)
except RuntimeError as err:
   print("runtime error: {0}".format(err))
# Commit changes and close database connection
db.commit()
db.close()