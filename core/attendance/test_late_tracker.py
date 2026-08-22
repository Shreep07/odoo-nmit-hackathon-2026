from datetime import date

from core.attendance.late_tracker import LateTracker


def test_monthly_late_count():
    tracker = LateTracker()

    tracker.add_late("EMP001", date(2026, 8, 5))
    tracker.add_late("EMP001", date(2026, 8, 12))
    tracker.add_late("EMP001", date(2026, 8, 20))

    assert tracker.get_late_count(
        "EMP001",
        date(2026, 8, 25)
    ) == 3


def test_new_month_starts_from_zero():
    tracker = LateTracker()

    tracker.add_late("EMP001", date(2026, 8, 20))

    assert tracker.get_late_count(
        "EMP001",
        date(2026, 9, 1)
    ) == 0


def test_employees_are_tracked_separately():
    tracker = LateTracker()

    tracker.add_late("EMP001", date(2026, 8, 10))
    tracker.add_late("EMP002", date(2026, 8, 10))

    assert tracker.get_late_count(
        "EMP001",
        date(2026, 8, 20)
    ) == 1

    assert tracker.get_late_count(
        "EMP002",
        date(2026, 8, 20)
    ) == 1


if __name__ == "__main__":
    test_monthly_late_count()
    test_new_month_starts_from_zero()
    test_employees_are_tracked_separately()

    print("All late tracker tests passed!")