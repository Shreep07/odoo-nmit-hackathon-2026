import hashlib
import json
from datetime import datetime


class Block:
    def __init__(self, index, attendance_data, previous_hash=""):
        self.index = index
        self.timestamp = datetime.now().isoformat()
        self.attendance_data = attendance_data
        self.previous_hash = previous_hash
        self.hash = self.calculate_hash()

    def calculate_hash(self):
        block_data = {
            "index": self.index,
            "timestamp": self.timestamp,
            "attendance_data": self.attendance_data,
            "previous_hash": self.previous_hash,
        }

        encoded_data = json.dumps(
            block_data,
            sort_keys=True
        ).encode()

        return hashlib.sha256(encoded_data).hexdigest()