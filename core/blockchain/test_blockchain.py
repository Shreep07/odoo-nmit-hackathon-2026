from .blockchain_service import BlockchainService
from .blockchain_validator import BlockchainValidator


def test_genesis_block():
    blockchain = BlockchainService()

    assert blockchain.get_chain_length() == 1
    assert blockchain.chain[0].index == 0
    assert blockchain.chain[0].attendance_data["type"] == "GENESIS"

    print("✓ Genesis block test passed")


def test_add_attendance_record():
    blockchain = BlockchainService()

    attendance_data = {
        "employee_id": "EMP001",
        "status": "PRESENT",
        "check_in": "2026-08-22T09:00:00",
    }

    block = blockchain.add_attendance_record(
        attendance_data
    )

    assert block.index == 1
    assert block.attendance_data == attendance_data
    assert block.previous_hash == blockchain.chain[0].hash

    print("✓ Attendance block creation test passed")


def test_multiple_attendance_records():
    blockchain = BlockchainService()

    blockchain.add_attendance_record({
        "employee_id": "EMP001",
        "status": "PRESENT",
    })

    blockchain.add_attendance_record({
        "employee_id": "EMP002",
        "status": "LATE",
    })

    assert blockchain.get_chain_length() == 3

    assert (
        blockchain.chain[2].previous_hash
        == blockchain.chain[1].hash
    )

    print("✓ Multiple block chain test passed")


def test_valid_blockchain():
    blockchain = BlockchainService()

    blockchain.add_attendance_record({
        "employee_id": "EMP001",
        "status": "PRESENT",
    })

    blockchain.add_attendance_record({
        "employee_id": "EMP002",
        "status": "LATE",
    })

    assert BlockchainValidator.validate_chain(
        blockchain.get_chain()
    ) is True

    print("✓ Blockchain validation test passed")


def test_tampered_block_is_detected():
    blockchain = BlockchainService()

    blockchain.add_attendance_record({
        "employee_id": "EMP001",
        "status": "PRESENT",
    })

    blockchain.add_attendance_record({
        "employee_id": "EMP002",
        "status": "LATE",
    })

    # Simulate someone modifying an attendance record
    blockchain.chain[1].attendance_data["status"] = "ABSENT"

    assert BlockchainValidator.validate_chain(
        blockchain.get_chain()
    ) is False

    print("✓ Tampering detection test passed")


def test_wrong_previous_hash_is_detected():
    blockchain = BlockchainService()

    blockchain.add_attendance_record({
        "employee_id": "EMP001",
        "status": "PRESENT",
    })

    blockchain.add_attendance_record({
        "employee_id": "EMP002",
        "status": "LATE",
    })

    # Break the link between the blocks
    blockchain.chain[2].previous_hash = "invalid_hash"

    assert BlockchainValidator.validate_chain(
        blockchain.get_chain()
    ) is False

    print("✓ Broken chain detection test passed")


if __name__ == "__main__":
    test_genesis_block()
    test_add_attendance_record()
    test_multiple_attendance_records()
    test_valid_blockchain()
    test_tampered_block_is_detected()
    test_wrong_previous_hash_is_detected()

    print("\n🎉 ALL BLOCKCHAIN TESTS PASSED!")