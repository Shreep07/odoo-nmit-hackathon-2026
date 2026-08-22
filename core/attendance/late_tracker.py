from datetime import date


class LateTracker:
    def __init__(self):
        self.records = {}

    def add_late(self, employee_id: str, attendance_date: date):
        month_key = attendance_date.strftime("%Y-%m")

        key = (employee_id, month_key)

        self.records[key] = self.records.get(key, 0) + 1

        return self.records[key]

    def get_late_count(self, employee_id: str, attendance_date: date):
        month_key = attendance_date.strftime("%Y-%m")

        key = (employee_id, month_key)

        return self.records.get(key, 0)

    def reset(self):
        self.records.clear()