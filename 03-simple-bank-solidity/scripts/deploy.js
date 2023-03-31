const { ethers } = require('hardhat')

async function deploy() {

   const [deployer] = await ethers.getSigners()
   console.log('Deploying contracts with the account:', deployer.address)
   console.log('Account balance:', (await deployer.getBalance()).toString())

   const Contract = await ethers.getContractFactory('SimpleBank')
   const instance = await Contract.deploy()
   console.log('Deployed at address:', instance.address)
}

deploy()
   .then(() => process.exit(0))
   .catch((error) => {
      console.error(error)
      process.exit(1)
   })
