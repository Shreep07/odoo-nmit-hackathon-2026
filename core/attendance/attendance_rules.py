from dataclasses import dataclass
from datetime import datetime, time


@dataclass
class AttendanceResult:
    status: str
    late_count: int
    warning: bool
    hr_escalation: bool


def calculate_attendance(
    check_in: datetime,
    company_start_time: time,
    late_count_before_today: int,
) -> AttendanceResult:
    """
    Determine whether an employee is PRESENT or LATE.

    late_count_before_today = number of late arrivals
    already recorded for the employee in the current month.
    """

    if check_in.time() <= company_start_time:
        return AttendanceResult(
            status="PRESENT",
            late_count=late_count_before_today,
            warning=False,
            hr_escalation=False,
        )

    new_late_count = late_count_before_today + 1

    return AttendanceResult(
        status="LATE",
        late_count=new_late_count,
        warning=new_late_count == 3,
        hr_escalation=new_late_count > 3,
    )