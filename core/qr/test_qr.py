import time

from qr.qr_generator import QRGenerator
from qr.qr_validator import QRValidator
from qr.qr_service import QRService


SECRET = "test-secret"


def test_generate_qr():
    generator = QRGenerator(SECRET)

    token = generator.generate_token(
        location_id="office-1",
        validity_seconds=300,
    )

    assert token
    print("✓ QR generation test passed")


def test_validate_qr():
    generator = QRGenerator(SECRET)
    validator = QRValidator(SECRET)

    token = generator.generate_token(
        location_id="office-1",
        validity_seconds=300,
    )

    payload = validator.validate(token)

    assert payload["location_id"] == "office-1"
    assert "qr_id" in payload

    print("✓ QR validation test passed")


def test_invalid_signature():
    generator = QRGenerator(SECRET)
    validator = QRValidator(SECRET)

    token = generator.generate_token(
        location_id="office-1",
        validity_seconds=300,
    )

    # Change the token so the signature becomes invalid.
    modified_token = token[:-2] + "xx"

    try:
        validator.validate(modified_token)
        assert False, "Invalid QR should have failed"
    except ValueError:
        pass

    print("✓ Invalid signature test passed")


def test_expired_qr():
    generator = QRGenerator(SECRET)
    validator = QRValidator(SECRET)

    token = generator.generate_token(
        location_id="office-1",
        validity_seconds=-1,
    )

    try:
        validator.validate(token)
        assert False, "Expired QR should have failed"
    except ValueError as error:
        assert str(error) == "QR code has expired"

    print("✓ Expired QR test passed")


def test_wrong_location():
    service = QRService(SECRET)

    token = service.generator.generate_token(
        location_id="office-1",
        validity_seconds=300,
    )

    try:
        service.validate_qr(
            token,
            expected_location="office-2",
        )
        assert False, "Wrong location should have failed"
    except ValueError as error:
        assert str(error) == "QR code does not belong to this location"

    print("✓ Wrong location test passed")


def test_attendance_scan():
    service = QRService(SECRET)

    token = service.generator.generate_token(
        location_id="office-1",
        validity_seconds=300,
    )

    result = service.scan_for_attendance(
        token=token,
        employee_id="EMP001",
    )

    assert result["employee_id"] == "EMP001"
    assert result["location_id"] == "office-1"
    assert "qr_id" in result

    print("✓ Attendance QR scan test passed")


if __name__ == "__main__":
    test_generate_qr()
    test_validate_qr()
    test_invalid_signature()
    test_expired_qr()
    test_wrong_location()
    test_attendance_scan()

    print("\n✓ ALL QR TESTS PASSED")