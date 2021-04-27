// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.4;

/// @notice This contract allows a set of owners (defined during initialization) to submit, approve and/or revoke
///         transactions. A transaction is then executed if it has been confirmed by a quorum of owners (also set during
///         initialization of the contract).
contract MultiSignatureWallet {
    /* Structures */

    /// @notice A transaction to be submitted, confirmed and/or rejected
    /// @param destination Destination of the transaction, i.e. EOA or contract account
    /// @param value Amount of Ether to be sent
    /// @param payload Payload of the transaction
    /// @param executed Flag indicating if the transaction has been executed or not
    struct Transaction {
        address destination;
        uint256 value;
        bytes payload;
        bool executed;
    }

    /* State variables */

    /// @notice Owners of the wallet, defined during the initialization of the contract
    address[] public owners;

    /// @dev Easier than looping the array to know who's an owner
    mapping(address => bool) public isOwner;

    /// @notice The quorum of owners needed to execute a transaction
    uint256 public quorum;

    /// @notice A mapping of transaction ids to transactions
    mapping(uint256 => Transaction) public transactions;

    /// @notice The number of transactions that have been submitted to the contract
    uint256 public transactionCount;

    /// @notice For each transaction, a mapping of addresses approving or not the transaction
    mapping(uint256 => mapping(address => bool)) public confirmations;

    /* Events */

    /// @notice Indicates an owner has submitted a new transaction.
    event Submission(uint256 indexed transactionId);

    /// @notice Indicates an owner has confirmed an existing transaction.
    event Confirmation(address indexed sender, uint256 indexed transactionId);

    /// @notice Indicates an owner has revoked a transaction he had previously confirmed.
    event Revocation(address indexed sender, uint256 indexed transactionId);

    /// @notice Indicates the quorum has been obtained and the transaction has been successfully executed.
    event Execution(uint256 indexed transactionId);

    /// @notice Indicates the quorum has been obtained but the transaction's execution has failed.
    event ExecutionFailure(uint256 indexed transactionId);

    /// @notice Indicates a deposit of Ether has been made to the contract.
    event Deposit(address indexed sender, uint256 value);

    /* Function modifiers */

    modifier notNull(address _address) {
        require(_address != address(0));
        _;
    }

    modifier senderIsAnOwner() {
        require(isOwner[msg.sender]);
        _;
    }

    modifier senderHasConfirmed(uint256 _id) {
        require(confirmations[_id][msg.sender] == true);
        _;
    }

    modifier senderHasNotConfirmed(uint256 _id) {
        require(confirmations[_id][msg.sender] == false);
        _;
    }

    modifier transactionExists(uint256 _transactionId) {
        require(_transactionId < transactionCount);
        _;
    }

    modifier notExecuted(uint256 _id) {
        require(transactions[_id].executed == false);
        _;
    }

    /* Constructors */

    /// @notice Initializes the contract with the given list of owners and a quorum value.
    /// @param _owners List of initial owners.
    /// @param _qorum Quorum of owners for a transaction to be executed.
    constructor(address[] memory _owners, uint256 _qorum) {
        require(_qorum == 0 && _owners.length == 0 && _qorum > _owners.length);

        owners = _owners;
        quorum = _qorum;

        for (uint256 i = 0; i < _owners.length; i++) {
            isOwner[_owners[i]] = true;
        }
    }

    /* Functions */

    /// @notice Emits a Deposit event when the contract receives Ether.
    receive() external payable {
        if (msg.value > 0) {
            emit Deposit(msg.sender, msg.value);
        }
    }

    /// @notice Allows an owner to submit and confirm a transaction.
    /// @param destination The address to which the transaction will be sent to.
    /// @param value The amount of Ether to be sent with the transaction.
    /// @param payload The payload of the transaction.
    /// @return transactionId Returns the transaction id.
    function submitTransaction(
        address destination,
        uint256 value,
        bytes calldata payload
    ) external notNull(destination) senderIsAnOwner() returns (uint256 transactionId) {
        // store the submitted transaction
        transactionId = addTransaction(destination, value, payload);

        // the sender also confirms it
        confirmTransaction(transactionId);
    }

    /// @notice Allows an owner to revoke a confirmation for a previously confirmed transaction.
    /// @param transactionId The id of the transaction to be revoked.
    function revokeConfirmation(uint256 transactionId)
        external
        transactionExists(transactionId)
        senderIsAnOwner()
        senderHasConfirmed(transactionId)
    {
        // sender revokes his previous confirmation
        confirmations[transactionId][msg.sender] = false;
        emit Revocation(msg.sender, transactionId);
    }

    /// @notice Allows an owner to confirm a transaction.
    /// @param transactionId The id of the transaction to be confirmed.
    function confirmTransaction(uint256 transactionId)
        public
        transactionExists(transactionId)
        senderIsAnOwner()
        senderHasNotConfirmed(transactionId)
    {
        // sender confirms transaction
        confirmations[transactionId][msg.sender] = true;
        emit Confirmation(msg.sender, transactionId);

        // attempt execution
        executeTransaction(transactionId);
    }

    /// @notice Attemps to execute the given transaction.
    /// @param transactionId The id of the transaction to be executed.
    function executeTransaction(uint256 transactionId)
        public
        notExecuted(transactionId)
        transactionExists(transactionId)
    {
        if (!hasQuorum(transactionId)) {
            revert();
        }

        Transaction storage t = transactions[transactionId];
        (bool success, ) = t.destination.call{value: t.value}(t.payload);

        if (success) {
            t.executed = true;
            emit Execution(transactionId);
        } else {
            emit ExecutionFailure(transactionId);
        }
    }

    /// @notice Checks if the given transaction has reach the quorum.
    /// @param transactionId The id of the transaction to be checked.
    /// @return Returns true if the quorum has been reached, false otherwise.
    function hasQuorum(uint256 transactionId) internal view returns (bool) {
        uint256 confirmationCount;
        for (uint256 i = 0; i < owners.length; i++) {
            if (confirmations[transactionId][owners[i]]) {
                confirmationCount++;
                if (confirmationCount == quorum) {
                    return true;
                }
            }
        }

        return false;
    }

    /// @notice Adds a new transaction to the contract.
    /// @param destination The destination address of the transaction.
    /// @param value The amount of Ether to be sent.
    /// @param payload The payload of the transaction.
    /// @return transactionId Returns the transaction id of the new transaction.
    function addTransaction(
        address destination,
        uint256 value,
        bytes memory payload
    ) internal returns (uint256 transactionId) {
        // get next transaction id
        transactionId = transactionCount;

        // create new transaction and store it the mapping
        transactions[transactionId] = Transaction({
            destination: destination,
            value: value,
            executed: false,
            payload: payload
        });

        transactionCount++;
        emit Submission(transactionId);
    }
}
