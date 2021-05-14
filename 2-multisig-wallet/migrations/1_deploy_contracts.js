var MultiSig = artifacts.require('MultiSignatureWallet')
var SimpleStorage = artifacts.require('SimpleStorage')

module.exports = function(deployer, _, accounts) {

    const owners = [accounts[0], accounts[1], accounts[2]]

    deployer.deploy(SimpleStorage)
    deployer.deploy(MultiSig, owners, 2)
}
