// SPDX-License-Identifier: MIT
pragma solidity 0.8.5;

/// @notice
contract PetShop {
    /*
     * State variables
     */

    /// @notice
    address[16] public adopters;

    /*
     * Events
     */

    /// @notice A pet with the specified id has been adopted by its new owner.
    event PetAdopted(uint256 petId, address owner);

    /*
     * Function modifiers
     */

    /// @notice To adopt a pet, its id must be valid. There are only 16 pets to be adopted.
    error PetDoesNotExist();
    modifier petExists(uint256 petId) {
        if (petId >= 16) {
            revert PetDoesNotExist();
        }
        _;
    }

    /// @notice An already adopted pet cannot be readopted.
    error PetAlreadyAdopted();
    modifier petNotAdopted(uint256 petId) {
        if (adopters[petId] != address(0)) {
            revert PetAlreadyAdopted();
        }
        _;
    }

    /*
     * Functions
     */

    /// @notice Allows the sender to adopt a pet.
    function adopt(uint256 petId) public petExists(petId) petNotAdopted(petId) {
        adopters[petId] = msg.sender;
        emit PetAdopted(petId, msg.sender);
    }

    /// @notice Returns the list of adopters.
    function getAdopters() public view returns (address[16] memory) {
        return adopters;
    }
}
