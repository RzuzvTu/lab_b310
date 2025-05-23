from flask import Blueprint, request, jsonify
import bcrypt
from models.db import get_db_connection

user_bp = Blueprint("users", __name__)

@user_bp.route("register", methods=["POST"])
def register():
    data = request.get_json()
    student_id = data.get("student_id")
    account_name = data.get("account_name")
    password = data.get("password")

    if not all([student_id, account_name, password]):
        return jsonify({"error": "缺少必要欄位"}), 400

    password_hash = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("SELECT * FROM Students WHERE student_id = %s", (student_id,))
        if not cursor.fetchone():
            return jsonify({"error": "找不到目標學號"}), 404

        cursor.execute("SELECT * FROM StudentAccounts WHERE account_name = %s OR student_id = %s", (account_name, student_id))
        if cursor.fetchone():
            return jsonify({"error": "帳號或學號已存在"}), 409

        cursor.execute("""
            INSERT INTO StudentAccounts (student_id, account_name, password_hash)
            VALUES (%s, %s, %s)
        """, (student_id, account_name, password_hash))
        conn.commit()
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if conn:
            conn.close()

    return jsonify({"message": "註冊成功"}), 201

@user_bp.route("login", methods=["POST"])
def login():
    data = request.get_json()
    account_name = data.get("account_name")
    password = data.get("password")

    if not all ([account_name, password]):
        return jsonify({"error": "缺少帳號或密碼"}), 400
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("SELECT * FROM StudentAccounts WHERE account_name = %s", (account_name,))
        user = cursor.fetchone()

        if not user or not bcrypt.checkpw(password.encode("utf-8"), user["password_hash"].encode("utf-8")):
            return jsonify({"error": "帳號或密碼錯誤"}), 401
        
        return jsonify({
            "message": "登入成功",
            "user" : user["student_id"]
            }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if conn:
            conn.close()

@user_bp.route("logout", methods=["POST"])
def logout():
    pass

@user_bp.route("updatePassword", methods=["PUT"])
def update_password():
    data = request.get_json()
    account_name = data.get("account_name")
    old_password = data.get("old_password")
    new_password = data.get("new_password")

    if not all([account_name, old_password, new_password]):
        return jsonify({"error": "缺少必要欄位"}), 400

    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("SELECT * FROM StudentAccounts WHERE account_name = %s", (account_name,))
        row = cursor.fetchone()
        if not row:
            return jsonify({"error": "找不到帳號"}), 404

        user = row

        stored_hash = user["password_hash"]
        if not stored_hash or not stored_hash.startswith("$2"):
            return jsonify({"error": "密碼資料格式錯誤"}), 500

        if not bcrypt.checkpw(old_password.encode("utf-8"), stored_hash.encode("utf-8")):
            return jsonify({"error": "舊密碼錯誤"}), 401

        new_password_hash = bcrypt.hashpw(new_password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
        cursor.execute("UPDATE StudentAccounts SET password_hash = %s WHERE account_name = %s", (new_password_hash, account_name))
        conn.commit()
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if conn:
            conn.close()

    return jsonify({"message": "密碼更新成功"}), 200