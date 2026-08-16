# Intro2Solidity

During the CTF, step 1 and 2 are already executed. Write-up:
[blockchain.andstuff.club/writeups/intro2solidity](https://blockchain.andstuff.club/writeups/intro2solidity/).

## Standalone script

```sh
# 1. start a local blockchain node
pnpm exec hardhat node

# 2. deploy the two smart contracts
pnpm exec hardhat run scripts/deploy.js --network localhost

# 3. update `setupAddress` and `challengeAddress` in `attack.js` and execute the
#    attack
pnpm exec hardhat run scripts/attack.js
```
