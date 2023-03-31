const { ethers } = require('hardhat')
const { expect } = require('chai')
const { loadFixture } = require('@nomicfoundation/hardhat-network-helpers')


describe('SimpleBank', () => {

   const ENROLLED_EVENT = 'Enrolled'
   const DEPOSIT_MADE_EVENT = 'DepositMade'
   const WITHDRAWAL_MADE_EVENT = 'WithdrawalMade'

   const depositedAmount = ethers.utils.parseEther('2')

   async function deployContractFixture() {

      const ProofOfExistence = await ethers.getContractFactory('SimpleBank')
      const [owner, alice] = await ethers.getSigners()

      const instance = (await ProofOfExistence.deploy()).connect(alice)
      await instance.deployed()

      return { instance, owner, alice }
   }


   it('should mark addresses as enrolled', async () => {

      const { instance, alice } = await loadFixture(deployContractFixture)

      await expect(instance.enroll())
         .to.emit(instance, ENROLLED_EVENT)
         .withArgs(alice.address)

      expect(await instance.enrolledStatus(alice.address))
         .to.be.true
   })


   it('should not mark unenrolled users as enrolled', async () => {
      const { instance, owner } = await loadFixture(deployContractFixture)
      expect(await instance.enrolledStatus(owner.address)).to.be.false
   })


   it('should deposit correct amount', async () => {

      const { instance } = await loadFixture(deployContractFixture)

      await instance.enroll()
      await instance.deposit({ value: depositedAmount })

      expect(await instance.accountBalance())
         .to.equal(depositedAmount)
   })


   it('should log a deposit event when a deposit is made', async () => {

      const { instance, alice } = await loadFixture(deployContractFixture)

      await instance.enroll()

      await expect(instance.deposit({ value: depositedAmount }))
         .to.emit(instance, DEPOSIT_MADE_EVENT)
         .withArgs(alice.address, depositedAmount)
   })


   it('should withdraw correct amount', async () => {

      const { instance } = await loadFixture(deployContractFixture)

      await instance.enroll()
      await instance.deposit({ value: depositedAmount })
      await instance.withdraw(depositedAmount)

      expect(await instance.accountBalance()).to.equal(0)
   })


   it('should not be able to withdraw more than has been deposited', async () => {

      const { instance } = await loadFixture(deployContractFixture)

      await instance.enroll()
      await instance.deposit({ value: depositedAmount })

      await expect(instance.withdraw(depositedAmount.add(1)))
         .to.be.revertedWith('withdrawal amount greater than balance')
   })


   it('should emit the appropriate event when a withdrawal is made', async () => {

      const { instance, alice } = await loadFixture(deployContractFixture)

      await instance.enroll()
      await instance.deposit({ value: depositedAmount })

      await expect(instance.withdraw(depositedAmount))
         .to.emit(instance, WITHDRAWAL_MADE_EVENT)
         .withArgs(alice.address, depositedAmount, 0)
   })
})
