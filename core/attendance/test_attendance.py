from datetime import datetime, time

from attendance_service import AttendanceService


def test_on_time_attendance():
    service = AttendanceService()

    record = service.process_check_in(
        employee_id="EMP001",
        check_in=datetime(2026, 8, 22, 9, 0),
        company_start_time=time(9, 0),
    )

    assert record.status == "PRESENT"
    assert record.late_count == 0
    assert record.warning is False
    assert record.hr_escalation is False

    print("✓ On-time attendance test passed")


def test_late_arrival():
    service = AttendanceService()

    record = service.process_check_in(
        employee_id="EMP002",
        check_in=datetime(2026, 8, 22, 9, 15),
        company_start_time=time(9, 0),
    )

    assert record.status == "LATE"
    assert record.late_count == 1
    assert record.warning is False
    assert record.hr_escalation is False

    print("✓ Late arrival test passed")


def test_third_late_warning():
    service = AttendanceService()

    # First late
    service.process_check_in(
        "EMP003",
        datetime(2026, 8, 5, 9, 15),
        time(9, 0),
    )
    service.process_check_out(
        "EMP003",
        datetime(2026, 8, 5, 17, 0),
    )

    # Second late
    service.process_check_in(
        "EMP003",
        datetime(2026, 8, 12, 9, 20),
        time(9, 0),
    )
    service.process_check_out(
        "EMP003",
        datetime(2026, 8, 12, 17, 0),
    )

    # Third late
    record = service.process_check_in(
        "EMP003",
        datetime(2026, 8, 20, 9, 30),
        time(9, 0),
    )

    assert record.status == "LATE"
    assert record.late_count == 3
    assert record.warning is True
    assert record.hr_escalation is False

    print("✓ Third late warning test passed")


def test_fourth_late_hr_escalation():
    service = AttendanceService()

    late_dates = [
        datetime(2026, 8, 5, 9, 15),
        datetime(2026, 8, 10, 9, 20),
        datetime(2026, 8, 15, 9, 25),
    ]

    # Create first 3 late arrivals
    for late_date in late_dates:
        service.process_check_in(
            "EMP004",
            late_date,
            time(9, 0),
        )

        service.process_check_out(
            "EMP004",
            late_date.replace(hour=17),
        )

    # Fourth late arrival
    record = service.process_check_in(
        "EMP004",
        datetime(2026, 8, 22, 9, 30),
        time(9, 0),
    )

    assert record.status == "LATE"
    assert record.late_count == 4
    assert record.warning is False
    assert record.hr_escalation is True

    print("✓ Fourth late HR escalation test passed")


def test_duplicate_check_in():
    service = AttendanceService()

    service.process_check_in(
        "EMP005",
        datetime(2026, 8, 22, 9, 0),
        time(9, 0),
    )

    try:
        service.process_check_in(
            "EMP005",
            datetime(2026, 8, 22, 9, 5),
            time(9, 0),
        )
        assert False, "Duplicate check-in should raise ValueError"

    except ValueError as error:
        assert str(error) == "Employee has already checked in."

    print("✓ Duplicate check-in test passed")


def test_check_out():
    service = AttendanceService()

    service.process_check_in(
        "EMP006",
        datetime(2026, 8, 22, 9, 0),
        time(9, 0),
    )

    record = service.process_check_out(
        "EMP006",
        datetime(2026, 8, 22, 17, 0),
    )

    assert record.check_out == datetime(2026, 8, 22, 17, 0)

    print("✓ Check-out test passed")


def test_check_out_without_check_in():
    service = AttendanceService()

    try:
        service.process_check_out(
            "EMP007",
            datetime(2026, 8, 22, 17, 0),
        )

        assert False, "Check-out without check-in should raise ValueError"

    except ValueError as error:
        assert str(error) == "Employee has not checked in."

    print("✓ Invalid check-out test passed")


if __name__ == "__main__":
    test_on_time_attendance()
    test_late_arrival()
    test_third_late_warning()
    test_fourth_late_hr_escalation()
    test_duplicate_check_in()
    test_check_out()
    test_check_out_without_check_in()

    print("\n🎉 ALL ATTENDANCE TESTS PASSED!")