// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

/// @dev Storage variables are extracted to another contract, which is then
/// inherited by the Box contract. This ensures that the below storage
/// variables are always placed first in the storage layout, allowing for
/// future upgrades to inherit from additional contracts.
/// Note that this contract is not deployed anywhere but is simply integrated
/// into the Box contract once it is compiled.
contract BoxStorageV1 {

    /// @notice Public value of the box.
    uint256 public value;

    /// @dev This gap lets us add additional storage variables in future
    // updates.
    uint256[49] private gap;
}

contract BoxV1 is BoxStorageV1, Initializable, OwnableUpgradeable {
    /* Events */

    /// @notice Emitted when the value of the box is updated.
    event ValueChanged(address indexed updater, uint256 newValue);

    /* Constructors & initializers */

    /// @dev For security reasons, we should not leave our logic contract in an
    /// uninitialized state.
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
}
