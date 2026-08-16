const { ethers } = require('hardhat')
const { expect } = require('chai')
const { loadFixture } = require('@nomicfoundation/hardhat-network-helpers')


describe('Reentrancy', () => {

   const INIT_AMOUNT_REENTRANCY = ethers.utils.parseEther('0.001')
   const INIT_AMOUNT_ATTACKER = ethers.utils.parseEther('1')

   async function deployContractFixture() {

      const Reentrancy = await ethers.getContractFactory('Reentrancy')
      const reentrancy = await Reentrancy.deploy({ value: INIT_AMOUNT_REENTRANCY })
      await reentrancy.deployed()

      const Attacker = await ethers.getContractFactory('Attacker')
      const attacker = await Attacker.deploy(reentrancy.address, { value: INIT_AMOUNT_ATTACKER })
      await attacker.deployed()

      const [deployer] = await ethers.getSigners()

      return { deployer, reentrancy, attacker }
   }


   it('should be deployed with 0.1 ETH', async () => {
      const { reentrancy } = await loadFixture(deployContractFixture)
      expect(await reentrancy.provider.getBalance(reentrancy.address))
         .to.equal(INIT_AMOUNT_REENTRANCY)
   })

   it('should have funds stolen', async () => {
      const { deployer, reentrancy, attacker } = await loadFixture(deployContractFixture)

      const deployerInitialBalance = await reentrancy.provider.getBalance(deployer.address)
      const tx = await (await attacker.stealFunds()).wait()
      const fee = tx.gasUsed.mul(tx.effectiveGasPrice)

      expect(await reentrancy.provider.getBalance(reentrancy.address))
         .to.equal(0)

      expect(await reentrancy.provider.getBalance(deployer.address))
         .to.equal(deployerInitialBalance.add(INIT_AMOUNT_REENTRANCY).add(INIT_AMOUNT_ATTACKER).sub(fee))
   })

})
