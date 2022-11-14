import { ethers } from 'hardhat';

async function main(): Promise<void> {
  const [owner] = await ethers.getSigners();
  const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS ?? '0x9fe46736679d2d9a65f0992f2272de9f3c7fa6e0';
  const veridcaRegistry = await ethers.getContractAt('Veridca', CONTRACT_ADDRESS, owner);
  const currentIndex = await veridcaRegistry.currentIndex();
  const transaction = await veridcaRegistry.safeMint(
    owner.address,
    'ipfs://Qma3p7SnWr7ibseDYnjHSrH2fdM5MpphgjjeVBJRjLoSEM==',
  );
  console.group('Transaction');
  console.dir(transaction);
  console.groupEnd();

  console.group('Receipt');
  const receipt = await transaction.wait();
  console.dir(receipt);
  console.groupEnd();

  console.group('Info');
  const tokenId = currentIndex;
  const ownerOf = await veridcaRegistry.ownerOf(tokenId);
  console.log('Owner of token', tokenId.toString(), 'is', ownerOf);
  console.groupEnd();
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
