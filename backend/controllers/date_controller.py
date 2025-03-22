from flask import Blueprint, request, jsonify
from models.db import get_db_connection 

date_bp = Blueprint("date", __name__)

@date_bp.route("/GetTimeslotCountByDate", methods=["GET"])
def get_timeslot_count_by_date():
    date_str = request.args.get("date")  # 例如 2025-03-21

    if not date_str:
        return jsonify({"error": "請提供日期，例如 ?date=2025-03-21"}), 400

    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT timeslot_id, COUNT(*) AS count
            FROM Reservations
            WHERE DATE(reservation_date) = %s
            GROUP BY timeslot_id;
        """, (date_str,))
        result = cursor.fetchall()
        if not result:
            return jsonify({"error": "該日期查無預約資料"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if conn:
            conn.close()

    return jsonify(result), 200

@date_bp.route("/GetAvgUsageByDate", methods=["GET"])
def get_avg_usage_by_date():
    date_str = request.args.get("date")  # 例如 ?date=2025-03-21

    if not date_str:
        return jsonify({"error": "請提供日期，例如 ?date=2025-03-21"}), 400

    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # 使用子查詢計算該日每個時段的預約次數，再求平均值
        cursor.execute("""
            SELECT AVG(usage_count) AS avg_usage
            FROM (
                SELECT ts.timeslot_id, COUNT(r.reservation_id) AS usage_count
                FROM Timeslots ts
                LEFT JOIN Reservations r 
                    ON ts.timeslot_id = r.timeslot_id 
                   AND DATE(r.reservation_date) = %s
                GROUP BY ts.timeslot_id
            ) AS sub;
        """, (date_str,))

        result = cursor.fetchone()
        if not result or result['avg_usage'] is None:
            # 如果查無資料，回傳 0 或其他預設值
            return jsonify({"avg_usage": 0}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if conn:
            conn.close()

    return jsonify(result), 200

@date_bp.route("/DeleteDataByDate", methods=["DELETE"])
def delete_data_by_date():
    date_str = request.args.get("date")  # 例如 ?date=2025-03-21

    if not date_str:
        return jsonify({"error": "請提供日期，例如 ?date=2025-03-21"}), 400

    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        # 根據輸入的日期刪除該日期之前的所有預約紀錄
        cursor.execute("""
            DELETE FROM Reservations
            WHERE DATE(reservation_date) < %s
        """, (date_str,))
        conn.commit()  # 提交更動

        return jsonify({
            "message": f"已刪除所有在 {date_str} 之前的預約紀錄",
            "affected_rows": cursor.rowcount
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if conn:
            conn.close()