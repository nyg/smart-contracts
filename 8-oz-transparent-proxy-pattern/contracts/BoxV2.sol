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

    /// @dev We should not re-init what has already been init in the first
    /// version as the state (located in the proxy contract) is kept.
    ///
    /// Note that we cannot re-use the initializer modifier as it will fail.
    /// Instead, we need to manually check for the value of `version' or
    /// another (new) storage variable dedicated to this specific check.
    ///
    /// Also note that the initializeV1 function has been removed as it's not
    /// needed anymore.
    function initializeV2() public payable {
        require(
            keccak256(abi.encodePacked((version))) ==
                keccak256(abi.encodePacked((""))),
            "BoxV2: already initialized"
        );

        // Init the new storage variable.
        version = "v2";

        // As this contract now inherits from PausableUpgradeable we should
        // initialize it. However, we cannot call __Pausable_init because the
        // contract has already been initialized. Neither can we set _paused to
        // false as the initializer is doing because the variable is internal.
        // Actually, as booleans are initialized to false, there is nothing to
        // initialize for PausableUpgradeable.
        require(!paused(), "PausableUpgradeable not properly initialized");
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
