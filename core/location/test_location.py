from .location_validator import LocationValidator
from .location_service import LocationService


def test_same_location():
    distance = LocationValidator.calculate_distance(
        12.9716,
        77.5946,
        12.9716,
        77.5946,
    )

    assert distance == 0
    print("✓ Same location test passed")


def test_location_within_500_meters():
    service = LocationService(allowed_radius_meters=500)

    result = service.verify_employee_location(
        employee_latitude=12.9716,
        employee_longitude=77.5946,
        company_latitude=12.9718,
        company_longitude=77.5947,
    )

    assert result["within_radius"] is True
    assert result["status"] == "LOCATION_VALID"

    print("✓ Within 500m test passed")


def test_location_outside_500_meters():
    service = LocationService(allowed_radius_meters=500)

    result = service.verify_employee_location(
        employee_latitude=12.9716,
        employee_longitude=77.5946,
        company_latitude=12.9816,
        company_longitude=77.6046,
    )

    assert result["within_radius"] is False
    assert result["status"] == "LOCATION_INVALID"

    print("✓ Outside 500m test passed")


def test_custom_radius():
    service = LocationService(allowed_radius_meters=1000)

    result = service.verify_employee_location(
        employee_latitude=12.9716,
        employee_longitude=77.5946,
        company_latitude=12.9760,
        company_longitude=77.5946,
    )

    assert result["allowed_radius_meters"] == 1000
    assert result["within_radius"] is True

    print("✓ Custom radius test passed")


if __name__ == "__main__":
    test_same_location()
    test_location_within_500_meters()
    test_location_outside_500_meters()
    test_custom_radius()

    print("\n✓ ALL LOCATION TESTS PASSED")