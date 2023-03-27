const { ethers } = require('hardhat')

async function deploy() {

   const [deployer] = await ethers.getSigners()
   console.log('Deploying contracts with the account:', deployer.address)
   console.log('Account balance:', (await deployer.getBalance()).toString())

   const Token = await ethers.getContractFactory('Token')
   const token = await Token.deploy()
   console.log('Token address:', token.address)
}

deploy()
   .then(() => process.exit(0))
   .catch((error) => {
      console.error(error)
      process.exit(1)
   })
