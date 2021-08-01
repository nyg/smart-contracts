const VulnerableTicketSale = artifacts.require('VulnerableTicketSale')
// const MaliciousBuyer = artifacts.require('MaliciousBuyer')

module.exports = function (deployer) {
  deployer.deploy(VulnerableTicketSale)
  // deployer.deploy(MaliciousBuyer)
}
