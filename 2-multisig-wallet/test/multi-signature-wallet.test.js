const { constants, expectEvent, expectRevert } = require('@openzeppelin/test-helpers')
const MultiSignatureWallet = artifacts.require('MultiSignatureWallet')
const SimpleStorage = artifacts.require('SimpleStorage')


contract('MultiSignatureWallet', accounts => {

  const firstOwner = accounts[0]
  const notAnOwner = accounts[9]

  let instance
  beforeEach(async () => {
    const owners = [accounts[0], accounts[1], accounts[2]]
    const quorum = 2
    instance = await MultiSignatureWallet.new(owners, quorum)
  })


  it('should receive Ether', async () => {

    const dotOneEther = web3.utils.toWei('0.1')
    expectEvent(
      await instance.send(dotOneEther, { from: notAnOwner }),
      'Deposit', {
      sender: notAnOwner,
      value: dotOneEther
    })

    assert.equal(
      await web3.eth.getBalance(instance.address),
      dotOneEther,
      'Balance should be equal to 0.1 Ether')
  })


  describe('Submitting transactions', () => {

    it('should be allowed for owners', async () => {

      const expectedTxId = '0'
      const expectedTxCount = '1'

      const dotZeroOneEther = web3.utils.toWei('0.01')
      const payload = constants.ZERO_BYTES32

      let receipt = await instance.submitTransaction(
        SimpleStorage.address,
        dotZeroOneEther,
        payload,
        { from: firstOwner })

      // check for expected events
      expectEvent(receipt, 'Submission', { transactionId: expectedTxId })
      expectEvent(receipt, 'Confirmation', { sender: firstOwner, transactionId: expectedTxId })

      // check for transaction count
      assert.equal(
        await instance.transactionCount(),
        expectedTxCount,
        'Transaction count should be equal to 1')

      // check for transaction value
      const tx = await instance.transactions(expectedTxId)
      assert.equal(tx.destination, SimpleStorage.address, 'Destination should be correct')
      assert.equal(tx.value, dotZeroOneEther, 'Sent value should be correct')
      assert.equal(tx.payload, constants.ZERO_BYTES32, 'Payload should be correct')
      assert.equal(tx.executed, false, 'Tx should not have been executed')

      // check for owner confirmation
      assert.isTrue(
        await instance.confirmations(expectedTxId, firstOwner),
        'Owner should have confirmed his transaction')
    })


    it('should not be allowed for non-owners', async () => {

      let receiptPromise = instance.submitTransaction(
        SimpleStorage.address, '0', constants.ZERO_BYTES32,
        { from: notAnOwner })

      await expectRevert(receiptPromise, 'Sender must be an owner')
    })


    it('should not be allowed to a zero destination address', async () => {

      let receiptPromise = instance.submitTransaction(
        constants.ZERO_ADDRESS, '0', constants.ZERO_BYTES32,
        { from: firstOwner })

      await expectRevert(receiptPromise, 'Address must not be null')
    })
  })
})
