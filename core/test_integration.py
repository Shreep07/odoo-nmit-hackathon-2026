from datetime import datetime, time

import pytest

from core.integration_service import IntegrationService
from core.qr.qr_service import QRService


def test_complete_attendance_integration():
    qr_service = QRService()

    qr = qr_service.create_qr(
        location_id="OFFICE-001",
        validity_seconds=3600,
    )

    integration = IntegrationService(
        location_radius_meters=500,
    )

    result = integration.process_qr_check_in(
        token=qr["token"],
        employee_id="EMP001",
        employee_latitude=12.9716,
        employee_longitude=77.5946,
        company_latitude=12.9716,
        company_longitude=77.5946,
        company_start_time=time(9, 0),
        check_in=datetime(2026, 8, 22, 9, 0),
    )

    assert result["attendance"].employee_id == "EMP001"
    assert result["attendance"].status == "PRESENT"

    assert result["location"]["within_radius"] is True

    assert result["block"].attendance_data["type"] == "ATTENDANCE"
    assert result["block"].attendance_data["employee_id"] == "EMP001"

    assert integration.blockchain_service.get_chain_length() == 2

    print("✓ Complete attendance integration test passed")


def test_outside_location_blocks_attendance():
    qr_service = QRService()

    qr = qr_service.create_qr(
        location_id="OFFICE-001",
        validity_seconds=3600,
    )

    integration = IntegrationService(
        location_radius_meters=500,
    )

    with pytest.raises(ValueError, match="outside"):
        integration.process_qr_check_in(
            token=qr["token"],
            employee_id="EMP002",
            employee_latitude=13.1000,
            employee_longitude=77.7000,
            company_latitude=12.9716,
            company_longitude=77.5946,
            company_start_time=time(9, 0),
            check_in=datetime(2026, 8, 22, 9, 0),
        )

    assert integration.blockchain_service.get_chain_length() == 1

    print("✓ Outside location blocked successfully")