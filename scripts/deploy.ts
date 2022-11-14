import { ethers, network } from 'hardhat';

async function main(): Promise<void> {
  const CONTRACT_NAME = 'Veridca' as const;
  const CONTRACT_SYMBOL = 'VR' as const;
  const [owner] = await ethers.getSigners();
  const Veridca = await ethers.getContractFactory('Veridca');
  const veridca = await Veridca.deploy();
  await veridca.deployed();
  console.log('VeridcaRegistry deployed to:', veridca.address, network.name);

  await veridca.initialize(owner.address, CONTRACT_NAME, CONTRACT_SYMBOL);
  console.log('VeridcaRegistry initialized');
}
// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
