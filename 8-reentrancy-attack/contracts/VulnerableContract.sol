// SPDX-License-Identifier: MIT
// pragma solidity 0.7.6;
pragma solidity 0.8.0;

contract VulnerableContract {
    mapping(address => uint256) public balances;

    function deposit() public payable {
        require(msg.value > 1, "Deposit something");
        balances[msg.sender] = msg.value;
    }

    function withdraw(uint256 _amount) public {
        require(balances[msg.sender] >= _amount, "Not enough balance!");
        (bool success, ) = payable(msg.sender).call{value: _amount}("");
        require(success, "Sending funds to malicious contract failed");
        balances[msg.sender] -= _amount;
    }

    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }

    receive() external payable {}
}
