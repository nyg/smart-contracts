const { upgradeProxy } = require('@openzeppelin/truffle-upgrades')

const BoxV1 = artifacts.require('BoxV1')
const BoxV2 = artifacts.require('BoxV2')

module.exports = async function (deployer) {

  const currentInstance = await BoxV1.deployed()

  // 1. Validate that the new implementation is upgrade safe and is compatible
  //    with the previous one.
  // 2. Check if there is an implementation contract deployed with the same
  //    bytecode, and deploy one if not.
  // 3. Upgrade the proxy to use the new implementation contract.
  await upgradeProxy(currentInstance.address, BoxV2, { deployer, call: 'initializeV2' })
}
