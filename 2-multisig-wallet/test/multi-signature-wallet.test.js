const MultiSignatureWallet = artifacts.require('MultiSignatureWallet')

contract('MultiSignatureWallet', function (accounts) {

  it('should assert true', async function () {
    await MultiSignatureWallet.deployed()
    return assert.isTrue(true)
  })
})
