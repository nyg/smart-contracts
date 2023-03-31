const { BN, expectEvent, expectRevert } = require('@openzeppelin/test-helpers')
const { deployProxy, upgradeProxy } = require('@openzeppelin/truffle-upgrades')
const { modifyOpenZeppelinNetworkFile } = require('./utils/storage-layout-hack')

const BoxV1 = artifacts.require('BoxV1')
const BoxV2 = artifacts.require('BoxV2')


contract('BoxV2', accounts => {

  const VALUE_CHANGED_EVENT = 'ValueChanged'
  const OZ_ERR_OWNABLE_NOT_OWNER = 'Ownable: caller is not the owner'
  const OZ_ERR_PAUSABLE_PAUSED = 'Pausable: paused'
  const BOXV2_ALREADY_INIT = 'BoxV2: already initialized'

  const owner = accounts[0]
  const notTheOwner = accounts[1]

  let proxy
  beforeEach(async () => {

    // deploy v1
    proxy = await deployProxy(BoxV1, [42], { initializer: 'initializeV1' })

    // hack to make upgrade possible
    modifyOpenZeppelinNetworkFile(BoxV1)

    // upgrade to v2
    proxy = await upgradeProxy(proxy.address, BoxV2, { call: 'initializeV2' })
  })


  /* V1 Tests */

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
      VALUE_CHANGED_EVENT,
      { updater: owner, newValue: new BN(newValue) }
    )

    assert.equal(await proxy.value(), newValue, 'contract should have new value set')
  })


  it('should not allow someone to update its value', async () => {
    await expectRevert(
      proxy.update(24, { from: notTheOwner }),
      OZ_ERR_OWNABLE_NOT_OWNER)
  })


  it('should allow its value to be incremented', async () => {

    const currentValue = await proxy.value()
    const newValue = currentValue.add(new BN(1))

    expectEvent(
      await proxy.increment({ from: notTheOwner }),
      VALUE_CHANGED_EVENT,
      { updater: notTheOwner, newValue }
    )

    assert.equal(await proxy.value(), newValue.toString(), 'contract should have new value set')
  })


  /* V2 Tests */

  it('should have its version set', async () => {
    assert.equal(await proxy.version(), 'v2', 'contract should have its version set')
  })


  it('should not be initialized twice', async () => {
    await expectRevert(
      proxy.initializeV2(),
      BOXV2_ALREADY_INIT)
  })


  it('should not allow the owner to update value when paused', async () => {

    await proxy.pause()
    assert.equal(await proxy.paused(), true, 'contract should be paused')

    await expectRevert(
      proxy.update(24, { from: owner }),
      OZ_ERR_PAUSABLE_PAUSED)
  })


  it('should not allow its value to be incremented when paused', async () => {

    await proxy.pause()
    assert.equal(await proxy.paused(), true, 'contract should be paused')

    await expectRevert(
      proxy.increment({ from: notTheOwner }),
      OZ_ERR_PAUSABLE_PAUSED)
  })


  it('should allow function call after being unpaused', async () => {

    await proxy.pause()
    assert.equal(await proxy.paused(), true, 'contract should be paused')

    await proxy.unpause()
    assert.equal(await proxy.paused(), false, 'contract should be unpaused')

    const currentValue = await proxy.value()
    const newValue = currentValue.add(new BN(1))

    expectEvent(
      await proxy.increment({ from: notTheOwner }),
      VALUE_CHANGED_EVENT,
      { updater: notTheOwner, newValue }
    )

    assert.equal(await proxy.value(), newValue.toString(), 'contract should have new value set')
  })
})
