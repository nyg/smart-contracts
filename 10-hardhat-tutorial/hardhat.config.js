require('@nomicfoundation/hardhat-toolbox')

const fs = require('fs')
const [mnemonic, infuraApiKey] = fs.readFileSync('../.secret').toString().split('\n')

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
   solidity: '0.8.18',
   networks: {
      sepolia: {
         url: `https://sepolia.infura.io/v3/${infuraApiKey}`,
         accounts: [mnemonic]
      }
   }
}
