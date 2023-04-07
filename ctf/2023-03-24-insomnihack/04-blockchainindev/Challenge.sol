// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.1;

import "@openzeppelin/contracts/access/Ownable.sol";

contract Challenge is Ownable {
    constructor() payable {
        require(
            msg.value == 100 ether,
            "100ETH required for the start the challenge"
        );
    }

    function withdraw(address payable beneficiary) public onlyOwner {
        beneficiary.transfer(address(this).balance);
    }
}
