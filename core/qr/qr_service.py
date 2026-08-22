from .qr_generator import QRGenerator
from .qr_validator import QRValidator


class QRService:
    """High-level QR service used by the attendance system."""

    def __init__(self, secret=None):
        self.generator = QRGenerator(secret)
        self.validator = QRValidator(secret)

    def create_qr(self, location_id, validity_seconds=300, output_path=None):
        token = self.generator.generate_token(
            location_id=location_id,
            validity_seconds=validity_seconds,
        )

        result = {
            "token": token,
            "location_id": str(location_id),
            "validity_seconds": validity_seconds,
        }

        if output_path:
            result["image_path"] = self.generator.generate_qr_image(
                token,
                output_path
            )

        return result

    def validate_qr(self, token, expected_location=None):
        payload = self.validator.validate(token)

        if (
            expected_location is not None
            and str(payload["location_id"]) != str(expected_location)
        ):
            raise ValueError("QR code does not belong to this location")

        return payload

    def scan_for_attendance(self, token, employee_id):
        """
        Validate QR and prepare attendance information.

        Attendance recording itself remains inside the attendance module.
        """
        payload = self.validator.validate(token)

        return {
            "employee_id": str(employee_id),
            "location_id": payload["location_id"],
            "qr_id": payload["qr_id"],
            "scanned_at": payload["issued_at"],
        }