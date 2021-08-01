const { BN, expectEvent, expectRevert } = require('@openzeppelin/test-helpers')
const VulnerableTicketSale = artifacts.require('VulnerableTicketSale')
const MaliciousBuyer = artifacts.require('MaliciousBuyer')

contract('VulnerableTicketSale', accounts => {

  const attacker = accounts[1]

  let vulnerableTicketSale
  let maliciousBuyer

  before(async () => {
    vulnerableTicketSale = await VulnerableTicketSale.deployed()
    maliciousBuyer = await MaliciousBuyer.new(vulnerableTicketSale.address)
  })

  it('should have all funds stolen', async () => {

    const fundsToSend = web3.utils.toWei('1', 'ether')
    const ticketsBought = 1

    // fund the vulnerable contract
    await vulnerableTicketSale.send(fundsToSend, { from: accounts[0] })
    const balanceBeforeAttack = await web3.eth.getBalance(vulnerableTicketSale.address)
    assert.equal(balanceBeforeAttack, fundsToSend, 'vulnerable contract should have funds')

    // perform the attack
    await maliciousBuyer.buyTickets(
      ticketsBought,
      { from: attacker, value: ticketsBought * web3.utils.toWei('0.1', 'ether') })

    assert.equal(
      await vulnerableTicketSale.getTicketsSold(maliciousBuyer.address),
      ticketsBought,
      'malicious buyer should have bought tickets')

    await maliciousBuyer.getRefund(ticketsBought, { from: attacker, gas: 6721975, gasPrice: 1 })

    const balanceAfterAttack = await web3.eth.getBalance(vulnerableTicketSale.address)
    console.log(balanceAfterAttack)
    // assert.equal(balanceAfterAttack, new BN('0 ether'), 'vulnerable contract should have funds stolen')

    assert.equal(1, 0, 'xxx')
  })
})
