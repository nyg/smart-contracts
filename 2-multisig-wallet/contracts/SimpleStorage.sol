// SPDX-License-Identifier: ISC
pragma solidity 0.8.4;

contract SimpleStorage {
    uint256 public storedData;
    address public caller;

    function set(uint256 x) public {
        caller = msg.sender;
        storedData = x;
    }
}
