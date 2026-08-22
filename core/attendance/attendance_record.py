from dataclasses import dataclass
from datetime import date, datetime
from typing import Optional


@dataclass
class AttendanceRecord:
    employee_id: str
    attendance_date: date
    check_in: datetime
    status: str
    late_count: int
    warning: bool
    hr_escalation: bool
    check_out: Optional[datetime] = None

    def to_dict(self):
        return {
            "employee_id": self.employee_id,
            "attendance_date": self.attendance_date.isoformat(),
            "check_in": self.check_in.isoformat(),
            "check_out": (
                self.check_out.isoformat()
                if self.check_out
                else None
            ),
            "status": self.status,
            "late_count": self.late_count,
            "warning": self.warning,
            "hr_escalation": self.hr_escalation,
        }