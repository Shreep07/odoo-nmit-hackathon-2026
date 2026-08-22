class BlockchainValidator:

    @staticmethod
    def validate_block(block, previous_block):
        # Check that the block points to the correct previous block
        if block.previous_hash != previous_block.hash:
            return False

        # Recalculate the block hash
        calculated_hash = block.calculate_hash()

        # Check whether the block has been modified
        if block.hash != calculated_hash:
            return False

        return True

    @classmethod
    def validate_chain(cls, chain):
        if not chain:
            return False

        # Validate every block after the genesis block
        for index in range(1, len(chain)):
            current_block = chain[index]
            previous_block = chain[index - 1]

            if not cls.validate_block(
                current_block,
                previous_block
            ):
                return False

        return True