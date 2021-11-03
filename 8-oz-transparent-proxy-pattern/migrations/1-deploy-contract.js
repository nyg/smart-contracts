const { deployProxy } = require('@openzeppelin/truffle-upgrades')

const BoxV1 = artifacts.require('BoxV1')

module.exports = async function (deployer) {

  // Validate that the implementation is upgrade safe.
  // Deploy a proxy admin for your project.
  // Deploy the implementation contract.
  // Create and initialize the proxy contract.
  await deployProxy(BoxV1, [42], { deployer, initializer: 'initializeV1' })
}
