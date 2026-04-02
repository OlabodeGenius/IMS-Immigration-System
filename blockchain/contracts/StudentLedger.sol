// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title StudentLedger
 * @dev Registry to store and verify SHA-256 hashes of student card records.
 *      Supports issuance, verification, and revocation of cards.
 */
contract StudentLedger {
    struct CardRecord {
        string recordHash;
        uint256 timestamp;
        address issuer;
        bool isActive;
    }

    mapping(string => CardRecord) public records;

    event CardIssued(string indexed cardId, string recordHash, uint256 timestamp, address issuer);
    event CardRevoked(string indexed cardId, uint256 timestamp, address revokedBy);

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
            issuer: msg.sender,
            isActive: true
        });

        emit CardIssued(cardId, recordHash, block.timestamp, msg.sender);
    }

    /**
     * @dev Revoke a previously issued card. Only the original issuer can revoke.
     * @param cardId The unique identifier of the card (UUID)
     */
    function revokeCard(string memory cardId) public {
        require(bytes(records[cardId].recordHash).length > 0, "Card does not exist");
        require(records[cardId].isActive, "Card is already revoked");
        require(records[cardId].issuer == msg.sender, "Only the original issuer can revoke");

        records[cardId].isActive = false;

        emit CardRevoked(cardId, block.timestamp, msg.sender);
    }

    /**
     * @dev Verify a card record against its hash. Returns false if revoked.
     */
    function verifyCard(string memory cardId, string memory expectedHash) public view returns (bool) {
        CardRecord memory card = records[cardId];

        if (bytes(card.recordHash).length == 0 || bytes(expectedHash).length == 0) {
            return false;
        }

        if (!card.isActive) {
            return false;
        }

        return keccak256(abi.encodePacked(card.recordHash)) == keccak256(abi.encodePacked(expectedHash));
    }

    /**
     * @dev Check if a card is currently active (not revoked).
     */
    function isCardActive(string memory cardId) public view returns (bool) {
        return bytes(records[cardId].recordHash).length > 0 && records[cardId].isActive;
    }
}
