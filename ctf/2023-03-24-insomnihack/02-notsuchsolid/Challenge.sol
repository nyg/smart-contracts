// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.1;

contract Challenge {
    address payable owner;

    constructor() payable {
        owner = payable(msg.sender);
    }

    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }

    function getBalance() public view returns (uint) {
        return address(this).balance;
    }

    function withdrawAll(address payable _to) public onlyOwner {
        _to.transfer(address(this).balance);
    }

    function destroy() public onlyOwner {
        selfdestruct(owner);
    }
}
