const { hashBytecodeWithoutMetadata } = require('@openzeppelin/upgrades-core')
const fs = require('fs')

/*
 * Hack to bypass a limitation of OZ's storage layout compatibility verification, see:
 * - https://forum.openzeppelin.com/t/updating-inheritance-of-contract-during-contract-upgrade/17882/4
 * - https://forum.openzeppelin.com/t/storage-layout-upgrade-with-hardhat-upgrades/14567/2
 */
function modifyOpenZeppelinNetworkFile(BoxV1) {

  const file = JSON.parse(fs.readFileSync('.openzeppelin/unknown-1337.json'))
  const version = hashBytecodeWithoutMetadata(BoxV1._json.bytecode)

  // add new types
  file.impls[version].layout.types.t_string_storage = { label: 'string' }
  file.impls[version].layout.types['t_array(t_uint256)48_storage'] = { label: 'uint256[48]' }

  // add new `version' storage variable and change type of `gap'
  if (!file.impls[version].layout.storage.some(e => e.contract === 'BoxStorageV1' && e.label === 'version')) {
    file.impls[version].layout.storage.splice(1, 0, { contract: 'BoxStorageV1', label: 'version', type: 't_string_storage' })
  }

  file.impls[version].layout.storage[2].type = 't_array(t_uint256)48_storage'

  // persist modifications
  fs.writeFileSync('.openzeppelin/unknown-1337.json', JSON.stringify(file, null, 2))
}

module.exports = {
  modifyOpenZeppelinNetworkFile
}
