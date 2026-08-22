from math import radians, sin, cos, sqrt, atan2


class LocationValidator:
    """Checks whether an employee is within the allowed radius."""

    EARTH_RADIUS_METERS = 6_371_000

    @staticmethod
    def calculate_distance(
        employee_latitude,
        employee_longitude,
        company_latitude,
        company_longitude,
    ):
        lat1 = radians(employee_latitude)
        lon1 = radians(employee_longitude)
        lat2 = radians(company_latitude)
        lon2 = radians(company_longitude)

        dlat = lat2 - lat1
        dlon = lon2 - lon1

        a = (
            sin(dlat / 2) ** 2
            + cos(lat1)
            * cos(lat2)
            * sin(dlon / 2) ** 2
        )

        c = 2 * atan2(sqrt(a), sqrt(1 - a))

        return LocationValidator.EARTH_RADIUS_METERS * c

    @classmethod
    def is_within_radius(
        cls,
        employee_latitude,
        employee_longitude,
        company_latitude,
        company_longitude,
        allowed_radius_meters=500,
    ):
        distance = cls.calculate_distance(
            employee_latitude,
            employee_longitude,
            company_latitude,
            company_longitude,
        )

        return distance <= allowed_radius_meters