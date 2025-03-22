from flask import Blueprint, request, jsonify
from models.db import get_db_connection
from datetime import datetime, timedelta

reservation_bp = Blueprint("reservations", __name__)

@reservation_bp.route("/GetAllUsers", methods=["GET"])
def get_users():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT Reservations.*, Students.student_name, Seats.row_label, Seats.seat_number, 
                   Timeslots.start_time, Timeslots.end_time 
            FROM Reservations 
            JOIN Students ON Reservations.student_id = Students.student_id 
            JOIN Seats ON Reservations.seat_id = Seats.seat_id 
            JOIN Timeslots ON Reservations.timeslot_id = Timeslots.timeslot_id 
            ORDER BY Reservations.reservation_id;
        """)
        users = cursor.fetchall()
        if not users:
            return jsonify({"error": "查無使用者資料"}), 404
    except Exception as e:
        # 若發生例外，回傳 500 及錯誤訊息
        return jsonify({"error": str(e)}), 500
    finally:
        if conn:
            conn.close()

    # 轉換 datetime/timedelta 型態成字串
    for user in users:
        for key, value in user.items():
            if isinstance(value, (datetime, timedelta)):
                user[key] = str(value)

    return jsonify(users), 200
