// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title EchoChainProvenance
 * @dev On-chain cryptographic provenance anchor contract for Polygon testnet.
 * Privacy Protection: Stores ONLY provenanceId, SHA-256 provenanceHash, and IPFS CID.
 * Never stores exact GPS, raw audio, or user PII.
 */
contract EchoChainProvenance {
    struct ProvenanceAnchor {
        string provenanceId;
        string provenanceHash; // SHA-256 canonical metadata commitment
        string ipfsCid;        // IPFS Content Identifier
        uint256 timestamp;     // Block timestamp
        address anchoredBy;    // Relayer wallet address
    }

    // Mapping from provenanceId -> ProvenanceAnchor struct
    mapping(string => ProvenanceAnchor) private _anchors;
    string[] private _provenanceIds;

    event ProvenanceAnchored(
        string indexed provenanceId,
        string provenanceHash,
        string ipfsCid,
        uint256 timestamp,
        address indexed anchoredBy
    );

    /**
     * @dev Anchors a sealed provenance record on-chain.
     */
    function anchorProvenance(
        string memory provenanceId,
        string memory provenanceHash,
        string memory ipfsCid
    ) public returns (bool) {
        require(bytes(provenanceId).length > 0, "Provenance ID cannot be empty");
        require(bytes(provenanceHash).length > 0, "Provenance Hash cannot be empty");

        if (_anchors[provenanceId].timestamp == 0) {
            _provenanceIds.push(provenanceId);
        }

        _anchors[provenanceId] = ProvenanceAnchor({
            provenanceId: provenanceId,
            provenanceHash: provenanceHash,
            ipfsCid: ipfsCid,
            timestamp: block.timestamp,
            anchoredBy: msg.sender
        });

        emit ProvenanceAnchored(
            provenanceId,
            provenanceHash,
            ipfsCid,
            block.timestamp,
            msg.sender
        );

        return true;
    }

    /**
     * @dev Retrieves on-chain provenance anchor details.
     */
    function getProvenanceAnchor(string memory provenanceId)
        public
        view
        returns (
            string memory provenanceHash,
            string memory ipfsCid,
            uint256 timestamp,
            address anchoredBy
        )
    {
        ProvenanceAnchor memory anchor = _anchors[provenanceId];
        require(anchor.timestamp > 0, "Provenance ID not anchored on-chain");

        return (
            anchor.provenanceHash,
            anchor.ipfsCid,
            anchor.timestamp,
            anchor.anchoredBy
        );
    }

    /**
     * @dev Returns total number of anchored provenance records.
     */
    function getTotalAnchored() public view returns (uint256) {
        return _provenanceIds.length;
    }
}
