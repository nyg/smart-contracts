const { deployProxy, upgradeProxy } = require('@openzeppelin/truffle-upgrades')
const { modifyOpenZeppelinNetworkFile } = require('./utils/storage-layout-hack')

const BoxV1 = artifacts.require('BoxV1')
const BoxV2 = artifacts.require('BoxV2')


contract('BoxV1 to BoxV2 upgrade', accounts => {

  const owner = accounts[0]

  it('should have funds and state intact', async () => {

    // deploy v1
    let proxy = await deployProxy(BoxV1, [42], { initializer: 'initializeV1' })

    // set value and check it is correct
    const newValue = 24
    await proxy.update(newValue, { from: owner })
    assert.equal(await proxy.value(), newValue, 'contract should have new value set')

    // hack
    modifyOpenZeppelinNetworkFile(BoxV1)

    // upgrade to v2
    proxy = await upgradeProxy(proxy.address, BoxV2, { call: 'initializeV2' })

    // check state value has been kept intact
    assert.equal(await proxy.value(), newValue, 'upgraded contract should have same value set')
  })
})
