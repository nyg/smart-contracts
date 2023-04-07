// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.1;

contract Challenge {
    constructor() payable {
        require(
            msg.value == 100 ether,
            "100ETH required for the start the challenge"
        );
    }

    function withdraw(address payable beneficiary) public {
        beneficiary.transfer(address(this).balance);
    }
}
