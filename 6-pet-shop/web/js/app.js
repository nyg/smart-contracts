import * as PetShopUI from './petshop-ui.js'
import * as BlockchainUI from './blockchain-ui.js'


function App() {

  // Keccak-256 hash of `PetAdopted(uint256,address)'
  const PET_ADOPTED_TOPIC = '0xaa2d40dd3b943f6c2f61c88fa64ea4eb2b19ea7399bdf0f1351ef2ce22ff9db0'

  // Contract abstraction for the PetShop contract
  this.PetShop = null

  // Deployed instance of the PetShop contract
  this.contract = null

  // Ethereum provider
  this.ethereum = null

  // Current account selected by the user
  this.account = null

  // Handler for the wanted subscription
  this.subscriptionHandlers = {}


  this.init = async () => {

    // init the shop ui and set callbacks
    PetShopUI.init(adoptPetCallback, connectButtonCallback)

    // check if an ethereum provider was injected in the page, e.g. by MetaMask
    if (!initEthereumProvider()) {
      return
    }

    // set the event handlers for the ethereum provider events
    setEventHandlers()

    // retrieve the last block and subscribe to new ones
    retrieveLastBlock()
    subscribeToNewBlocks()

    // retrieve the current chain id which will init the contract abstraction
    retrieveCurrentChainId()

    // check if the user has allowed access to any of his accounts
    retrieveUserAccounts()
  }


  // Check if an Ethereum provider is available. Providers are usually
  // available at window.ethereum but this is only a convention.
  const initEthereumProvider = () => {

    if (typeof window.ethereum === 'undefined') {
      console.error('Browser cannot connect to the Ethereum blockchain.')
      return false
    }

    this.ethereum = window.ethereum
    BlockchainUI.showBlockchainInfo()
    console.info('Ethereum-compatible browser detected.')

    return true
  }


  // https://eips.ethereum.org/EIPS/eip-1193
  const setEventHandlers = () => {
    this.ethereum.on('message', handleOnMessageEvent)
    this.ethereum.on('connect', handleOnConnectEvent)
    this.ethereum.on('disconnect', handleOnDisconnectEvent)
    this.ethereum.on('chainChanged', handleOnChainChangedEvent)
    this.ethereum.on('accountsChanged', handleOnAccountsChangedEvent)
  }


  // Get the chain's last mined block. The `eth_getBlockByNumber' JSON-RPC
  // method is defined in EIP-107.
  const retrieveLastBlock = () => {
    this.ethereum
      .request({ method: 'eth_getBlockByNumber', params: ['latest', true] })
      .then(block => {
        console.info(`Last mined block has number ${parseInt(block.number)}.`)
        BlockchainUI.updateLastBlock(block)
      })
      .catch(error => {
        console.error(`Could not retrieve last block due to error: [${error.code}] ${error.message}`)
        BlockchainUI.updateLastBlockError(error)
      })
  }


  // Async call to request the current chain id. The `eth_chainId' JSON-RPC
  // method is defined in EIP-695. When the chainId is received, the contract
  // abstraction is initialized and the UI updated.
  const retrieveCurrentChainId = () => {
    this.ethereum
      .request({ method: 'eth_chainId' })
      .then(chainId => {
        console.info(`Current chain id is ${parseInt(chainId)}.`)
        BlockchainUI.updateChainId(chainId)
        initContractAbstraction()
      })
      .catch(error => {
        console.error(`Could not retrieve chain id due to error: [${error.code}] ${error.message}`)
        BlockchainUI.updateChainIdError(error)
      })
  }


  // Initialize the contract abstraction using the Truffle library (could be
  // done with another, e.g. ethers.js, web3.js).
  const initContractAbstraction = async () => {

    // get the contract artifact which contains, among other things, the
    // contract ABI and the address where contract has been deployed
    const artifact = await fetch('json/PetShop.json').then(resp => resp.json())
    this.PetShop = window.TruffleContract(artifact)
    console.info('Contract abstraction created.')

    // set the ethereum provider that will be used by the contract abstraction
    // for future transactions
    this.PetShop.setProvider(this.ethereum)

    try {
      // get the instance of the deployed contract
      this.contract = await this.PetShop.deployed()
      BlockchainUI.updateContractAddress(this.contract.address)
      console.info(`Contract deployed at address ${this.contract.address}.`)

      // subscribe to any future PetAdopted contract events
      subscribeToPetAdoptedLogs()

      // retrieve adopted pets and refresh the UI
      refreshAdoptedPets()
    }
    catch (error) {
      // the contract instance could not be created, most probably because
      // it hasn't been deployed on the current chain
      console.error(`Could not retrieve instance of deployed contract due to error: ${error.message}.`)
      BlockchainUI.updateContractAddressError(error)
      PetShopUI.disableButtons()
    }
  }

  /*
   * Contract functions
   */

  // Retrieve the array of adopters from the smart contract and update the UI.
  const refreshAdoptedPets = () => {
    this.contract.getAdopters.call()
      .then(PetShopUI.updateButtons)
      .catch(error => {
        console.error(`Could not get pet adopters due to error: [${error.code}] ${error.message}`)
        PetShopUI.disableButtons()
      })
  }


  // Call the Adopt pet smart contract function when requested
  const adoptPetCallback = event => {
    this.contract
      .adopt(event.target.getAttribute('pet-id'), { from: this.account })
      .then(refreshAdoptedPets)
      .catch(error => {
        console.error(`Could not adopt pet due to error: [${error.code}] ${error.message}`)
      })
  }

  /*
   * User account functions
   */


  // Async call to get the user's accounts we have access to, if any. The
  // `eth_accounts' JSON-RPC method is defined in EIP-107.
  const retrieveUserAccounts = () => {
    this.ethereum
      .request({ method: 'eth_accounts' })
      .then(handleOnAccountsChangedEvent)
      .catch(error => {
        console.error(`Could not get user accounts due to error: [${error.code}] ${error.message}`)
        BlockchainUI.updateAccountError()
      })
  }


  // Allow the user to provide access to his account in order to initiate
  // transactions.
  const connectButtonCallback = event => {

    // disable button while the request is being performed
    event.target.setAttribute('disabled', null)

    // Request access to the user's account. The `eth_requestAccounts'
    // JSON-RPC method is defined in EIP-1102.
    this.ethereum
      .request({ method: 'eth_requestAccounts' })
      // nothing to do - handleOnAccountsChangedEvent will be executed
      .catch(error => {
        console.error(`Could not request access to accounts due to error: [${error.code}] ${error.message}`)
        BlockchainUI.updateAccountError
      })
      .finally(() => event.target.removeAttribute('disabled'))
  }

  /*
   * Subscription Handlers
   */

  const addSubscription = (id, handler) => {
    this.subscriptionHandlers[id] = handler
  }


  const handlePetAdoptedLog = log => {

    // `log.data` corresponds to the values of the emitted event. Parsing this
    // field is tied to the ABI.
    // 2 is to remove the `0x', 64 is the number of hex chars for a 256-bit
    // value. 40 is number of hex chars needed to encode an address.
    const petId = parseInt(log.data.slice(2, 64 + 2))
    const adopter = `0x${log.data.slice(64 + 2 + (64 - 40))}`

    const message = `Address ${adopter} adopted pet #${petId} in block ${parseInt(log.blockNumber)}`
    BlockchainUI.addReceivedEvent(message)
    console.info(message)

    refreshAdoptedPets()
  }


  const subscribeToPetAdoptedLogs = () => {

    if (Object.values(this.subscriptionHandlers).includes(handlePetAdoptedLog)) {
      return
    }

    this.ethereum
      .request({
        method: 'eth_subscribe',
        params: ['logs', { address: this.contract.address, topics: [PET_ADOPTED_TOPIC] }]
      })
      .then(id => addSubscription(id, handlePetAdoptedLog))
      .catch(error => {
        console.error(`Could not subscribe to contract logs due to error: [${error.code}] ${error.message}`)
        // TODO update ui
      })
  }


  const handleNewBlock = block => {
    console.info(`Block #${parseInt(block.number)} just mined.`)
    BlockchainUI.updateLastBlock(block)
  }


  const subscribeToNewBlocks = () => {
    this.ethereum
      .request({ method: 'eth_subscribe', params: ['newHeads'] })
      .then(id => addSubscription(id, handleNewBlock))
      .catch(BlockchainUI.updateLastBlockError)
  }

  /*
  * Event Handlers
  */

  const handleOnChainChangedEvent = chainId => {
    console.info(`Now connected to chain with id ${parseInt(chainId)}.`)
    BlockchainUI.updateChainId(chainId)
    initContractAbstraction()
  }


  const handleOnMessageEvent = message => {

    // the `eth_subscription' JSON-RPC method is defined in EIP-758
    if (message.type === 'eth_subscription') {

      // if the subscription id is known, execute the corresponding handler
      if (Object.prototype.hasOwnProperty.call(this.subscriptionHandlers, message.data.subscription)) {
        this.subscriptionHandlers[message.data.subscription](message.data.result)
      }
      else {
        console.warn(`Unknown subscription id: ${message.data.subscription}.`)
      }
    }
    else {
      console.warn('Received unknown message:')
      console.dir(message)
    }
  }


  const handleOnAccountsChangedEvent = accounts => {

    if (accounts.length == 0) {
      // User may not be logged in (e.g. MetaMask) or may not have given
      // access to any account.
      this.account = null
      console.warn('No user account found.')
    }
    else {
      // we need only the first account
      this.account = accounts[0]
      console.info(`Current user account is ${this.account}.`)
    }

    BlockchainUI.updateAccount(this.account)
  }


  const handleOnConnectEvent = info => {
    console.info(`Received connect event for chain with id ${parseInt(info.chainId)}.`)
  }


  const handleOnDisconnectEvent = error => {
    console.warn(`Received disconnect event with error [${error.code}] ${error.message}`)
  }
}


window.addEventListener('DOMContentLoaded', () => {
  new App().init()
})
