const { BN, expectEvent, expectRevert } = require('@openzeppelin/test-helpers')
const { deployProxy, erc1967 } = require('@openzeppelin/truffle-upgrades')

const BoxV1 = artifacts.require('BoxV1')


contract('BoxV1', accounts => {

  const owner = accounts[0]
  const notTheOwner = accounts[1]

  let proxy
  beforeEach(async () => {
    proxy = await deployProxy(BoxV1, [42], { initializer: 'initializeV1' })
    // console.log(`Proxy:          ${proxy.address}`)
    // console.log(`Proxy Admin:    ${await erc1967.getAdminAddress(proxy.address)}`)
    // console.log(`Implementation: ${await erc1967.getImplementationAddress(proxy.address)}`)
  })


  it('should have initial value set', async () => {
    assert.equal(await proxy.value(), 42, 'contract should have correct initial value')
  })


  it('should have owner set', async () => {
    assert.equal(await proxy.owner(), owner, 'contract should have correct owner')
  })


  it('should allow the owner to update its value', async () => {

    const newValue = 24

    expectEvent(
      await proxy.update(newValue, { from: owner }),
      'ValueChanged',
      { updater: owner, newValue: new BN(newValue) }
    )

    assert.equal(await proxy.value(), newValue, 'contract should have new value set')
  })


  it('should not allow someone to update its value', async () => {
    await expectRevert(
      proxy.update(24, { from: notTheOwner }),
      'Ownable: caller is not the owner')
  })


  it('should allow its value to be incremented', async () => {

    const currentValue = await proxy.value()
    const incrementedValue = currentValue.add(new BN(1))

    expectEvent(
      await proxy.increment({ from: notTheOwner }),
      'ValueChanged',
      { updater: notTheOwner, newValue: incrementedValue }
    )

    assert.equal(await proxy.value(), incrementedValue.toString(), 'contract should have new value set')
  })
})
