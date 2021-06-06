// SPDX-License-Identifier: ISC
pragma solidity 0.8.4;

contract SimpleBank {
    /*
     * State variables
     */

    /// @notice Account balances of the clients of the bank.
    mapping(address => uint256) private balances;

    /// @notice The clients of the bank.
    mapping(address => bool) public enrolled;

    /// @notice The owner of the bank.
    address public owner;

    /*
     * Events
     */

    /// @notice A client has enrolled with the bank.
    event LogEnrolled(address indexed account);

    /// @notice A deposit was made.
    event LogDepositMade(address indexed account, uint256 amount);

    /// @notice A withdrawal was made.
    event LogWithdrawalMade(
        address indexed account,
        uint256 amount,
        uint256 newBalance
    );

    /*
     * Function modifiers
     */

    modifier senderMustBeEnrolled() {
        require(enrolled[msg.sender], "Sender must be enrolled");
        _;
    }

    /*
     * Functions
     */

    /// @notice Sets the creator of the contract as the owner of the bank.
    constructor() {
        owner = msg.sender;
    }

    // Fallback function - Called if other functions don't match call or
    // sent ether without data
    // Typically, called when invalid data is sent
    // Added so ether sent to this contract is reverted if the contract fails
    // otherwise, the sender's money is transferred to contract
    //fallback() external payable {
    //    revert();
    //}

    /// @notice Returns the balance of the sender's account.
    function getBalance() external view returns (uint256) {
        return balances[msg.sender];
    }

    /// @notice Enrolls the sender with the bank.
    /// @return The client's enrolled status.
    function enroll() external returns (bool) {
        if (!enrolled[msg.sender]) {
            enrolled[msg.sender] = true;
            emit LogEnrolled(msg.sender);
        }

        return true;
    }

    /// @notice Deposits Ether into the bank.
    /// @return The client's account balance after the deposit was made.
    function deposit()
        external
        payable
        senderMustBeEnrolled()
        returns (uint256)
    {
        balances[msg.sender] += msg.value;
        emit LogDepositMade(msg.sender, msg.value);
        return balances[msg.sender];
    }

    /// @notice Withdraws Ether from the bank.
    /// @param amount The amount of Ether to be withdrawn.
    /// @return The client's account balance after the withdrawal was made.
    function withdraw(uint256 amount)
        external
        senderMustBeEnrolled()
        returns (uint256)
    {
        if (balances[msg.sender] >= amount) {
            balances[msg.sender] -= amount;

            (bool sent, ) = msg.sender.call{value: amount}("");
            require(sent, "Withdrawal failed");

            uint256 newBalance = balances[msg.sender];
            emit LogWithdrawalMade(msg.sender, amount, newBalance);
            return newBalance;
        }

        return 0;
    }
}
