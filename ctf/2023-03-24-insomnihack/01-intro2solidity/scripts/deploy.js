const { ethers } = require('hardhat')

async function main() {

   const [deployer] = await ethers.getSigners()
   console.log('Using network:', await ethers.provider.getNetwork())
   console.log('Deployer:', deployer.address)

   // Deploy the Setup contract
   const Setup = await ethers.getContractFactory('Setup')
   const setupInstance = await Setup.deploy({ value: ethers.utils.parseEther('100') })
   await setupInstance.deployed()

   // Fund the EOA
   await deployer.sendTransaction({
      to: '0x133756e1688E475c401d1569565e8E16E65B1337',
      value: ethers.utils.parseEther('1')
   })

   console.log('Setup contract deployed:', setupInstance.address)
   console.log('Challenge contract deployed:', await setupInstance.chall())
}

main()
   .catch(error => {
      console.error(error)
      process.exitCode = 1
   })
