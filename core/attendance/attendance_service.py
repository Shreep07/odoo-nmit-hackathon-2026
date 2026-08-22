from datetime import datetime, time

from core.attendance.attendance_record import AttendanceRecord
from core.attendance.attendance_rules import calculate_attendance
from core.attendance.late_tracker import LateTracker


class AttendanceService:
    def __init__(self):
        self.late_tracker = LateTracker()
        self.active_records = {}

    def process_check_in(
        self,
        employee_id: str,
        check_in: datetime,
        company_start_time: time,
    ):
        # Prevent duplicate check-in
        if employee_id in self.active_records:
            raise ValueError("Employee has already checked in.")

        current_late_count = self.late_tracker.get_late_count(
            employee_id,
            check_in.date(),
        )

        result = calculate_attendance(
            check_in=check_in,
            company_start_time=company_start_time,
            late_count_before_today=current_late_count,
        )

        if result.status == "LATE":
            self.late_tracker.add_late(
                employee_id,
                check_in.date(),
            )

        record = AttendanceRecord(
            employee_id=employee_id,
            attendance_date=check_in.date(),
            check_in=check_in,
            status=result.status,
            late_count=result.late_count,
            warning=result.warning,
            hr_escalation=result.hr_escalation,
        )

        self.active_records[employee_id] = record

        return record

    def process_check_out(
        self,
        employee_id: str,
        check_out: datetime,
    ):
        record = self.active_records.get(employee_id)

        if record is None:
            raise ValueError("Employee has not checked in.")

        if record.check_out is not None:
            raise ValueError("Employee has already checked out.")

        record.check_out = check_out

        del self.active_records[employee_id]

        return record