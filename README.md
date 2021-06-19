# Smart Contracts

## Commands

```shell
cd 1-proof-of-existence
npm install
npx truffle test
npx truffle compile
npx truffle migrate
```

## 1. Proof of Existence

This contract allows for senders to notarize documents. A hash of the document is computed and then stored in the contract's state. Note that the content of the document is sent within the transaction to notarize it, therefore it is public and it size will impact the cost of the transaction.

Based on [blog.openzeppelin.com/the-hitchhikers-guide-to-smart-contracts-in-ethereum](https://blog.openzeppelin.com/the-hitchhikers-guide-to-smart-contracts-in-ethereum-848f08001f05/).

## 2. Multisig Wallet

This contract allows a set of owners (defined during the contract's initialization) to submit, confirm and revoke transactions. A transaction is then executed if and only if it has been confirmed by a quorum of owners (also set during the initialization).

It is possible to send a transaction either to an EOA or to a contract account. In the latter case, it is possible to set the data field of the transaction (e.g. function signature and parameters). See the documentation of the `ExecutionFailed` event to prevent the transaction from failing.

Based on [ConsenSys-Academy/multisig-wallet-exercise](https://github.com/ConsenSys-Academy/multisig-wallet-exercise) and [ConsenSysMesh/MultiSigWallet](https://github.com/ConsenSysMesh/MultiSigWallet).

## 3. Simple Bank

This contract acts as a simple bank, allowing users to enroll (i.e. create an account), to deposit and to withdraw funds.

Based on [ConsenSys-Academy/simple-bank-exercise](https://github.com/ConsenSys-Academy/simple-bank-exercise).

## 4. Supply Chain

This contract provides four different functions that:

1. let users to put up items for sale,
2. let users buy such items,
3. let sellers notify the buyer that an item has been shipped and
4. let buyers notify the seller that the item has been received.

Based on [ConsenSys-Academy/supply-chain-exercise](https://github.com/ConsenSys-Academy/supply-chain-exercise).

## 5. Event Ticket

This contract allows the owner to create events for which a given number of tickets can be sold at a given price. It is possible for the owner to end the sale of tickets for an event and to receive the proceeds to the sale. It is also possible for a buyer to get his tickets refunded.

Based on [ConsenSys-Academy/event-ticket-exercise](https://github.com/ConsenSys-Academy/event-ticket-exercise).