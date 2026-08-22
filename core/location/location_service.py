from .location_validator import LocationValidator


class LocationService:
    """High-level service for attendance location verification."""

    def __init__(self, allowed_radius_meters=500):
        self.allowed_radius_meters = allowed_radius_meters

    def verify_employee_location(
        self,
        employee_latitude,
        employee_longitude,
        company_latitude,
        company_longitude,
    ):
        distance = LocationValidator.calculate_distance(
            employee_latitude,
            employee_longitude,
            company_latitude,
            company_longitude,
        )

        within_radius = distance <= self.allowed_radius_meters

        return {
            "within_radius": within_radius,
            "distance_meters": round(distance, 2),
            "allowed_radius_meters": self.allowed_radius_meters,
            "status": (
                "LOCATION_VALID"
                if within_radius
                else "LOCATION_INVALID"
            ),
        }