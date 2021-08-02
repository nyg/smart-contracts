const VulnerableContract = artifacts.require('VulnerableContract')

module.exports = function (deployer) {
  deployer.deploy(VulnerableContract)
}
