import '@nomicfoundation/hardhat-toolbox';
import '@nomiclabs/hardhat-ethers';
import '@nomiclabs/hardhat-etherscan';
import '@nomiclabs/hardhat-solhint';
import '@openzeppelin/hardhat-upgrades';
import '@primitivefi/hardhat-dodoc';
import '@typechain/hardhat';
import 'dotenv/config';
import 'hardhat-abi-exporter';
import 'hardhat-output-validator';
import 'hardhat-tracer';
import 'hardhat-watcher';
import { HardhatUserConfig, task } from 'hardhat/config';
import * as _ from 'radash';
import { utils } from 'ethers';
import * as prettyjson from 'prettyjson';

const { PRIVATE_KEY, MNEMONIC } = process.env;

task('accounts:mnemonic', 'Prints the list of accounts', async (_, hre) => {
  if (MNEMONIC == null || !utils.isValidMnemonic(MNEMONIC)) {
    throw new Error(`Invalid Mnemonic: ${MNEMONIC!.toString()}`);
  }
  const hd = utils.HDNode.fromMnemonic(MNEMONIC);
  const wallet = new hre.ethers.Wallet(hd, hre.ethers.provider);

  const accounts: {
    parent: Record<string, string>;
    children: Array<Record<string, string>>;
  } = {
    parent: {
      mnemonic: MNEMONIC,
      address: wallet.address,
      publicKey: wallet.publicKey,
      privateKey: wallet.privateKey,
    },
    children: [],
  };

  for (let i = 0; i < 2; i++) {
    const path = utils.defaultPath.slice(0, -1).concat(i.toString());
    const child = hd.derivePath(path);

    accounts.children.push({
      child: `${i} - ${path}`,
      address: child.address,
      publicKey: child.publicKey,
      privateKey: child.privateKey,
    });
  }

  console.log(prettyjson.render(accounts));
});

// TODO refactor
const getAccounts = (): any => {
  if (!(_.isString(PRIVATE_KEY) || _.isString(MNEMONIC))) return {};

  return {
    accounts:
      PRIVATE_KEY != null
        ? [PRIVATE_KEY]
        : {
            mnemonic: MNEMONIC,
          },
  };
};

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: '0.8.17',
        settings: {
          optimizer: {
            enabled: true,
            runs: 10000,
          },
          outputSelection: {
            '*': {
              '*': ['evm.bytecode', 'evm.deployedBytecode', 'devdoc', 'userdoc', 'metadata', 'abi'],
            },
          },
          libraries: {},
        },
      },
    ],
  },
  defaultNetwork: _.isString(process.env.HARDHAT_NETWORK) ? process.env.HARDHAT_NETWORK : 'hardhat',
  networks: {
    hardhat: {
      chainId: 1337,
      accounts: _.shake({
        mnemonic: MNEMONIC,
      }),
      gasPrice: 2_000_000_000,
    },
    localhost: {
      mining: {
        auto: true,
        interval: 300,
      },
    },
    polygon: {
      url: `https://polygon-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_KEY!}`,
      ...getAccounts(),
    },
    polygon_mumbai: {
      url: `https://polygon-mumbai.g.alchemy.com/v2/${process.env.ALCHEMY_KEY!}`,
      ...getAccounts(),
    },
    goerli: {
      url: `https://eth-goerli.alchemyapi.io/v2/${process.env.ALCHEMY_KEY!}`,
      ...getAccounts(),
    },
  },
  etherscan: {
    // Your API key for Etherscan
    // Obtain one at https://etherscan.io/
    apiKey: _.shake({
      goerli: process.env.ETHERSCAN_API_KEY,
      polygon: process.env.POLYGONSCAN_API_KEY,
      polygonMumbai: process.env.POLYGONSCAN_API_KEY,
    }),
  },
  abiExporter: {
    path: './data/abi',
    runOnCompile: false,
    clear: true,
    flat: true,
    spacing: 2,
    pretty: true,
  },

  outputValidator: {
    runOnCompile: false,
    errorMode: true,
    checks: {
      title: 'error',
      details: 'error',
      params: 'error',
      returns: 'error',
      compilationWarnings: 'warning',
      variables: false,
      events: false,
    },
    exclude: ['contracts/test-helpers', 'IExampleContract'],
  },

  watcher: {
    compile: {
      tasks: ['compile'],
    },
    test: {
      tasks: [{ command: 'test', params: { testFiles: ['{path}'] } }],
      files: ['./test/**/*'],
      verbose: true,
    },
  },
  typechain: {
    // ethers-v5 will add an artificial field contractName that helps discriminate between contracts
    discriminateTypes: true,
  },
  dodoc: {
    runOnCompile: false,
    debugMode: false,
  },
};

export default config;
