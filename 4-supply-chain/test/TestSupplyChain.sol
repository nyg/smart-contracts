// SPDX-License-Identifier: ISC
pragma solidity 0.8.4;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/SupplyChain.sol";

contract TestSupplyChain {
    /// @dev Initial balance of test contract.
    uint256 public initialBalance = 2 ether;

    /// @dev Necessary because SupplyChain will send Ether back to the test contract.
    receive() external payable {}

    SupplyChain public instance;

    function beforeEach() public {
        instance = new SupplyChain();

        (bool funded, ) = address(instance).call{value: 0.01 ether}("");
        require(funded, "Funding failed");
    }

    /* Buy Item */

    function testBuyItemSuccessfull() public {
        uint256 sku = instance.addItem("my car", 0.001 ether);
        instance.buyItem{value: 0.0011 ether}(sku);

        (, , , SupplyChain.State itemState, , ) = instance.items(sku);
        Assert.isTrue(
            itemState == SupplyChain.State.Sold,
            "Item should have been sold"
        );
    }

    function testBuyItemWithoutSufficientAmount() public {
        uint256 sku = instance.addItem("my car", 0.001 ether);

        (bool bought, ) =
            address(instance).call{value: 0.0009 ether}(
                abi.encodeWithSignature("buyItem(uint256)", sku)
            );
        Assert.isFalse(
            bought,
            "Should not be able to buy item without the sufficient sent amount"
        );
    }

    // function testBuyItemThatIsNotForSale() public {}

    // /* Ship Item */

    // function testShipItemCallNotMadeBySeller() public {}

    // function testShipItemThatIsNotSold() public {}

    // /* Receive Item */

    // function testReceiveItemCallNotMadeByBuyer() public {}

    // function testReceiveItemThatIsNotShipped() public {}
}
