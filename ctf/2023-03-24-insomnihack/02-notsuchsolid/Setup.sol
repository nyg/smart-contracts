// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.1;

import "./Challenge.sol";

contract Setup {
    Challenge public chall;

    constructor() payable {
        require(msg.value >= 100, "Not enough ETH to create the challenge..");
        chall = (new Challenge){value: 50 ether}();
    }

    function isSolved() public view returns (bool) {
        return address(chall).balance == 0;
    }

    function isAlive(
        string calldata signature,
        bytes calldata parameters,
        address addr
    ) external returns (bytes memory) {
        (bool success, bytes memory data) = address(addr).call(
            abi.encodeWithSelector(
                bytes4(keccak256(bytes(signature))),
                parameters
            )
        );
        require(success, "Call failed");
        return data;
    }
}
