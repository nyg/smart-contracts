const { ethers } = require('hardhat')
const { expect } = require('chai')
const { loadFixture } = require('@nomicfoundation/hardhat-network-helpers')

const document = 'Lorem ipsum'


describe('ProofOfExistence', () => {

   async function deployContractFixture() {

      const ProofOfExistence = await ethers.getContractFactory('ProofOfExistence')
      const instance = await ProofOfExistence.deploy()
      await instance.deployed()

      return { instance }
   }


   it('should notarize a given document', async () => {

      const { instance } = await loadFixture(deployContractFixture)

      expect(await instance.wasNotarized(document)).to.be.false

      await expect(instance.notarize(document))
         .to.emit(instance, 'DocumentNotarized')
         .withArgs(ethers.utils.solidityKeccak256(['string'], [document]))

      expect(await instance.wasNotarized(document)).to.be.true
   })


   it('should not notarize an already notarized document', async () => {

      const { instance } = await loadFixture(deployContractFixture)

      await instance.notarize(document)
      await expect(instance.notarize(document)).to.be.reverted
   })
})
