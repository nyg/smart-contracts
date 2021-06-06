
const { BN, expectEvent, expectRevert } = require('@openzeppelin/test-helpers')
const SupplyChain = artifacts.require('SupplyChain')

contract('SupplyChain', accounts => {

  const FOR_SALE_EVENT = 'ForSale'
  const SOLD_EVENT = 'Sold'
  const SHIPPED_EVENT = 'Shipped'
  const RECEIVED_EVENT = 'Received'

  const alice = accounts[1]
  const bob = accounts[2]
  const emptyAddress = '0x0000000000000000000000000000000000000000'

  const price = '1000'
  const excessAmount = '2000'
  const name = 'book'

  let instance
  beforeEach(async () => {
    instance = await SupplyChain.new()
  })


  it('should add an item with the provided name and price', async () => {

    await instance.addItem(name, price, { from: alice })

    const result = await instance.fetchItem.call(0)
    assert.equal(result[0], name, 'the name of the last added item does not match the expected value')
    assert.equal(result[2].toString(10), price, 'the price of the last added item does not match the expected value')
    assert.equal(result[3].toString(10), 0, 'the state of the item should be "For Sale", which should be declared first in the State Enum')
    assert.equal(result[4], alice, 'the address adding the item should be listed as the seller')
    assert.equal(result[5], emptyAddress, 'the buyer address should be set to 0 when an item is added')
  })


  it('should emit a ForSale event when an item is added', async () => {
    expectEvent(
      await instance.addItem(name, price, { from: alice }),
      FOR_SALE_EVENT)
  })


  it('should allow someone to purchase an item and update state accordingly', async () => {

    await instance.addItem(name, price, { from: alice })
    let aliceBalanceBefore = await web3.eth.getBalance(alice)
    let bobBalanceBefore = await web3.eth.getBalance(bob)

    await instance.buyItem(0, { from: bob, value: excessAmount })
    let aliceBalanceAfter = await web3.eth.getBalance(alice)
    let bobBalanceAfter = await web3.eth.getBalance(bob)

    const result = await instance.fetchItem.call(0)

    assert.equal(
      result[3].toString(10),
      1,
      'the state of the item should be "Sold", which should be declared second in the State Enum')

    assert.equal(
      result[5],
      bob,
      'the buyer address should be set bob when he purchases an item')

    assert.equal(
      new BN(aliceBalanceAfter).toString(),
      new BN(aliceBalanceBefore).add(new BN(price)).toString(),
      'alice\'s balance should be increased by the price of the item')

    assert.isBelow(
      Number(bobBalanceAfter),
      Number(new BN(bobBalanceBefore).sub(new BN(price))),
      'bob\'s balance should be reduced by more than the price of the item (including gas costs)')
  })


  it('should error when not enough value is sent when purchasing an item', async () => {

    await instance.addItem(name, price, { from: alice })

    await expectRevert(
      instance.buyItem(0, { from: bob, value: 1 }),
      '...')
  })


  it('should emit Sold event when and item is purchased', async () => {

    await instance.addItem(name, price, { from: alice })

    expectEvent(
      await instance.buyItem(0, { from: bob, value: excessAmount }),
      SOLD_EVENT)
  })


  it('should revert when someone that is not the seller tries to call shipItem()', async () => {

    await instance.addItem(name, price, { from: alice })
    await instance.buyItem(0, { from: bob, value: price })

    await expectRevert(
      instance.shipItem(0, { from: bob }),
      '...')
  })


  it('should allow the seller to mark the item as shipped', async () => {

    await instance.addItem(name, price, { from: alice })
    await instance.buyItem(0, { from: bob, value: excessAmount })
    await instance.shipItem(0, { from: alice })

    const result = await instance.fetchItem.call(0)
    assert.equal(
      result[3].toString(10),
      2,
      'the state of the item should be "Shipped", which should be declared third in the State Enum')
  })


  it('should emit a Shipped event when an item is shipped', async () => {

    await instance.addItem(name, price, { from: alice })
    await instance.buyItem(0, { from: bob, value: excessAmount })

    expectEvent(
      await instance.shipItem(0, { from: alice }),
      SHIPPED_EVENT)
  })


  it('should allow the buyer to mark the item as received', async () => {

    await instance.addItem(name, price, { from: alice })
    await instance.buyItem(0, { from: bob, value: excessAmount })
    await instance.shipItem(0, { from: alice })
    await instance.receiveItem(0, { from: bob })

    const result = await instance.fetchItem.call(0)
    assert.equal(
      result[3].toString(10),
      3,
      'the state of the item should be "Received", which should be declared fourth in the State Enum')
  })


  it('should revert if an address other than the buyer calls receiveItem()', async () => {

    await instance.addItem(name, price, { from: alice })
    await instance.buyItem(0, { from: bob, value: excessAmount })
    await instance.shipItem(0, { from: alice })

    await expectRevert(
      instance.receiveItem(0, { from: alice }),
      '...')
  })


  it('should emit a Received event when an item is received', async () => {

    await instance.addItem(name, price, { from: alice })
    await instance.buyItem(0, { from: bob, value: excessAmount })
    await instance.shipItem(0, { from: alice })

    expectEvent(
      await instance.receiveItem(0, { from: bob }),
      RECEIVED_EVENT)
  })
})
