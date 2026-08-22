"""
employee-backend/app.py

Owns: /auth/login (shared, but hosted here for now until core/ is ready),
      /employee/* routes

Imports shared DB models from core/ once Person 3 has that ready.
For now this file is self-contained with its own SQLAlchemy models
so you can build + test independently. Swap the model import for
`from core.models import ...` once core/ exists — keep field names
identical so nothing else breaks.
"""

from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
import jwt
import datetime
import sys
import os
from functools import wraps
from werkzeug.security import generate_password_hash, check_password_hash

CORE_PATH = os.path.join(os.path.dirname(__file__), "..", "core")
sys.path.append(CORE_PATH)                              # lets us import qr as a proper package
sys.path.append(os.path.join(CORE_PATH, "attendance"))  # attendance/ files use flat imports internally

from qr.qr_service import QRService
from attendance_service import AttendanceService
from datetime import time as dtime

attendance_service = AttendanceService()
qr_service = QRService() 
COMPANY_START_TIME = dtime(9, 0)  # 9:00 AM — adjust if your team picks a different time


app = Flask(__name__)
CORS(app)
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///dayflow.db"
app.config["SECRET_KEY"] = "hackathon-secret-change-me"  # fine for a 6hr demo

db = SQLAlchemy(app)

# ---------------- Models (temporary — replace with core.models import) ----------------

class Employee(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    emp_id = db.Column(db.String(20), unique=True, nullable=False)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(200), nullable=False)
    role = db.Column(db.String(20), nullable=False)  # "employee" | "hr"
    department = db.Column(db.String(100))
    designation = db.Column(db.String(100))
    basic_salary = db.Column(db.Float, default=0)
    hra = db.Column(db.Float, default=0)
    allowances = db.Column(db.Float, default=0)
    deductions = db.Column(db.Float, default=0)


class LeaveRequest(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    employee_id = db.Column(db.Integer, db.ForeignKey("employee.id"), nullable=False)
    leave_type = db.Column(db.String(20))  # paid | sick | unpaid
    start_date = db.Column(db.Date)
    end_date = db.Column(db.Date)
    days = db.Column(db.Integer)
    reason = db.Column(db.String(500))
    status = db.Column(db.String(20), default="pending")  # pending | approved | rejected
    decided_type = db.Column(db.String(20))
    hr_comment = db.Column(db.String(500))
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)


# ---------------- Auth helpers ----------------

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get("Authorization", "")
        if not auth_header.startswith("Bearer "):
            return jsonify({"error": "Missing token"}), 401
        token = auth_header.split(" ")[1]
        try:
            payload = jwt.decode(token, app.config["SECRET_KEY"], algorithms=["HS256"])
            request.employee_id = payload["employee_id"]
            request.role = payload["role"]
        except jwt.ExpiredSignatureError:
            return jsonify({"error": "Token expired"}), 401
        except jwt.InvalidTokenError:
            return jsonify({"error": "Invalid token"}), 401
        return f(*args, **kwargs)
    return decorated


# ---------------- Auth routes ----------------

@app.route("/api/auth/login", methods=["POST"])
def login():
    data = request.json
    emp = Employee.query.filter_by(email=data.get("email")).first()
    if not emp or not check_password_hash(emp.password_hash, data.get("password", "")):
        return jsonify({"error": "Invalid credentials"}), 401

    token = jwt.encode(
        {
            "employee_id": emp.id,
            "role": emp.role,
            "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=12),
        },
        app.config["SECRET_KEY"],
        algorithm="HS256",
    )
    return jsonify({
        "token": token,
        "role": emp.role,
        "employee": {"id": emp.id, "emp_id": emp.emp_id, "name": emp.name, "department": emp.department},
    })


# ---------------- Employee routes ----------------

@app.route("/api/employee/me", methods=["GET"])
@token_required
def employee_me():
    emp = Employee.query.get(request.employee_id)
    if not emp:
        return jsonify({"error": "Not found"}), 404

    net_salary = emp.basic_salary + emp.hra + emp.allowances - emp.deductions

    # attendance_pct and leave_balance are placeholders until Attendance
    # model lands in core/ — wire these up once that's ready
    return jsonify({
        "emp_id": emp.emp_id,
        "name": emp.name,
        "department": emp.department,
        "attendance_pct": 92,
        "leave_balance": {"paid": 8, "sick": 5},
        "salary": {"net": net_salary},
    })


@app.route("/api/employee/leave/apply", methods=["POST"])
@token_required
def apply_leave():
    data = request.json
    leave = LeaveRequest(
        employee_id=request.employee_id,
        leave_type=data.get("leave_type"),
        start_date=datetime.datetime.strptime(data["start_date"], "%Y-%m-%d").date(),
        end_date=datetime.datetime.strptime(data["end_date"], "%Y-%m-%d").date(),
        days=data.get("days", 1),
        reason=data.get("reason", ""),
    )
    db.session.add(leave)
    db.session.commit()
    return jsonify({"id": leave.id, "status": leave.status}), 201


@app.route("/api/employee/leave/history", methods=["GET"])
@token_required
def leave_history():
    requests_ = LeaveRequest.query.filter_by(employee_id=request.employee_id).order_by(
        LeaveRequest.created_at.desc()
    ).all()
    return jsonify({
        "requests": [
            {
                "id": r.id, "leave_type": r.leave_type,
                "start_date": str(r.start_date), "end_date": str(r.end_date),
                "days": r.days, "status": r.status,
            }
            for r in requests_
        ]
    })


@app.route("/api/employee/profile", methods=["GET"])
@token_required
def profile():
    emp = Employee.query.get(request.employee_id)
    if not emp:
        return jsonify({"error": "Not found"}), 404

    return jsonify({
        "emp_id": emp.emp_id,
        "name": emp.name,
        "email": emp.email,
        "department": emp.department,
        "designation": emp.designation or "Not set",
        "role": emp.role,
    })


@app.route("/api/employee/payroll", methods=["GET"])
@token_required
def payroll():
    emp = Employee.query.get(request.employee_id)
    net = emp.basic_salary + emp.hra + emp.allowances - emp.deductions
    return jsonify({
        "basic": emp.basic_salary, "hra": emp.hra,
        "allowances": emp.allowances, "deductions": emp.deductions,
        "net": net,
    })

@app.route("/api/employee/attendance/checkin", methods=["POST"])
@token_required
def attendance_checkin():
    data = request.json
    token = data.get("token")
    if not token:
        return jsonify({"error": "Missing QR token"}), 400

    try:
        scan_info = qr_service.scan_for_attendance(token, request.employee_id)
        record = attendance_service.process_check_in(
            employee_id=str(request.employee_id),
            check_in=datetime.datetime.now(),
            company_start_time=COMPANY_START_TIME,
        )
    except ValueError as e:
        return jsonify({"error": str(e)}), 400

    return jsonify({
        "status": record.status,
        "check_in": record.check_in.strftime("%H:%M"),
        "late_count": record.late_count,
        "warning": record.warning,
        "hr_escalation": record.hr_escalation,
    })


@app.route("/api/dev/generate-test-qr", methods=["GET"])
def generate_test_qr():
    """TEMPORARY — for testing before HR's QR generation UI is ready. Remove before demo."""
    result = qr_service.create_qr(location_id="office-main", validity_seconds=300)
    return jsonify(result)


# ---------------- Seed data (run once) ----------------

@app.cli.command("seed")
def seed():
    db.create_all()
    if not Employee.query.filter_by(email="employee@dayflow.com").first():
        db.session.add(Employee(
            emp_id="EMP1024", name="Sneha", email="employee@dayflow.com",
            password_hash=generate_password_hash("password123"),
            role="employee", department="Data Science",
            basic_salary=25000, hra=10000, allowances=7000, deductions=3000,
        ))
    if not Employee.query.filter_by(email="hr@dayflow.com").first():
        db.session.add(Employee(
            emp_id="HR001", name="HR Admin", email="hr@dayflow.com",
            password_hash=generate_password_hash("password123"),
            role="hr", department="Human Resources",
        ))
    db.session.commit()
    print("Seeded demo accounts.")


if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    app.run(debug=True, port=5000)