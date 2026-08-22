from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

employees = []

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

attendance_records = []


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


@app.route("/employees", methods=["GET"])
def get_employees():
    return jsonify(employees)


@app.route("/employees", methods=["POST"])
def add_employee():
    data = request.get_json()

    if not data:
        return jsonify({
            "message": "No data provided"
        }), 400

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
        "name": data.get("name"),
        "email": data.get("email"),
        "department": data.get("department"),
        "role": data.get("role")
    }

    employees.append(employee)

    return jsonify({
        "message": "Employee added successfully",
        "employee": employee
    }), 201


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


@app.route("/attendance", methods=["GET"])
def get_attendance():
    return jsonify(attendance_records)


@app.route("/attendance/check-in", methods=["POST"])
def check_in():
    data = request.get_json() or {}

    attendance = {
        "id": len(attendance_records) + 1,
        "employee": data.get("employee", "Demo Employee"),
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


@app.route("/attendance/check-out", methods=["PUT"])
def check_out():
    if not attendance_records:
        return jsonify({
            "message": "No active attendance record found"
        }), 404

    attendance_records[-1]["status"] = "Checked Out"

    return jsonify({
        "message": "Check-out successful",
        "attendance": attendance_records[-1]
    })


if __name__ == "__main__":
    app.run(
        debug=True,
        port=5001
    )