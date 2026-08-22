import os
import sys

# Add the project root to Python's import path.
# app.py is inside hr-backend, while core is in the project root.
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from flask import Flask, request, jsonify
from flask_cors import CORS

from core.integration_service import IntegrationService


app = Flask(__name__)
CORS(app)


# ---------------------------------------------------------
# Core attendance integration
# ---------------------------------------------------------

integration_service = IntegrationService(
    location_radius_meters=500
)


# ---------------------------------------------------------
# Demo employee data
# ---------------------------------------------------------

employees = []


# ---------------------------------------------------------
# Leave management
# ---------------------------------------------------------

leave_requests = [
    {
        "id": 1,
        "employee": "Demo Employee",
        "department": "Engineering",
        "leaveType": "Sick Leave",
        "from": "2026-08-25",
        "to": "2026-08-26",
        "reason": "Medical appointment",
        "status": "Pending"
    }
]


# ---------------------------------------------------------
# Attendance records
# ---------------------------------------------------------

attendance_records = []


# ---------------------------------------------------------
# Health
# ---------------------------------------------------------

@app.route("/")
def home():
    return jsonify({
        "message": "HR Backend is running successfully"
    })


@app.route("/api/health")
def health():
    return jsonify({
        "status": "ok",
        "message": "HR Backend is healthy"
    })


# ---------------------------------------------------------
# Employees
# ---------------------------------------------------------

@app.route("/employees", methods=["GET"])
def get_employees():
    return jsonify(employees)


@app.route("/employees", methods=["POST"])
def add_employee():
    data = request.get_json() or {}

    required_fields = [
        "name",
        "email",
        "department",
        "role"
    ]

    for field in required_fields:
        if not data.get(field):
            return jsonify({
                "message": f"{field} is required"
            }), 400

    employee = {
        "id": len(employees) + 1,
        "name": data["name"],
        "email": data["email"],
        "department": data["department"],
        "role": data["role"]
    }

    employees.append(employee)

    return jsonify({
        "message": "Employee added successfully",
        "employee": employee
    }), 201


# ---------------------------------------------------------
# Leave management
# ---------------------------------------------------------

@app.route("/leaves", methods=["GET"])
def get_leaves():
    return jsonify(leave_requests)


@app.route("/leaves/<int:leave_id>/approve", methods=["PUT"])
def approve_leave(leave_id):

    for leave in leave_requests:

        if leave["id"] == leave_id:

            leave["status"] = "Approved"

            return jsonify({
                "message": "Leave approved successfully",
                "leave": leave
            })

    return jsonify({
        "message": "Leave request not found"
    }), 404


@app.route("/leaves/<int:leave_id>/reject", methods=["PUT"])
def reject_leave(leave_id):

    for leave in leave_requests:

        if leave["id"] == leave_id:

            leave["status"] = "Rejected"

            return jsonify({
                "message": "Leave rejected successfully",
                "leave": leave
            })

    return jsonify({
        "message": "Leave request not found"
    }), 404


# ---------------------------------------------------------
# Attendance - GET
# ---------------------------------------------------------

@app.route("/attendance", methods=["GET"])
def get_attendance():
    return jsonify(attendance_records)


# ---------------------------------------------------------
# Attendance - CHECK IN
# ---------------------------------------------------------

@app.route("/attendance/check-in", methods=["POST"])
def check_in():

    data = request.get_json() or {}

    employee_id = str(
        data.get("employee_id")
        or data.get("employee")
        or "demo_employee"
    )

    # -----------------------------------------------------
    # If the frontend provides a real QR token and location,
    # use the complete core integration.
    # -----------------------------------------------------

    token = data.get("token") or data.get("qr_token")

    employee_latitude = data.get("latitude")
    employee_longitude = data.get("longitude")

    company_latitude = data.get(
        "company_latitude",
        12.9716
    )

    company_longitude = data.get(
        "company_longitude",
        77.5946
    )

    if token and employee_latitude is not None and employee_longitude is not None:

        try:

            from datetime import time

            result = integration_service.process_qr_check_in(
                token=token,
                employee_id=employee_id,
                employee_latitude=float(employee_latitude),
                employee_longitude=float(employee_longitude),
                company_latitude=float(company_latitude),
                company_longitude=float(company_longitude),
                company_start_time=time(9, 0),
            )

            attendance_record = result["attendance"]

            attendance = {
                "id": len(attendance_records) + 1,
                "employee": employee_id,
                "employee_id": employee_id,
                "qrStatus": "Verified",
                "locationStatus": "Verified",
                "blockchainStatus": "Recorded",
                "status": attendance_record.status,
                "attendance": attendance_record.to_dict(),
                "distance_meters": result["location"]["distance_meters"],
                "block_index": result["block"].index,
                "block_hash": result["block"].hash,
            }

            attendance_records.append(attendance)

            return jsonify({
                "message": "Check-in successful",
                "attendance": attendance
            }), 201

        except ValueError as error:

            return jsonify({
                "message": str(error)
            }), 400

        except Exception as error:

            return jsonify({
                "message": "Attendance integration failed",
                "error": str(error)
            }), 500


    # -----------------------------------------------------
    # Demo/fallback check-in for frontend testing
    # -----------------------------------------------------

    attendance = {
        "id": len(attendance_records) + 1,
        "employee": employee_id,
        "employee_id": employee_id,
        "qrStatus": "Verified",
        "locationStatus": "Verified",
        "blockchainStatus": "Recorded",
        "status": "Checked In"
    }

    attendance_records.append(attendance)

    return jsonify({
        "message": "Check-in successful",
        "attendance": attendance
    }), 201


# ---------------------------------------------------------
# Attendance - CHECK OUT
# ---------------------------------------------------------

@app.route("/attendance/check-out", methods=["PUT"])
def check_out():

    if not attendance_records:

        return jsonify({
            "message": "No active attendance record found"
        }), 404

    attendance = attendance_records[-1]

    if attendance["status"] == "Checked Out":

        return jsonify({
            "message": "Employee has already checked out"
        }), 400

    attendance["status"] = "Checked Out"

    return jsonify({
        "message": "Check-out successful",
        "attendance": attendance
    })


# ---------------------------------------------------------
# Run server
# ---------------------------------------------------------

if __name__ == "__main__":

    app.run(
        debug=True,
        port=5001
    )