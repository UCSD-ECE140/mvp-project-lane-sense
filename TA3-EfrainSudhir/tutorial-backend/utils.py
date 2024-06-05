import os # Used for accessing env variables
from dotenv import load_dotenv

import mysql.connector as mysql

load_dotenv()

# Read Database connection variables
db_host = "localhost"
db_user = "root"
db_pass = os.environ['MYSQL_ROOT_PASSWORD']
db_name = os.environ['MYSQL_DATABASE']

# MySQL database connection
def get_db_connection():
    try:
        connection = mysql.connect(
            host=db_host,
            database=db_name,
            user=db_user,
            password=db_pass
        )
        if connection.is_connected():
            return connection
    except mysql.Error as e:
        print(f"Error: {e}")
        return None