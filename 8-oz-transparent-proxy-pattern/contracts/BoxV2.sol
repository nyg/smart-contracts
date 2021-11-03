// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";

/// @dev Storage variables are extracted to another contract, which is then
/// inherited by the Box contract. This ensures that the below storage
/// variables are always placed first in the storage layout, allowing for
/// future upgrades to inherit from additional contracts.
///
/// Note that this contract is not deployed anywhere but is simply integrated
/// into the Box contract once it is compiled.
contract BoxStorageV2 {
    /// @notice Public value of the box.
    uint256 public value;

    /// @notice Version string of the Box contract.
    string public version;

    /// @dev Lets us add additional storage variables in future upgrades.
    uint256[48] private gap;
}

/// @notice This new version adds a additional storage variable named `version'
/// and allows for the contract to be paused using OZ's PausableUpgradeable.
contract BoxV2 is
    BoxStorageV2,
    Initializable,
    OwnableUpgradeable,
    PausableUpgradeable
{
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
    ///
    /// Note that we could most probably delete this initializer in the V2.
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

    /// @dev We should not re-init what has already been init in the first
    // version as the state (located in the proxy contract) is kept.
    function initializeV2() public payable initializer {
        // PausableUpgradeable also inherits from ContextUpgradeable so its
        // initializer will be called twice, but as it's empty it's not an
        // issue.
        __Pausable_init();

        // Init the new storage variable.
        version = "v2";
    }

    /* Functions */

    /// @notice Update the value of the box. Can only be called by the owner.
    function update(uint256 newValue) external onlyOwner whenNotPaused {
        value = newValue;
        emit ValueChanged(msg.sender, value);
    }

    /// @notice Allows anyone to increment the value of the box.
    function increment() external whenNotPaused {
        value += 1;
        emit ValueChanged(msg.sender, value);
    }

    /// @notice Allows the owner to pause the contract.
    function pause() external onlyOwner whenNotPaused {
        _pause();
    }

    /// @notice Allows the owner to unpause the contract.
    function unpause() external onlyOwner whenPaused {
        _unpause();
    }
}
