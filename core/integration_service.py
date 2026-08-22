from datetime import datetime, time

from core.qr.qr_service import QRService
from core.location.location_service import LocationService
from core.attendance.attendance_service import AttendanceService
from core.blockchain.blockchain_service import BlockchainService


class IntegrationService:
    """
    Coordinates QR validation, location verification,
    attendance processing, and blockchain recording.
    """

    def __init__(
        self,
        location_radius_meters=500,
        qr_secret=None,
    ):
        self.qr_service = QRService(secret=qr_secret)
        self.location_service = LocationService(
            allowed_radius_meters=location_radius_meters
        )
        self.attendance_service = AttendanceService()
        self.blockchain_service = BlockchainService()

    def process_qr_check_in(
        self,
        token,
        employee_id,
        employee_latitude,
        employee_longitude,
        company_latitude,
        company_longitude,
        company_start_time: time,
        check_in: datetime | None = None,
    ):
        """
        Complete attendance check-in flow:

        1. Validate QR
        2. Validate employee location
        3. Create attendance record
        4. Record attendance event on blockchain
        """

        # 1. Validate QR
        qr_data = self.qr_service.scan_for_attendance(
            token,
            employee_id,
        )

        # 2. Verify employee location
        location_result = self.location_service.verify_employee_location(
            employee_latitude=employee_latitude,
            employee_longitude=employee_longitude,
            company_latitude=company_latitude,
            company_longitude=company_longitude,
        )

        if not location_result["within_radius"]:
            raise ValueError(
                "Employee is outside the allowed attendance location."
            )

        # Use actual check-in time, not QR issue time.
        if check_in is None:
            check_in = datetime.now()

        # 3. Process attendance
        attendance_record = self.attendance_service.process_check_in(
            employee_id=str(employee_id),
            check_in=check_in,
            company_start_time=company_start_time,
        )

        # 4. Record the successful attendance event on blockchain
        blockchain_data = {
            "type": "ATTENDANCE",
            "employee_id": str(employee_id),
            "location_id": str(qr_data["location_id"]),
            "qr_id": str(qr_data["qr_id"]),
            "check_in": check_in.isoformat(),
            "attendance_date": attendance_record.attendance_date.isoformat(),
            "status": attendance_record.status,
            "late_count": attendance_record.late_count,
            "location": {
                "latitude": employee_latitude,
                "longitude": employee_longitude,
                "distance_meters": location_result["distance_meters"],
            },
        }

        block = self.blockchain_service.add_attendance_record(
            blockchain_data
        )

        return {
            "attendance": attendance_record,
            "qr": qr_data,
            "location": location_result,
            "block": block,
        }