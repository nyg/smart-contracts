// SPDX-License-Identifier: ISC
pragma solidity 0.8.4;

contract ProofOfExistence {

    // state: by default, each value of a corresponding key is set to false
    // when we store a proof, we set the value to true
    mapping (bytes32 => bool) private proofs;

    // notarize the given document, i.e. store the proof in the contract's state
    function notarize(string calldata document) external {
        bytes32 proof = proofFor(document);
        proofs[proof] = true;
    }

    // check if the given document has already been notarized
    function checkDocument(string memory document) public view returns (bool) {
        bytes32 proof = proofFor(document);
        return proofs[proof];
    }

    // helper function to compute proof of given document
    function proofFor(string memory document) private pure returns (bytes32) {
        return sha256(abi.encodePacked(document));
    }
}
