# Veridca Registry

[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)

<!-- TODO describe Veridca Registry -->

## Table of Contents

- [The Project](#the-project)
- [Developers](#developers)
- [Resources](#resources)

## The Project

A smart contract for minting NFT token related to real life content hosted on IPFS.

## Developers

### Prerequisites

- [Node Version Manager](https://github.com/nvm-sh/nvm/) - Recommended way to install Node.js and NPM
- [Node.js](https://nodejs.org/en/) - Version: ^16.17.1
- [NPM](https://www.npmjs.com/) - Version: ^8.19.2

These versions are referenced in the `.nvmrc` file and `package.json`.

### Installing

First, you will need to install the dependencies. Yarn is not supported because `@nomicfoundation/hardhat-toolbox` is not compatible with it.

```
npm install
```

Then, is recommended to install the [Hardhat](https://hardhat.org/) CLI globally.

```
npm install -g hardhat
```

### Smart Contract

First, you will have to set up a local network by running the following command:

```
npm run node:localhost
```

> By default, the network is hardhat(in memory node instance) but it can be change setting `HARDHAT_NETWORK=hardhat`.

Afterwards, compile the smart contracts by running the following command in your terminal:

```
npm run compile

```

You run in watch mode to recompile the smart contracts when you make changes to them:

```
npm run compile:watch
```

### Testing

To run the tests, run the following command:

```
npm run test
```

You can also run the tests in watch mode:

```
npm run test:watch
```

### Coverage

To run the coverage, run the following command:

```
npm run coverage
```

### Gas Report

To run the gas report, run the following command:

```
npm run gas-report
```

### Linting

To lint the smart contracts, run the following command:

```
npm run lint:sol
```

### Deployment

To deploy the smart contracts, run the following command:

```
<!-- npm run run scripts/deploy.js --network <network> -->
```

### Technology stack

- `Solidity`
- `hardhat`
- `ethers.js`
- `node.js`
- `IPFS`
- `Alchemy`
- `OpenZeppelin Contracts`

### Roadmap

- [x] Setup the project
- [x] Set up the smart contract
- [x] Set up linting and formatting
- [x] Set up a test environment
- [x] Set up a CI

### Features

#### Contract

- [x] Mint NFT token with a URI
- [x] Burn NFT token
- [x] Manage NFT token ownership
- [x] Manage roles
- [x] Token Level metadata

#### Extras

- [x] Source code verification on Etherscan
- [ ] Source code verification on Sourcify\*

### Excluded features

- [ ] ~~Pause the contract preventing minting, burning, and transferring~~
- [ ] ~~Contract Level metadata~~

## Resources

- [Ethereum](https://ethereum.org/en/developers/)
- [Solidity](https://docs.soliditylang.org/en/v0.8.17/)
- [Hardhat](https://hardhat.org/getting-started/)
- [ethers.js](https://docs.ethers.io/v5/)
- [Alchemy](https://www.alchemy.com/)
- [Open Zeppelin Contracts](https://www.openzeppelin.com/contracts/)
- [Azuki ERC721A](https://www.erc721a.org/)
