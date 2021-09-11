# Staking Data Collection
This is a data collection tool for contracts on EVM blockchains.

### Operational Requirements
* Node.js 16
* RPC access to one or more archive nodes for
  * BSC
  * Ethereum
  * Ethereum Classic
  * Tron
* Python 3
* Linux operating system
* md5sum
* sha256sum
* go-ipfs

### Usage

```bash
# DOWNLOAD THE REPOSITORY
git clone https://github.com/notional-labs/c17
# Setup configuration in .env file
# RUN
npm start
```


For any given range of block heights, this repository can be used to produce an export of an EVM contract and an associated lock contract.




