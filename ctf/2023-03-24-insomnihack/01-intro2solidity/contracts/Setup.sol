// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.1;

import "./Challenge.sol";

contract Setup {
    Challenge public chall;

    constructor() payable {
        require(msg.value >= 100, "Not enough ETH to create the challenge...");
        chall = (new Challenge){value: 100 ether}();
    }

    function isSolved() public view returns (bool) {
        return address(chall).balance == 0;
    }
}
