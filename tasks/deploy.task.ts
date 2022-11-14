import { subtask, task } from 'hardhat/config';
import { Veridca } from 'typechain-types';
import { printTable } from './utils/print-table';

task('deploy:registry', 'Deploy VeridcaRegistry').setAction(async (taskArgs, hre) => {
  const [signer] = await hre.ethers.getSigners();
  const signerPrevBalance = await signer.getBalance();

  // await hre.run('print', { message: 'Hello, World!' });
  // await hre.run('print', { message: 'Hello, World!' });
  const VeridcaRegistry = await hre.ethers.getContractFactory('VeridcaRegistry', signer);
  const veridcaRegistry = await hre.upgrades.deployProxy(VeridcaRegistry);
  const deploy = (await veridcaRegistry.deployed()) as Veridca;
  console.log('VeridcaRegistry deployed to:', veridcaRegistry.address);

  printTable(
    {
      name: deploy.contractName,
      address: deploy.address,
      signerAddress: await signer.getAddress(),
      signerPrevBalance,
      signerPostBalance: await signer.getBalance(),

      gasPrice: deploy.deployTransaction.gasPrice,
      gasLimit: deploy.deployTransaction.gasLimit,
      chainId: deploy.deployTransaction.chainId,
      from: deploy.deployTransaction.from,
      hash: deploy.deployTransaction.hash,
      blockHash: deploy.deployTransaction.blockHash,
      blockNumber: deploy.deployTransaction.blockNumber,
      maxFeePerGas: deploy.deployTransaction.maxFeePerGas,
      maxPriorityFeePerGas: deploy.deployTransaction.maxPriorityFeePerGas,
      value: deploy.deployTransaction.value,
      confirmations: deploy.deployTransaction.confirmations,
    },
    'VeridcaRegistry deployment',
  );
});

subtask('print', 'Prints a message')
  .addParam('message', 'The message to print')
  .setAction(async (taskArgs) => {
    // Using commonjs?
    // const { table } = require('table');

    const data = [
      ['0A', '0B', '0C'],
      [
        '1A AIJIJAIJAIJIJAIJAI AIJIJAIJAIJIJAIJAI AIJIJAIJAIJIJAIJAI AIJIJAIJAIJIJAIJAI',
        '1B',
        'AIJIJAIJAIJIJAIJAIAIJIJAIJAIJIJAIJAIAIJIJAIJAIJIJAIJAI',
      ],
      ['2A', '2B', '2C'],
    ];

    printTable(taskArgs);
    printTable(data);
    // console.log();
  });
