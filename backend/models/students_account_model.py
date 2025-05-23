from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class StudentAccount(db.Model):
    __tablename__ = 'StudentAccounts'

    user_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    student_id = db.Column(db.String(10), db.ForeignKey('Students.student_id'), unique=True, nullable=False)
    account_name = db.Column(db.String(50), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    create_time = db.Column(db.DateTime, default=datetime.utcnow)