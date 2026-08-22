import base64
import hashlib
import hmac
import json
import os
import time


class QRValidator:
    """Validates signed and non-expired attendance QR codes."""

    def __init__(self, secret=None):
        self.secret = (
            secret
            or os.getenv("QR_SECRET")
            or "odoo-nmit-hackathon-2026-secret"
        ).encode()

    def _sign(self, data):
        return hmac.new(
            self.secret,
            data.encode(),
            hashlib.sha256
        ).hexdigest()

    def validate(self, token):
        if not token:
            raise ValueError("QR token is empty")

        try:
            decoded = base64.urlsafe_b64decode(token.encode()).decode()
            data = json.loads(decoded)

            payload = data["payload"]
            signature = data["signature"]

        except (ValueError, KeyError, json.JSONDecodeError):
            raise ValueError("Invalid QR token")

        payload_json = json.dumps(
            payload,
            sort_keys=True,
            separators=(",", ":")
        )

        expected_signature = self._sign(payload_json)

        if not hmac.compare_digest(signature, expected_signature):
            raise ValueError("Invalid QR signature")

        current_time = int(time.time())

        if current_time > payload["expires_at"]:
            raise ValueError("QR code has expired")

        if "location_id" not in payload:
            raise ValueError("QR location is missing")

        return payload