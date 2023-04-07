// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.1;

contract Challenge {
    bool setup = false;
    address payable owner = payable(address(0x0));
    mapping(address => bool) public sameAddress;

    constructor() payable {
        if (sameAddress[address(0x0)]) {
            init();
        }
    }

    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }

    function init() public {
        if (setup == false) {
            setup = true;
            owner = payable(msg.sender);
        }
    }

    function withdrawAll() public onlyOwner {
        owner.transfer(address(this).balance);
    }

    function destroy() public onlyOwner {
        selfdestruct(owner);
    }
}
