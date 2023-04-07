const { ethers, network } = require('hardhat')

const provider = new ethers.providers.JsonRpcProvider('https://blockchainindev.insomnihack.ch:32909', 1337)

const owner = '0x389B190eB6Cde276B5a96950771086a677620697'
await network.provider.request({ method: 'hardhat_impersonateAccount', params: [owner] })
const signer = await ethers.getSigner(owner)

const challengeContractAddress = '0xBd3333Aa8B94e3eb97cDf6638676bBbFCfDb9BC6'
const ChallengeContract = new ethers.Contract(challengeContractAddress, abi, signer)


const beneficiaryAddress = '0x133756e1688E475c401d1569565e8E16E65B1337'
const estimatedGasLimit = await ChallengeContract.estimateGas.withdraw(beneficiaryAddress)
const approveTxUnsigned = await ChallengeContract.populateTransaction.withdraw(beneficiaryAddress)
approveTxUnsigned.chainId = 1337
approveTxUnsigned.gasLimit = estimatedGasLimit
approveTxUnsigned.gasPrice = await provider.getGasPrice()
approveTxUnsigned.nonce = await provider.getTransactionCount(owner)

const approveTxSigned = await signer.signTransaction(approveTxUnsigned) // fails here
const submittedTx = await provider.sendTransaction(approveTxSigned)
await submittedTx.wait()
