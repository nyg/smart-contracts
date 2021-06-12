// SPDX-License-Identifier: ISC
pragma solidity 0.8.5;

/*
        The EventTicketsV2 contract keeps track of the details and ticket sales of multiple events.
     */
contract EventTicketsV2 {
    address public owner;

    uint256 TICKET_PRICE = 100 wei;

    /// @notice
    struct Event {
        string description;
        string website;
        uint256 totalTickets;
        uint256 sales;
        mapping(address => uint256) buyers;
        bool isOpen;
    }

    /*
        Create a mapping to keep track of the events.
        The mapping key is an integer, the value is an Event struct.
        Call the mapping "events".
    */
    mapping(uint256 => Event) private events;

    uint256 public idGenerator;

    event LogEventAdded(
        string desc,
        string url,
        uint256 ticketsAvailable,
        uint256 eventId
    );
    event LogBuyTickets(address buyer, uint256 eventId, uint256 numTickets);
    event LogGetRefund(
        address accountRefunded,
        uint256 eventId,
        uint256 numTickets
    );
    event LogEndSale(address owner, uint256 balance, uint256 eventId);

    /// @notice Create a modifier that throws an error if the msg.sender is not the owner.
    modifier isOwner() {
        require(msg.sender == owner, "Sender must be owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    /*
        Define a function called addEvent().
        This function takes 3 parameters, an event description, a URL, and a number of tickets.
        Only the contract owner should be able to call this function.
        In the function:
            - Set the description, URL and ticket number in a new event.
            - set the event to open
            - set an event ID
            - increment the ID
            - emit the appropriate event
            - return the event's ID
    */
    function addEvent(
        string memory description, // or storage ?
        string memory website,
        uint256 totalTickets
    ) external isOwner() returns (uint256) {
        events[idGenerator].description = description;
        events[idGenerator].website = website;
        events[idGenerator].totalTickets = totalTickets;
        events[idGenerator].isOpen = true;
        emit LogEventAdded(description, website, totalTickets, idGenerator);
        return idGenerator++;
    }

    /// @notice Get details of the event
    function readEvent(uint256 eventId)
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
            events[eventId].description,
            events[eventId].website,
            events[eventId].totalTickets,
            events[eventId].sales,
            events[eventId].isOpen
        );
    }

    /// @notice This function allows someone to purchase tickets for the event.
    function buyTickets(uint256 eventId, uint256 quantity) external payable {
        require(events[eventId].isOpen, "Event must be opened");
        require(msg.value >= quantity * TICKET_PRICE, "Insufficient funds");
        require(
            events[eventId].totalTickets - events[eventId].sales >= quantity,
            "Not enough tickets available"
        );

        events[eventId].buyers[msg.sender] += quantity;
        events[eventId].sales += quantity;

        uint256 refundAmount = msg.value - quantity * TICKET_PRICE;
        if (refundAmount > 0) {
            (bool sent, ) = msg.sender.call{value: refundAmount}("");
            require(sent, "Refund failed");
        }

        emit LogBuyTickets(msg.sender, eventId, quantity);
    }

    /// @notice
    function getRefund(uint256 eventId, uint256 quantity) external {
        require(
            events[eventId].buyers[msg.sender] >= quantity,
            "Tickets were not bought"
        );

        events[eventId].sales -= quantity;

        (bool sent, ) = msg.sender.call{value: quantity * TICKET_PRICE}("");
        require(sent, "Refund failed");

        emit LogGetRefund(msg.sender, eventId, quantity);
    }

    /// @notice
    function getBuyerTicketCount(uint256 eventId)
        external
        view
        returns (uint256)
    {
        return events[eventId].buyers[msg.sender];
    }

    /// @notice
    function endSale(uint256 eventId) external isOwner() {
        events[eventId].isOpen = false;

        uint256 saleProceeds = events[eventId].sales * TICKET_PRICE;
        (bool sent, ) = msg.sender.call{value: saleProceeds}("");
        require(sent, "Proceeds transfer failed");

        emit LogEndSale(owner, saleProceeds, eventId);
    }
}
