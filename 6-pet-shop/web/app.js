function App() {

  const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

  // UI elements
  const noEthereumDiv = document.querySelector('.no-ethereum')
  const ethereumNetworkDiv = document.querySelector('.ethereum-network')
  const currentChainElement = document.querySelector('.current-chain')
  const ethereumStatusElement = document.querySelector('.ethereum-status')
  const currentAccountElement = document.querySelector('.current-account')
  const connectButton = document.querySelector('.connect-button')
  const networkStatusElement = document.querySelector('.network-status')
  const lastBlockElement = document.querySelector('.last-block')

  // Contract abstraction for the PetShop contract
  this.PetShop = null

  // The deployed contract instance
  this.contract = null

  // Ethereum provider
  this.ethereum = null

  // Current user account
  this.account = null

  // Handler for the wanted subscription
  this.subscriptionHandlers = {}


  this.init = () => {

    loadPets().then(() => {

      if (initEthereumProvider()) {

        // blockchain
        handleChainChanges()
        detectChainStatus()
        handleNewBlocks()
        handleChainSubscriptions()

        // user
        handleUserAccountsChanges()
        handleUserConnectionRequest()
      }
    })
  }


  const initEthereumProvider = () => {

    // Check if an Ethereum provider is available. Providers are usually
    // available at window.ethereum but this is only a convention, not a
    // specification.
    if (typeof window.ethereum === 'undefined') {
      console.error('Browser cannot connect to the Ethereum blockchain.')
      return false
    }

    console.info('Ethereum-compatible browser detected.')

    noEthereumDiv.style.display = 'none'
    ethereumNetworkDiv.removeAttribute('style')
    this.ethereum = window.ethereum

    return true
  }


  // Users can choose from different networks (Main network, test networks, etc.).
  const handleChainChanges = () => {

    // some common network names
    const chainName = {
      1: 'Mainnet',
      3: 'Ropsten',
      4: 'Rinkeby'
    }

    const handleChainChangedEvent = chainId => {

      // simply update the UI when the chain changes
      const currentChainId = parseInt(chainId)
      const currentChainName = chainName[currentChainId] ?? `chain with id ${currentChainId}`
      currentChainElement.textContent = currentChainName
      console.info(`Connected to ${currentChainName}.`)

      // (re)init the contract abstraction
      initContractAbstraction()
    }

    // the `chainChanged' event is defined in EIP-1193
    this.ethereum.on('chainChanged', handleChainChangedEvent)

    // Async call to request the current chain id. The `eth_chainId' JSON-RPC
    // method is defined in EIP-695.
    this.ethereum
      .request({ method: 'eth_chainId' })
      .then(handleChainChangedEvent)
      .catch(error => {
        currentChainElement.textContent = error.message
        console.error(`Error fetching chain id. ${error.code}: ${error.message}`)
      })
  }


  // Check if the selected chain is live and can receive requests.
  const detectChainStatus = () => {

    const handleNetworkStatus = (connected, info, error) => {
      if (connected) {
        networkStatusElement.textContent = 'Online'
        console.log(`Connected to the blockchain. ${info ? `Chain id is ${info.chainId}.` : ''}`)
      }
      else {
        networkStatusElement.textContent = 'Offline'
        console.error(`Disconnected from the blockchain. ${error ? `Error: ${error}` : ''}`)
      }
    }

    // the `connect' and `disconnect' events are defined in EIP-1193
    this.ethereum.on('connect', info => handleNetworkStatus(true, info))
    this.ethereum.on('disconnect', error => handleNetworkStatus(false, null, error))

    handleNetworkStatus(this.ethereum.isConnected())
  }


  const handleNewBlocks = () => {

    const handleNewReceivedBlock = block => {
      console.log('Received new block')
      lastBlockElement.textContent = `${parseInt(block.number)} (${block.hash})`
    }

    // Get the chain's last mined block. The `eth_getBlockByNumber' JSON-RPC
    // method is defined in EIP-107.
    this.ethereum
      .request({ method: 'eth_getBlockByNumber', params: ['latest', true] })
      .then(handleNewReceivedBlock)
      .catch(error => {
        lastBlockElement.textContent = `Could not fetch last block: ${error.message}`
        console.error(error)
      })

    // Subscribe to future blocks. The `eth_subscribe' JSON-RPC method is defined
    // in EIP-758.
    this.ethereum
      .request({ method: 'eth_subscribe', params: ['newHeads'] })
      .then(subscriptionId => this.subscriptionHandlers[subscriptionId] = handleNewReceivedBlock)
      .catch(error => {
        lastBlockElement.textContent = `Could not subscribe to new blocks: ${error.message}`
        console.error(error)
      })
  }


  const handleChainSubscriptions = () => {

    this.ethereum.on('message', message => {

      // The `eth_subscription' JSON-RPC method is defined in EIP-758.
      if (message.type === 'eth_subscription') {
        if (Object.prototype.hasOwnProperty.call(this.subscriptionHandlers, message.data.subscription)) {
          this.subscriptionHandlers[message.data.subscription](message.data.result)
        }
        else {
          console.warn(`Unknown subscription id: ${message.data.subscription}.`)
        }
      }
      else {
        console.log('Unknown message received:')
        console.dir(message)
      }
    })
  }


  /*
   * Contract functions
   */


  const initContractAbstraction = () => {

    fetch('PetShop.json')
      .then(response => response.json())
      .then(data => {
        // `data' contains the contract ABI as well as the address where the
        // contract has been deployed
        this.PetShop = window.TruffleContract(data)
        console.info('Contract abstraction created.')

        // set the Ethereum provider that will be used by the contract
        // abstraction for future transactions
        this.PetShop.setProvider(this.ethereum)
      })
      .then(disableAdoptedPets)
  }


  // Disable the Adopt button of all pets that have already been adopted, or of
  // all pets if the contract has not been deployed on the current network.
  const disableAdoptedPets = () => {

    this.PetShop.deployed()
      .then(instance => instance.getAdopters.call())
      .then(adopters => {
        // for each adopter we retrieved from the contract state, update the
        // button state and text
        adopters.forEach((adopter, petId) => {
          const button = document.querySelector(`button[data-id='${petId}']`)
          if (adopter !== ZERO_ADDRESS) {
            button.textContent = 'Adopted'
            button.setAttribute('disabled', null)
          }
          else {
            button.textContent = 'Adopt'
            button.removeAttribute('disabled')
          }
        })
      })
      .catch(err => {
        // the contract instance could not be created, most probably because
        // it hasn't been deployed on the current network
        console.error('Could not get deployed contract:')
        console.error(err);

        // disable all buttons and reset text
        [...document.querySelectorAll('#pets-row button')].forEach(button => {
          button.textContent = 'Adopt'
          button.setAttribute('disabled', null)
        })
      })
  }


  // Adop pet when requested
  const adoptPet = event => {
    this.contract
      .deployed()
      .then(instance =>
        instance.adopt(event.target.getAttribute('data-id'), { from: this.account }))
      .then(disableAdoptedPets)
  }


  /*
   * User account functions
   */


  const handleUserAccountsChanged = accounts => {

    ethereumStatusElement.textContent = ''

    if (accounts.length == 0) {
      // User may not be logged in (e.g. MetaMask) or may not have given
      // access to any account.
      this.account = null
      console.warn('No user account detected.')
    }
    else if (accounts[0] === this.account) {
      ethereumStatusElement.textContent = 'Account already connected'
      console.info(`Already connected to ${this.account}`)
    }
    else {
      // we need only the first account
      this.account = accounts[0]
      console.log(`Current account is ${this.account}`)
    }

    currentAccountElement.textContent = this.account ?? 'None'
  }


  // Users can change their selected account.
  const handleUserAccountsChanges = () => {

    // the `accountsChanged' event is defined in EIP-1193
    this.ethereum.on('accountsChanged', handleUserAccountsChanged)

    // Async call to get the user's accounts we have access to, if any. The
    // `eth_accounts' JSON-RPC method is defined in EIP-107.
    this.ethereum
      .request({ method: 'eth_accounts' })
      .then(handleUserAccountsChanged)
      .catch(error => {
        currentAccountElement.textContent = error.message
        console.error(`Error fetching accounts. ${error.code}: ${error.message}`)
      })
  }


  // Request access to the user's accounts. Necessary to initiate Ethereum
  // transactions.
  const handleUserConnectionRequest = () => {

    connectButton.addEventListener('click', () => {

      // disable button while the request is being performed
      connectButton.disabled = true

      // Request access to the user's account. The `eth_requestAccounts'
      // JSON-RPC method is defined in EIP-1102.
      this.ethereum
        .request({ method: 'eth_requestAccounts' })
        .then(handleUserAccountsChanged)
        .catch(err => {
          ethereumStatusElement.textContent = err.message
          console.error(`${err.code}: ${err.message}`)
        })
        .then(() => connectButton.disabled = false)
    })
  }


  /*
   * UI
   */


  const loadPets = () =>
    fetch('../pets.json')
      .then(response => response.json())
      .then(pets =>
        pets.map(pet => {
          const template = document.querySelector('#pet-template').cloneNode(true)
          document.querySelector('#pets-row').append(template)

          template.id = `pet-${pet.id}`
          template.removeAttribute('style')
          template.querySelector('.pet-name').textContent = pet.name
          template.querySelector('img').src = pet.picture
          template.querySelector('.pet-breed').textContent = pet.breed
          template.querySelector('.pet-age').textContent = pet.age
          template.querySelector('.pet-location').textContent = pet.location
          template.querySelector('button').setAttribute('data-id', pet.id)
          template.querySelector('button').addEventListener('click', adoptPet)
        }))
}

window.addEventListener('DOMContentLoaded', () => {
  new App().init()
})
