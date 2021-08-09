// UI elements
const divNoEthereum = document.querySelector('.no-ethereum')
const divBlockchainInfo = document.querySelector('.blockchain-info')

const tdChainId = document.querySelector('.chain-id')
const tdSelectedAccount = document.querySelector('.selected-account')
const tdContractAddress = document.querySelector('.contract-address')
const tdLastBlock = document.querySelector('.last-block')
const tdReceivedEvents = document.querySelector('.received-events')

const connectStatusElement = document.querySelector('.ethereum-status')


// Common network names
const chainName = {
  '0x1': '#1 (MainNet)',
  '0x3': '#3 (Ropsten)',
  '0x4': '#4 (Rinkeby)'
}


// Hide the banner saying the browser cannot connect to the blockchain and
// show the blockchain info table.
function showBlockchainInfo() {
  divNoEthereum.style.display = 'none'
  divBlockchainInfo.removeAttribute('style')
}

/* Chain Id */

function updateChainId(chainId) {
  tdChainId.textContent = chainName[chainId] ?? `#${parseInt(chainId)}`
}

function updateChainIdError(error) {
  tdChainId.textContent = error.message
}

/* Last block */

function updateLastBlock(block) {
  tdLastBlock.textContent = `${parseInt(block.number)} (${block.hash})`
}

function updateLastBlockError(error) {
  tdLastBlock.textContent = error.message
}

/* Contract address */

function updateContractAddress(address) {
  tdContractAddress.textContent = address
}

function updateContractAddressError(error) {
  tdContractAddress.textContent = error.message
}

/* Selected account */

function updateAccount(account) {
  tdSelectedAccount.textContent = account ?? 'No account selected'
}

function updateAccountError(error) {
  tdSelectedAccount.textContent = error.message
}

/* Received events */

function addReceivedEvent(event) {
  tdReceivedEvents.appendChild(document.createTextNode(event))
  tdReceivedEvents.appendChild(document.createElement('br'))
}

export {
  showBlockchainInfo,
  updateChainId,
  updateChainIdError,
  updateLastBlock,
  updateLastBlockError,
  updateContractAddress,
  updateContractAddressError,
  updateAccount,
  updateAccountError,
  addReceivedEvent
}
