// SPDX-License-Identifier: ISC
pragma solidity 0.8.5;

/// @notice The EventTickets contract keeps track of the details and ticket sales of one event.
contract EventTickets {
    /// @notice Owner of the contract.
    address public owner;

    /// @notice
    uint256 private TICKET_PRICE = 100 wei;

    /// @notice
    struct Event {
        string description;
        string website;
        uint256 totalTickets;
        uint256 sales;
        mapping(address => uint256) buyers;
        bool isOpen;
    }

    /// @notice
    Event private myEvent;

    /// @notice LogBuyTickets should provide information about the purchaser and the number of tickets purchased.
    event TicketsBought(address buyer, uint256 quantity);

    /// @notice LogGetRefund should provide information about the refund requester and the number of tickets refunded.
    event TicketsRefunded(address requester, uint256 quantity);

    /// @notice LogEndSale should provide infromation about the contract owner and the balance transferred to them.
    event SaleEnded(address owner, uint256 balance);

    /// @notice Create a modifier that throws an error if the msg.sender is not the owner.
    modifier isOwner() {
        require(msg.sender == owner, "Sender must be owner");
        _;
    }

    /// @notice
    constructor(
        string memory description, // or storage ?
        string memory website,
        uint256 totalTickets
    ) {
        owner = msg.sender;
        myEvent.description = description;
        myEvent.website = website;
        myEvent.totalTickets = totalTickets;
        myEvent.isOpen = true;
    }

    /// @notice
    function readEvent()
        external
        view
        returns (
            string memory description,
            string memory website,
            uint256 totalTickets,
            uint256 sales,
            bool isOpen
        )
    {
        return (
            myEvent.description,
            myEvent.website,
            myEvent.totalTickets,
            myEvent.sales,
            myEvent.isOpen
        );
    }

    /// @notice
    function getBuyerTicketCount(address buyer)
        external
        view
        returns (uint256)
    {
        return myEvent.buyers[buyer];
    }

    /// @notice This function allows someone to purchase tickets for the event.
    function buyTickets(uint256 quantity) external payable {
        require(myEvent.isOpen, "Event must be opened");
        require(msg.value >= quantity * TICKET_PRICE, "Insufficient funds");
        require(
            myEvent.totalTickets - myEvent.sales >= quantity,
            "Not enough tickets available"
        );

        myEvent.buyers[msg.sender] += quantity;
        myEvent.sales += quantity;

        uint256 refundAmount = msg.value - quantity * TICKET_PRICE;
        if (refundAmount > 0) {
            (bool sent, ) = msg.sender.call{value: refundAmount}("");
            require(sent, "Refund failed");
        }

        emit TicketsBought(msg.sender, quantity);
    }

    /// @notice
    function getRefund(uint256 quantity) external {
        require(
            myEvent.buyers[msg.sender] >= quantity,
            "Tickets were not bought"
        );

        myEvent.sales -= quantity;

        (bool sent, ) = msg.sender.call{value: quantity * TICKET_PRICE}("");
        require(sent, "Refund failed");

        emit TicketsRefunded(msg.sender, quantity);
    }

    /// @notice
    function endSale() external isOwner() {
        myEvent.isOpen = false;

        uint256 saleProceeds = address(this).balance;
        (bool sent, ) = msg.sender.call{value: saleProceeds}("");
        require(sent, "Proceeds transfer failed");

        emit SaleEnded(owner, saleProceeds);
    }
}
