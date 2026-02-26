// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title StudentLedger
 * @dev Simple registry to store the SHA-256 hash of a student's card record.
 */
contract StudentLedger {
    struct CardRecord {
        string recordHash;
        uint256 timestamp;
        address issuer;
    }

    // Mapping from card_id (UUID string) to CardRecord
    mapping(string => CardRecord) public records;

    // Event emitted when a new card is issued
    event CardIssued(string indexed cardId, string recordHash, uint256 timestamp, address issuer);

    /**
     * @dev Issue a new card record to the blockchain.
     * @param cardId The unique identifier of the card (UUID)
     * @param recordHash The SHA-256 hash string of the card's data
     */
    function issueCard(string memory cardId, string memory recordHash) public {
        require(bytes(records[cardId].recordHash).length == 0, "Card already exists on ledger");

        records[cardId] = CardRecord({
            recordHash: recordHash,
            timestamp: block.timestamp,
            issuer: msg.sender
        });

        emit CardIssued(cardId, recordHash, block.timestamp, msg.sender);
    }

    /**
     * @dev Verify a card record against its hash
     */
    function verifyCard(string memory cardId, string memory expectedHash) public view returns (bool) {
        string memory actualHash = records[cardId].recordHash;
        
        // If it doesn't exist, actualHash length is 0, so it will return false
        if (bytes(actualHash).length == 0 || bytes(expectedHash).length == 0) {
            return false;
        }
        
        // Return true if strings match
        return keccak256(abi.encodePacked(actualHash)) == keccak256(abi.encodePacked(expectedHash));
    }
}
