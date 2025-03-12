from flask import Blueprint, request, jsonify
from models.db import get_db_connection
from datetime import datetime, timedelta

user_bp = Blueprint("user", __name__)

@user_bp.route("/users", methods=["GET"])
def get_users():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT Reservations.*, Students.student_name, Seats.row_label, Seats.seat_number, 
               Timeslots.start_time, Timeslots.end_time 
        FROM Reservations 
        JOIN Students ON Reservations.student_id = Students.student_id 
        JOIN Seats ON Reservations.seat_id = Seats.seat_id 
        JOIN Timeslots ON Reservations.timeslot_id = Timeslots.timeslot_id 
        ORDER BY Reservations.reservation_id;""")
    
    users = cursor.fetchall()
    conn.close()

    for user in users:
        for key, value in user.items():
            if isinstance(value, (datetime, timedelta)):
                user[key] = str(value) 

    return jsonify(users)