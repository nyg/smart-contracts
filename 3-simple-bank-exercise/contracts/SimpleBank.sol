// SPDX-License-Identifier: ISC
pragma solidity 0.8.4;

contract SimpleBank {
    //
    // State variables
    //

    /// @notice Account balances of the bank's clients.
    mapping(address => uint256) private balances;

    /// @notice The bank's clients.
    mapping(address => bool) public enrolled;

    /// @notice The owner of the bank.
    address public owner;

    //
    // Events - publicize actions to external listeners
    //

    /* Add an argument for this event, an accountAddress */
    event LogEnrolled();

    /* Add 2 arguments for this event, an accountAddress and an amount */
    event LogDepositMade();

    /* Create an event called LogWithdrawal */
    /* Add 3 arguments for this event, an accountAddress, withdrawAmount and a newBalance */

    //
    // Functions
    //

    /* Use the appropriate global variable to get the sender of the transaction */
    constructor() {
        /* Set the owner to the creator of this contract */
    }

    // Fallback function - Called if other functions don't match call or
    // sent ether without data
    // Typically, called when invalid data is sent
    // Added so ether sent to this contract is reverted if the contract fails
    // otherwise, the sender's money is transferred to contract
    fallback() external payable {
        revert();
    }

    /// @notice Get balance
    /// @return The balance of the user
    // A SPECIAL KEYWORD prevents function from editing state variables;
    // allows function to run locally/off blockchain
    function getBalance() public returns (uint256) {
        /* Get the balance of the sender of this transaction */
    }

    /// @notice Enroll a customer with the bank
    /// @return The users enrolled status
    // Emit the appropriate event
    function enroll() public returns (bool) {}

    /// @notice Deposit ether into bank
    /// @return The balance of the user after the deposit is made
    // Add the appropriate keyword so that this function can receive ether
    // Use the appropriate global variables to get the transaction sender and value
    // Emit the appropriate event
    // Users should be enrolled before they can make deposits
    function deposit() public returns (uint256) {
        /* Add the amount to the user's balance, call the event associated with a deposit,
          then return the balance of the user */
    }

    /// @notice Withdraw ether from bank
    /// @dev This does not return any excess ether sent to it
    /// @param withdrawAmount amount you want to withdraw
    /// @return The balance remaining for the user
    // Emit the appropriate event
    function withdraw(uint256 withdrawAmount) public returns (uint256) {
        /* If the sender's balance is at least the amount they want to withdraw,
           Subtract the amount from the sender's balance, and try to send that amount of ether
           to the user attempting to withdraw.
           return the user's balance.*/
    }
}
