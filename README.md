# Smart Contracts

## Proof of Existence

This smart contract allows for senders to notarize documents. A hash of the document is computed and then stored in the contract's state. Note that the content of the document is sent within the transaction to notarize it, therefore it is public and influences the cost of the transaction.

Based on [blog.openzeppelin.com/the-hitchhikers-guide-to-smart-contracts-in-ethereum](https://blog.openzeppelin.com/the-hitchhikers-guide-to-smart-contracts-in-ethereum-848f08001f05/).

## Multisig Wallet

This contract allows a set of owners (defined during the contract's initialization) to submit, confirm and revoke transactions. A transaction is then executed if and only if it has been confirmed by a quorum of owners (also set during the initialization).

It is possible to send a transaction either to an EOA or to a contract account. In the latter case, it is possible to set the data field of the transaction (e.g. function signature and parameters). For this transaction not to fail, see the documentation of the `ExecutionFailed` event of this contract for a few things to keep in mind.

Based on [ConsenSys-Academy/multisig-wallet-exercise](https://github.com/ConsenSys-Academy/multisig-wallet-exercise) and [ConsenSysMesh/MultiSigWallet](https://github.com/ConsenSysMesh/MultiSigWallet).
