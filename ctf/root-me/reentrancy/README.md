# Reentrancy

[Root Me](https://www.root-me.org/) smart contract challenge (by Dridri). The vulnerable `Reentrancy` contract is a minimal wrapped-ether token: it lets anyone `deposit` and `withdraw` Ether. It is solved by draining the contract's whole balance, after which `claim` flips the `locked` flag to `false`.

Write-up: [blockchain.andstuff.club/writeups/reentrancy](https://blockchain.andstuff.club/writeups/reentrancy/).

## The vulnerability

`withdraw` sends Ether before updating the caller's balance, breaking the [checks-effects-interactions](https://swcregistry.io/docs/SWC-107) pattern:

```solidity
function withdraw(uint wad) public {
    require(balanceOf[msg.sender] >= wad);
    assert(balanceOf[msg.sender] - wad < balanceOf[msg.sender]);
    msg.sender.call.value(wad)(""); // interaction happens first
    balanceOf[msg.sender] -= wad;   // effect happens after
    emit Withdrawal(msg.sender, wad);
}
```

When `msg.sender` is a contract, the `call` triggers its fallback function, which can call `withdraw` again before `balanceOf` has been decremented. The `Attacker` contract deposits a small amount, then recursively re-enters `withdraw` from its fallback until the vulnerable contract is empty, and finally forwards the stolen Ether to its owner. Once the balance reaches zero, `claim` unlocks the contract.

## Commands

```sh
# run the attack as a test (deploys both contracts on the in-process node)
pnpm install
pnpm test

# or run it against a standalone local node
pnpm exec hardhat node
pnpm run deploy
```
