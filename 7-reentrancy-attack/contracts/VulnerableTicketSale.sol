// SPDX-License-Identifier: ISC
pragma solidity 0.8.6;

/// @notice
contract VulnerableTicketSale {
    /*
     * State variables
     */

    /// @notice Price of a ticket.
    uint256 public constant TICKET_PRICE = 0.1 ether;

    /// @notice Number of tickets sold for each buyer.
    mapping(address => uint256) private soldTicketsPerBuyer;

    /*
     * Function modifiers
     */

    /// @notice Not enough funds were sent to buy tickets of the event.
    error NotEnoughFundsSent();
    modifier enoughFundsSent(uint256 ticketQuantity) {
        if (msg.value < ticketQuantity * TICKET_PRICE) {
            revert NotEnoughFundsSent();
        }
        _;
    }

    /// @notice The quantity of tickets to be refunded exceeds the quantity that was bought.
    error TicketsWereNotBought();
    modifier ticketsWereBought(uint256 ticketQuantity) {
        if (soldTicketsPerBuyer[msg.sender] < ticketQuantity) {
            revert TicketsWereNotBought();
        }
        _;
    }

    /*
     * Functions
     */

    /// @notice Allows the user to buy tickets for the event.
    function buyTickets(uint256 quantity)
        external
        payable
        enoughFundsSent(quantity)
    {
        soldTicketsPerBuyer[msg.sender] += quantity;
    }

    /// @notice Allows a buyer to get a refund for the tickets he bought. This
    /// function is vulnerable to a reentrancy attack.
    function getRefund(uint256 quantity) external ticketsWereBought(quantity) {
        emit Log(111, 0);

        // If the address that calls this function is a smart contract, then
        // sending it ether will execute its `receive' function which can
        // immediately call this function again. As the number of tickets sold
        // to the buyer has not yet been updated, the `ticketsWereBought' check
        // will pass, and more ether will be sent to the malicious contract.
        // emit Balance(address(this).balance);
        (bool refunded, ) = msg.sender.call{value: quantity * TICKET_PRICE}("");
        require(refunded, "Ticket refund failed");

        emit Log(222, 0);

        // The number of tickets sold should be updated before refunding the
        // caller so as to respect the checks-effects-interactions pattern.
        // See: https://swcregistry.io/docs/SWC-107.
        soldTicketsPerBuyer[msg.sender] -= quantity;
    }

    /*
     * Test functions
     */

    event Log(uint256 a, uint256 b);

    /// @notice Allows the contract to be funded.
    receive() external payable {}

    /// @notice Returns the number of tickets bought for a given address.
    function getTicketsSold(address buyer) external view returns (uint256) {
        return soldTicketsPerBuyer[buyer];
    }
}
