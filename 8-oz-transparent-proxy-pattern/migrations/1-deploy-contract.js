const { deployProxy } = require('@openzeppelin/truffle-upgrades')

const BoxV1 = artifacts.require('BoxV1')

module.exports = async function (deployer) {

  // 1. Validate that the implementation is upgrade safe.
  // 2. Deploy a proxy admin for your project.
  // 3. Deploy the implementation contract.
  // 4. Create and initialize the proxy contract.
  await deployProxy(BoxV1, [42], { deployer, initializer: 'initializeV1' })
}
