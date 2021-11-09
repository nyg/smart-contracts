// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

/// @dev Note that this contract is not deployed anywhere but is simply
/// integrated into the Box contract during compilation. Thus, there is no
/// mechanism to upgrade it individually.
contract BoxStorageV1 {

    /// @notice Value of the box.
    uint256 public value;

    /// @dev Gap for future storage variables.
    uint256[49] private gap;
}

/// @notice This contract holds a value which can be updated by the owner and
/// incremented by anyone.
///
/// @dev The contract is upgradeable and follows the Transparent Proxy Pattern.
/// In order to allow both the addition of storage variables and inherited
/// contracts (which would modify the storage layout and render it incompatible
/// with the previous version), two solutions have been used:
///
///   1. Move storage variables of BoxV1 in a separate BoxStorageV1 contract,
///      which BoxV1 will use as its first inherited contract. This ensures
///      that storage slots used by these variables do not depend on the other
///      contracts BoxV1 will inherit from.
///   2. However, this means the storage variables declared in the BoxStorageV1
///      contract cannot be modified, as it would impact the slots used by
///      variables declared in BoxV1 inherited contracts. To circumvent this
///      problem, a gap of 49 storage slots is reserved using the gap variable
///      in the BoxStorageV1 contract. Each time a variable needs to be added
///      in BoxStorageV1, the size of the gap array should be reduced by one.
///
/// Note that OZ's Upgrades plugin checks if the next version of the contract
/// maintains storage layout compatibility. It is however not yet capable of
/// detecting the addition of a storage variable and the reducing of the array
/// variable that follows it. Thus, to be able to perform the proxy upgrade, a
/// small hack needs to be performed as explained in more details in the tests.
contract BoxV1 is BoxStorageV1, Initializable, OwnableUpgradeable {

    /* Events */

    /// @notice Emitted when the value of the box is updated.
    event ValueChanged(address indexed updater, uint256 newValue);

    /* Constructors & initializers */

    /// @dev TODO is this necessary?
    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() initializer {}

    /// @dev We must take care to initialize all base contracts, and to
    /// initialized them only once.
    function initializeV1(uint256 initialValue) public payable initializer {
        // This call will first init the ContextUpgradeable contract (which is
        // a base class of OwnableUpgradeable). It will then init itself.
        //
        // In our case there is no need to call the _unchained initializers
        // because ContextUpgradeable is inherited only by OwnableUpgradeable
        // and OwnableUpgradeable is inherited only this contract. Thus, we are
        // sure all contracts are initialized only once.
        //
        // Initializable does not have any initializers.
        //
        // The address delpoying the proxy will become the owner of this
        // contract.
        __Ownable_init();

        // Init the value of the box. Do not send an event.
        value = initialValue;
    }

    /* Functions */

    /// @notice Update the value of the box. Can only be called by the owner.
    function update(uint256 newValue) external onlyOwner {
        value = newValue;
        emit ValueChanged(msg.sender, value);
    }

    /// @notice Allows anyone to increment the value of the box.
    function increment() external {
        value += 1;
        emit ValueChanged(msg.sender, value);
    }

    /// @dev Allow contract to receive ethers.
    receive() external payable {}
}
