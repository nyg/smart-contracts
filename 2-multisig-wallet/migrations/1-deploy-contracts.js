const MultiSig = artifacts.require('MultiSignatureWallet')
const SimpleStorage = artifacts.require('SimpleStorage')

module.exports = function (deployer, _, accounts) {

    const owners = [accounts[0], accounts[1], accounts[2]]
    const quorum = Math.floor(owners.length / 2) + 1 // example

    deployer.deploy(SimpleStorage)
    deployer.deploy(MultiSig, owners, quorum)
}
