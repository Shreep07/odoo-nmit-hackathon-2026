from .block import Block


class BlockchainService:
    def __init__(self):
        self.chain = [self._create_genesis_block()]

    def _create_genesis_block(self):
        return Block(
            index=0,
            attendance_data={
                "type": "GENESIS"
            },
            previous_hash="0",
        )

    def get_latest_block(self):
        return self.chain[-1]

    def add_attendance_record(self, attendance_data):
        latest_block = self.get_latest_block()

        new_block = Block(
            index=len(self.chain),
            attendance_data=attendance_data,
            previous_hash=latest_block.hash,
        )

        self.chain.append(new_block)

        return new_block

    def get_chain(self):
        return self.chain

    def get_chain_length(self):
        return len(self.chain)