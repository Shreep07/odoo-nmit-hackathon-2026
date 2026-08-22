import base64
import hashlib
import hmac
import json
import os
import secrets
import time
from pathlib import Path


class QRGenerator:
    """Generates signed QR payloads for attendance."""

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

    def generate_token(self, location_id, validity_seconds=3600):
        now = int(time.time())

        payload = {
            "qr_id": secrets.token_hex(8),
            "location_id": str(location_id),
            "issued_at": now,
            "expires_at": now + validity_seconds,
        }

        payload_json = json.dumps(
            payload,
            sort_keys=True,
            separators=(",", ":")
        )

        signature = self._sign(payload_json)

        token = {
            "payload": payload,
            "signature": signature,
        }

        encoded = base64.urlsafe_b64encode(
            json.dumps(token, separators=(",", ":")).encode()
        ).decode()

        return encoded

    def generate_qr_image(self, token, output_path):
        """
        Generate a PNG QR code.

        Requires:
            pip install "qrcode[pil]"
        """
        import qrcode

        output_path = Path(output_path)
        output_path.parent.mkdir(parents=True, exist_ok=True)

        qr = qrcode.QRCode(
            version=1,
            box_size=10,
            border=4,
        )

        qr.add_data(token)
        qr.make(fit=True)

        image = qr.make_image()
        image.save(output_path)

        return str(output_path)