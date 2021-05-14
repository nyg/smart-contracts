const { expectEvent, expectRevert } = require('@openzeppelin/test-helpers')
const MultiSignatureWallet = artifacts.require('MultiSignatureWallet')

contract('MultiSignatureWallet', accounts => {

  const someone = accounts[9]

  let instance
  beforeEach(async () => {
    const owners = [accounts[0], accounts[1], accounts[2]]
    const quorum = 2
    instance = await MultiSignatureWallet.new(owners, quorum)
  })

  it('should receive Ether', async () => {

    const dotOneEther = web3.utils.toWei('0.1')
    expectEvent(
      await instance.send(dotOneEther, { from: someone }),
      'Deposit', {
      sender: someone,
      value: dotOneEther
    })

    const balance = await web3.eth.getBalance(instance.address)
    assert.equal(balance, dotOneEther, 'Balance should be equal to 0.1 Ether')
  })
})
