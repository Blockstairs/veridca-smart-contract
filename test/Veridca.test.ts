import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/dist/src/signer-with-address';
import { expect } from 'chai';
import { ethers } from 'hardhat';
import { Veridca } from 'typechain-types';
import { IPFS_SAMPLE_URL } from './fixtures/constants';

enum Roles {
  DEFAULT_ADMIN_ROLE = '0x0000000000000000000000000000000000000000000000000000000000000000',
  ADMIN_ROLE = '0xa49807205ce4d355092ef5a8a18f56e8913cf4a201fbe287825b095693c21775',
  MINTER_ROLE = '0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6',
  PAUSER_ROLE = '0x65d7a28e3265b37a6474929f336521b332c1681b933f6cb9f3376673440d862a',
  BURNER_ROLE = '0x3c11d16cbaffd01df69ce1c404f6340ee057498f5f00246190ea54220576a848',
}
// SignerWithAddress
interface DeploySimpleFixture {
  CONTRACT_NAME: 'Veridca';
  CONTRACT_SYMBOL: 'VR';
  owner: SignerWithAddress;
  otherAccount: SignerWithAddress;
  veridca: Veridca;
  initialTokenId: number;
}

describe('Veridca', function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deploySimpleFixture(): Promise<DeploySimpleFixture> {
    const CONTRACT_NAME = 'Veridca' as const;
    const CONTRACT_SYMBOL = 'VR' as const;
    const initialTokenId = 1;
    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount] = await ethers.getSigners();

    const Veridca = await ethers.getContractFactory('Veridca');
    const veridca = await Veridca.deploy();
    await veridca.deployed();

    // Contract utilizes OpenZeppelin's ERC721Upgradable as a base, so we need to initialize it
    await veridca.initialize(owner.address, CONTRACT_NAME, CONTRACT_SYMBOL);

    return { veridca, owner, otherAccount, CONTRACT_NAME, CONTRACT_SYMBOL, initialTokenId };
  }

  describe('Deployment', function () {
    it('should revert if it is already initialized', async function () {
      const { veridca, owner, CONTRACT_NAME, CONTRACT_SYMBOL } = await loadFixture(deploySimpleFixture);
      await expect(veridca.initialize(owner.address, CONTRACT_NAME, CONTRACT_SYMBOL)).to.be.revertedWith(
        'ERC721A__Initializable: contract is already initialized',
      );
    });

    it('should check if roles are correctly set', async function () {
      const { veridca } = await loadFixture(deploySimpleFixture);

      expect(await veridca.DEFAULT_ADMIN_ROLE()).to.equal(Roles.DEFAULT_ADMIN_ROLE);
      expect(await veridca.MINTER_ROLE()).to.equal(Roles.MINTER_ROLE);
      expect(await veridca.PAUSER_ROLE()).to.equal(Roles.PAUSER_ROLE);
      expect(await veridca.BURNER_ROLE()).to.equal(Roles.BURNER_ROLE);
    });

    it('should set the DEFAULT_ADMIN_ROLE to the sender', async function () {
      const { veridca, owner } = await loadFixture(deploySimpleFixture);
      expect(await veridca.hasRole(Roles.DEFAULT_ADMIN_ROLE, owner.address)).to.be.equal(true);
    });

    it('should set the MINTER_ROLE to the sender', async function () {
      const { veridca, owner } = await loadFixture(deploySimpleFixture);
      expect(await veridca.hasRole(Roles.MINTER_ROLE, owner.address)).to.be.equal(true);
    });

    it('should set the PAUSER_ROLE to the sender', async function () {
      const { veridca, owner } = await loadFixture(deploySimpleFixture);
      expect(await veridca.hasRole(Roles.PAUSER_ROLE, owner.address)).to.be.equal(true);
    });

    it('should set the BURNER_ROLE to the sender', async function () {
      const { veridca, owner } = await loadFixture(deploySimpleFixture);
      expect(await veridca.hasRole(Roles.BURNER_ROLE, owner.address)).to.be.equal(true);
    });

    it('should set the name of the token', async function () {
      const { veridca, CONTRACT_NAME } = await loadFixture(deploySimpleFixture);
      expect(await veridca.name()).to.be.equal(CONTRACT_NAME);
    });

    it('should set the symbol of the token', async function () {
      const { veridca, CONTRACT_SYMBOL } = await loadFixture(deploySimpleFixture);
      expect(await veridca.symbol()).to.be.equal(CONTRACT_SYMBOL);
    });

    it('should have the right initial token id', async function () {
      const { veridca, initialTokenId } = await loadFixture(deploySimpleFixture);
      expect(await veridca.currentIndex()).to.be.equal(initialTokenId);
    });

    it('should have the token id equals 1', async function () {
      const { veridca } = await loadFixture(deploySimpleFixture);
      expect(await veridca.currentIndex()).to.be.equal(await veridca.startTokenId());
    });
  });

  describe('EIP-165 support', function () {
    it('supports ERC165', async function () {
      const { veridca } = await loadFixture(deploySimpleFixture);
      expect(await veridca.supportsInterface('0x01ffc9a7')).to.be.equal(true);
    });

    it('supports IERC721', async function () {
      const { veridca } = await loadFixture(deploySimpleFixture);
      expect(await veridca.supportsInterface('0x80ac58cd')).to.eq(true);
    });

    it('supports ERC721Metadata', async function () {
      const { veridca } = await loadFixture(deploySimpleFixture);
      expect(await veridca.supportsInterface('0x5b5e139f')).to.eq(true);
    });

    it('does not support random interface', async function () {
      const { veridca } = await loadFixture(deploySimpleFixture);
      expect(await veridca.supportsInterface('0x00000042')).to.eq(false);
    });

    it('does not support an invalid interface', async function () {
      const { veridca } = await loadFixture(deploySimpleFixture);
      expect(await veridca.supportsInterface('0xffffffff')).to.eq(false);
    });
  });

  describe('Minting', function () {
    it('should mint a new token', async function () {
      const { veridca, owner, otherAccount } = await loadFixture(deploySimpleFixture);
      await veridca.safeMint(owner.address, IPFS_SAMPLE_URL);
      expect(await veridca.balanceOf(owner.address)).to.be.equal(1);
      expect(await veridca.ownerOf(1)).to.be.equal(owner.address);
      expect(await veridca.balanceOf(otherAccount.address)).to.be.equal(0);
      expect(await veridca.totalSupply()).to.be.equal(1);
      expect(await veridca.currentIndex()).to.be.equal(2);
      expect(await veridca.totalMinted()).to.be.equal(1);
      expect(await veridca.totalBurned()).to.be.equal(0);
    });

    it('should mint sequential tokens for the same address', async function () {
      const { veridca, owner } = await loadFixture(deploySimpleFixture);
      await veridca.safeMint(owner.address, IPFS_SAMPLE_URL);
      await veridca.safeMint(owner.address, IPFS_SAMPLE_URL);
      await veridca.safeMint(owner.address, IPFS_SAMPLE_URL);
      expect(await veridca.balanceOf(owner.address)).to.be.equal(3);
      expect(await veridca.ownerOf(1)).to.be.equal(owner.address);
      expect(await veridca.ownerOf(2)).to.be.equal(owner.address);
      expect(await veridca.ownerOf(3)).to.be.equal(owner.address);
      expect(await veridca.totalSupply()).to.be.equal(3);
      expect(await veridca.currentIndex()).to.be.equal(4);
      expect(await veridca.totalMinted()).to.be.equal(3);
      expect(await veridca.totalBurned()).to.be.equal(0);
    });

    it('should have the correct mint total', async function () {
      const { veridca, owner } = await loadFixture(deploySimpleFixture);
      await veridca.safeMint(owner.address, IPFS_SAMPLE_URL);
      await veridca.safeMint(owner.address, IPFS_SAMPLE_URL);
      await veridca.safeMint(owner.address, IPFS_SAMPLE_URL);
      expect(await veridca.totalSupply()).to.be.equal(3);
      expect(await veridca.totalMinted()).to.be.equal(3);
      expect(await veridca.currentIndex()).to.be.equal(4);
      expect(await veridca.totalBurned()).to.be.equal(0);
    });

    it('should mint sequential tokens for different addresses', async function () {
      const { veridca, owner, otherAccount } = await loadFixture(deploySimpleFixture);
      await veridca.safeMint(owner.address, IPFS_SAMPLE_URL);
      await veridca.safeMint(otherAccount.address, IPFS_SAMPLE_URL);
      await veridca.safeMint(owner.address, IPFS_SAMPLE_URL);
      expect(await veridca.balanceOf(owner.address)).to.be.equal(2);
      expect(await veridca.ownerOf(1)).to.be.equal(owner.address);
      expect(await veridca.ownerOf(2)).to.be.equal(otherAccount.address);
      expect(await veridca.ownerOf(3)).to.be.equal(owner.address);
      expect(await veridca.totalSupply()).to.be.equal(3);
      expect(await veridca.currentIndex()).to.be.equal(4);
      expect(await veridca.totalMinted()).to.be.equal(3);
      expect(await veridca.totalBurned()).to.be.equal(0);
    });

    it('should mint tokens with different URIs', async function () {
      const { veridca, owner, otherAccount } = await loadFixture(deploySimpleFixture);
      await expect(veridca.tokenURI(0)).to.be.revertedWithCustomError(veridca, 'URIQueryForNonexistentToken');
      await expect(veridca.tokenURI(1)).to.be.revertedWithCustomError(veridca, 'URIQueryForNonexistentToken');

      await veridca.safeMint(owner.address, 'ipfs://1');
      await veridca.safeMint(otherAccount.address, 'ipfs://2');
      await veridca.safeMint(owner.address, 'ipfs://3');
      expect(await veridca.tokenURI(1)).to.be.equal('ipfs://1');
      expect(await veridca.tokenURI(2)).to.be.equal('ipfs://2');
      expect(await veridca.tokenURI(3)).to.be.equal('ipfs://3');
    });

    it('should revert when minting a token with an invalid URI', async function () {
      const { veridca, owner } = await loadFixture(deploySimpleFixture);
      await expect(veridca.safeMint(owner.address, '')).to.be.revertedWithCustomError(veridca, 'URISetEmptyValue');
    });

    it('should revert if the sender is not a minter', async function () {
      const { veridca, otherAccount } = await loadFixture(deploySimpleFixture);
      const totalSupply = await veridca.totalSupply();

      expect(await veridca.hasRole(Roles.MINTER_ROLE, otherAccount.address)).to.be.equal(false);
      await expect(veridca.connect(otherAccount).safeMint(otherAccount.address, IPFS_SAMPLE_URL)).to.be.revertedWith(
        `AccessControl: account ${otherAccount.address.toLowerCase()} is missing role ${Roles.MINTER_ROLE}`,
      );
      expect(await veridca.totalSupply()).to.be.equal(totalSupply);
    });

    it('should revert if the sender is a minter but the recipient is the zero address', async function () {
      const { veridca, owner } = await loadFixture(deploySimpleFixture);
      const totalSupply = await veridca.totalSupply();

      expect(await veridca.hasRole(Roles.MINTER_ROLE, owner.address)).to.be.equal(true);
      await expect(veridca.safeMint(ethers.constants.AddressZero, IPFS_SAMPLE_URL)).to.be.revertedWithCustomError(
        veridca,
        'MintToZeroAddress',
      );
      expect(await veridca.totalSupply()).to.be.equal(totalSupply);
    });

    it('should revert if the sender is a minter but the recipient is the contract address', async function () {
      const { veridca, owner } = await loadFixture(deploySimpleFixture);
      const totalSupply = await veridca.totalSupply();

      expect(await veridca.hasRole(Roles.MINTER_ROLE, owner.address)).to.be.equal(true);
      await expect(veridca.safeMint(veridca.address, IPFS_SAMPLE_URL)).to.be.revertedWithCustomError(
        veridca,
        'TransferToNonERC721ReceiverImplementer',
      );
      expect(await veridca.totalSupply()).to.be.equal(totalSupply);
    });

    it('should emit a Transfer event', async function () {
      const { veridca, owner, otherAccount } = await loadFixture(deploySimpleFixture);
      const totalSupply = await veridca.totalSupply();
      const minterBalance = await veridca.balanceOf(owner.address);
      const recipientBalance = await veridca.balanceOf(otherAccount.address);

      expect(await veridca.hasRole(Roles.MINTER_ROLE, owner.address)).to.be.equal(true);
      await expect(veridca.safeMint(otherAccount.address, IPFS_SAMPLE_URL))
        .to.emit(veridca, 'Transfer')
        .withArgs(ethers.constants.AddressZero, otherAccount.address, 1);

      expect(await veridca.totalSupply()).to.be.equal(totalSupply.add(1));
      expect(await veridca.balanceOf(owner.address)).to.be.equal(minterBalance);
      expect(await veridca.balanceOf(otherAccount.address)).to.be.equal(recipientBalance.add(1));
    });
  });

  describe('Transfer', function () {
    it('should transfer a token from one address to another', async function () {
      const { veridca, owner, otherAccount } = await loadFixture(deploySimpleFixture);
      await veridca.safeMint(owner.address, IPFS_SAMPLE_URL);
      await veridca.safeMint(owner.address, IPFS_SAMPLE_URL);
      await veridca.safeMint(owner.address, IPFS_SAMPLE_URL);
      await veridca.safeMint(owner.address, IPFS_SAMPLE_URL);
      await veridca.safeMint(owner.address, IPFS_SAMPLE_URL);
      expect(await veridca.balanceOf(owner.address)).to.be.equal(5);
      expect(await veridca.balanceOf(otherAccount.address)).to.be.equal(0);

      await veridca.connect(owner).transferFrom(owner.address, otherAccount.address, 1);
      expect(await veridca.balanceOf(owner.address)).to.be.equal(4);
      expect(await veridca.balanceOf(otherAccount.address)).to.be.equal(1);
      expect(await veridca.ownerOf(1)).to.be.equal(otherAccount.address);
      expect(await veridca.totalSupply()).to.be.equal(5);
      expect(await veridca.currentIndex()).to.be.equal(6);
      expect(await veridca.totalMinted()).to.be.equal(5);
      expect(await veridca.totalBurned()).to.be.equal(0);
    });

    it('should transfer a token from one address to another and emit a Transfer event', async function () {
      const { veridca, owner, otherAccount } = await loadFixture(deploySimpleFixture);
      await veridca.safeMint(owner.address, IPFS_SAMPLE_URL);
      await veridca.safeMint(owner.address, IPFS_SAMPLE_URL);
      await veridca.safeMint(owner.address, IPFS_SAMPLE_URL);
      await veridca.safeMint(owner.address, IPFS_SAMPLE_URL);
      await veridca.safeMint(owner.address, IPFS_SAMPLE_URL);
      expect(await veridca.balanceOf(owner.address)).to.be.equal(5);
      expect(await veridca.balanceOf(otherAccount.address)).to.be.equal(0);

      await expect(veridca.connect(owner).transferFrom(owner.address, otherAccount.address, 1))
        .to.emit(veridca, 'Transfer')
        .withArgs(owner.address, otherAccount.address, 1);

      expect(await veridca.balanceOf(owner.address)).to.be.equal(4);
      expect(await veridca.balanceOf(otherAccount.address)).to.be.equal(1);
      expect(await veridca.ownerOf(1)).to.be.equal(otherAccount.address);
      expect(await veridca.totalSupply()).to.be.equal(5);
      expect(await veridca.currentIndex()).to.be.equal(6);
      expect(await veridca.totalMinted()).to.be.equal(5);
      expect(await veridca.totalBurned()).to.be.equal(0);
    });

    it('should transfer a token from one address to another and emit a Transfer event', async function () {
      const { veridca, owner, otherAccount } = await loadFixture(deploySimpleFixture);
      await veridca.safeMint(owner.address, IPFS_SAMPLE_URL);
      await veridca.safeMint(owner.address, IPFS_SAMPLE_URL);
      await veridca.safeMint(otherAccount.address, IPFS_SAMPLE_URL);
      await veridca.safeMint(owner.address, IPFS_SAMPLE_URL);
      await veridca.safeMint(owner.address, IPFS_SAMPLE_URL);
      expect(await veridca.balanceOf(owner.address)).to.be.equal(4);
      expect(await veridca.balanceOf(otherAccount.address)).to.be.equal(1);

      await expect(veridca.connect(owner).transferFrom(owner.address, otherAccount.address, 1))
        .to.emit(veridca, 'Transfer')
        .withArgs(owner.address, otherAccount.address, 1);

      expect(await veridca.balanceOf(owner.address)).to.be.equal(3);
      expect(await veridca.balanceOf(otherAccount.address)).to.be.equal(2);
      expect(await veridca.ownerOf(1)).to.be.equal(otherAccount.address);
      expect(await veridca.totalSupply()).to.be.equal(5);
      expect(await veridca.currentIndex()).to.be.equal(6);
      expect(await veridca.totalMinted()).to.be.equal(5);
      expect(await veridca.totalBurned()).to.be.equal(0);
    });

    it('should transfer a token from one address if it is approved', async function () {
      const { veridca, owner, otherAccount } = await loadFixture(deploySimpleFixture);
      await veridca.safeMint(owner.address, IPFS_SAMPLE_URL);
      await veridca.safeMint(owner.address, IPFS_SAMPLE_URL);

      expect(await veridca.getApproved(1)).not.to.be.equal(otherAccount.address);
      expect(await veridca.isApprovedForAll(owner.address, otherAccount.address)).to.be.equal(false);
      // Set approval for otherAccount to transfer token 1
      await veridca.connect(owner).approve(otherAccount.address, 1);
      expect(await veridca.getApproved(1)).not.to.be.equal(owner.address);
      expect(await veridca.getApproved(1)).to.be.equal(otherAccount.address);
      // Transfer token 1 from owner to otherAccount
      await veridca.connect(otherAccount).transferFrom(owner.address, otherAccount.address, 1);
      expect(await veridca.balanceOf(owner.address)).to.be.equal(1);
      expect(await veridca.balanceOf(otherAccount.address)).to.be.equal(1);
      expect(await veridca.ownerOf(1)).to.be.equal(otherAccount.address);
      expect(await veridca.totalSupply()).to.be.equal(2);
      expect(await veridca.currentIndex()).to.be.equal(3);
      expect(await veridca.totalMinted()).to.be.equal(2);
      expect(await veridca.totalBurned()).to.be.equal(0);
      expect(await veridca.getApproved(1)).not.to.be.equal(owner.address);
      expect(await veridca.getApproved(1)).not.to.be.equal(otherAccount.address);
    });

    it('should transfer a token from one address if it is approved for all', async function () {
      const { veridca, owner, otherAccount } = await loadFixture(deploySimpleFixture);
      await veridca.safeMint(owner.address, IPFS_SAMPLE_URL);
      await veridca.safeMint(owner.address, IPFS_SAMPLE_URL);

      expect(await veridca.getApproved(1)).not.to.be.equal(otherAccount.address);
      expect(await veridca.isApprovedForAll(owner.address, otherAccount.address)).to.be.equal(false);
      // Set approval for otherAccount to transfer token 1
      await veridca.connect(owner).setApprovalForAll(otherAccount.address, true);
      expect(await veridca.getApproved(1)).not.to.be.equal(owner.address);
      expect(await veridca.getApproved(1)).not.to.be.equal(otherAccount.address);
      expect(await veridca.isApprovedForAll(owner.address, otherAccount.address)).to.be.equal(true);
      // Transfer token 1 from owner to otherAccount
      await veridca.connect(otherAccount).transferFrom(owner.address, otherAccount.address, 1);
      expect(await veridca.balanceOf(owner.address)).to.be.equal(1);
      expect(await veridca.balanceOf(otherAccount.address)).to.be.equal(1);
      expect(await veridca.ownerOf(1)).to.be.equal(otherAccount.address);
      expect(await veridca.totalSupply()).to.be.equal(2);
      expect(await veridca.currentIndex()).to.be.equal(3);
      expect(await veridca.totalMinted()).to.be.equal(2);
      expect(await veridca.totalBurned()).to.be.equal(0);
      expect(await veridca.getApproved(1)).not.to.be.equal(owner.address);
      expect(await veridca.getApproved(1)).not.to.be.equal(otherAccount.address);
    });

    it('should not transfer a token from one address if it is not approved', async function () {
      const { veridca, owner, otherAccount } = await loadFixture(deploySimpleFixture);
      await veridca.safeMint(owner.address, IPFS_SAMPLE_URL);
      await veridca.safeMint(owner.address, IPFS_SAMPLE_URL);

      expect(await veridca.getApproved(1)).not.to.be.equal(otherAccount.address);
      expect(await veridca.isApprovedForAll(owner.address, otherAccount.address)).to.be.equal(false);

      expect(await veridca.getApproved(1)).not.to.be.equal(owner.address);
      expect(await veridca.getApproved(1)).not.to.be.equal(otherAccount.address);
      // Transfer token 1 from owner to otherAccount
      await expect(
        veridca.connect(otherAccount).transferFrom(owner.address, otherAccount.address, 1),
      ).to.be.revertedWithCustomError(veridca, `TransferCallerNotOwnerNorApproved`);

      expect(await veridca.balanceOf(owner.address)).to.be.equal(2);
      expect(await veridca.balanceOf(otherAccount.address)).to.be.equal(0);
      expect(await veridca.ownerOf(1)).to.be.equal(owner.address);
      expect(await veridca.totalSupply()).to.be.equal(2);
      expect(await veridca.currentIndex()).to.be.equal(3);
      expect(await veridca.totalMinted()).to.be.equal(2);
      expect(await veridca.totalBurned()).to.be.equal(0);
    });

    it('should not transfer a token from one address if it is not approved for all', async function () {
      const { veridca, owner, otherAccount } = await loadFixture(deploySimpleFixture);
      await veridca.safeMint(owner.address, IPFS_SAMPLE_URL);
      await veridca.safeMint(owner.address, IPFS_SAMPLE_URL);

      expect(await veridca.getApproved(1)).not.to.be.equal(otherAccount.address);
      expect(await veridca.isApprovedForAll(owner.address, otherAccount.address)).to.be.equal(false);
      // Set approval for otherAccount to transfer token 1
      await veridca.connect(owner).setApprovalForAll(otherAccount.address, false);
      expect(await veridca.getApproved(1)).not.to.be.equal(owner.address);
      expect(await veridca.getApproved(1)).not.to.be.equal(otherAccount.address);
      expect(await veridca.isApprovedForAll(owner.address, otherAccount.address)).to.be.equal(false);
      // Transfer token 1 from owner to otherAccount
      await expect(
        veridca.connect(otherAccount).transferFrom(owner.address, otherAccount.address, 1),
      ).to.be.revertedWithCustomError(veridca, `TransferCallerNotOwnerNorApproved`);

      expect(await veridca.balanceOf(owner.address)).to.be.equal(2);
      expect(await veridca.balanceOf(otherAccount.address)).to.be.equal(0);
      expect(await veridca.ownerOf(1)).to.be.equal(owner.address);
      expect(await veridca.totalSupply()).to.be.equal(2);
      expect(await veridca.currentIndex()).to.be.equal(3);
      expect(await veridca.totalMinted()).to.be.equal(2);
      expect(await veridca.totalBurned()).to.be.equal(0);
    });

    it('should revert if the sender is not the owner of the token', async function () {
      const { veridca, owner, otherAccount } = await loadFixture(deploySimpleFixture);
      await veridca.safeMint(owner.address, IPFS_SAMPLE_URL);
      await expect(
        veridca.connect(otherAccount).transferFrom(owner.address, otherAccount.address, 1),
      ).to.be.revertedWithCustomError(veridca, `TransferCallerNotOwnerNorApproved`);
    });

    it('should revert if the sender is not the owner of the token and not approved', async function () {
      const { veridca, owner, otherAccount } = await loadFixture(deploySimpleFixture);
      await veridca.safeMint(owner.address, IPFS_SAMPLE_URL);
      await expect(
        veridca.connect(otherAccount).transferFrom(owner.address, otherAccount.address, 1),
      ).to.be.revertedWithCustomError(veridca, `TransferCallerNotOwnerNorApproved`);
    });

    it('should revert if the sender is not the owner of the token and not approved for all', async function () {
      const { veridca, owner, otherAccount } = await loadFixture(deploySimpleFixture);
      await veridca.safeMint(owner.address, IPFS_SAMPLE_URL);
      await expect(
        veridca.connect(otherAccount).transferFrom(owner.address, otherAccount.address, 1),
      ).to.be.revertedWithCustomError(veridca, `TransferCallerNotOwnerNorApproved`);
    });

    it('should revert if the sender is the owner of the token but the recipient is the zero address', async function () {
      const { veridca, owner } = await loadFixture(deploySimpleFixture);
      await veridca.safeMint(owner.address, IPFS_SAMPLE_URL);
      await expect(
        veridca.connect(owner).transferFrom(owner.address, ethers.constants.AddressZero, 1),
      ).to.be.revertedWithCustomError(veridca, `TransferToZeroAddress`);
    });
  });

  describe('Burn', function () {
    it('should revert if the sender is not a burner', async function () {
      const { veridca, otherAccount } = await loadFixture(deploySimpleFixture);
      expect(await veridca.hasRole(Roles.BURNER_ROLE, otherAccount.address)).to.be.equal(false);

      await expect(veridca.connect(otherAccount).burn(1)).to.be.revertedWith(
        `AccessControl: account ${otherAccount.address.toLowerCase()} is missing role ${Roles.BURNER_ROLE}`,
      );
    });

    it('should burn a token', async function () {
      const { veridca, owner, initialTokenId } = await loadFixture(deploySimpleFixture);
      expect(await veridca.totalSupply()).to.be.equal(0);
      expect(await veridca.totalMinted()).to.be.equal(0);
      expect(await veridca.totalBurned()).to.be.equal(0);
      expect(await veridca.currentIndex()).to.be.equal(initialTokenId);

      await veridca.safeMint(owner.address, IPFS_SAMPLE_URL);
      await veridca.burn(1);

      expect(await veridca.balanceOf(owner.address)).to.be.equal(0);
      await expect(veridca.ownerOf(1)).to.revertedWithCustomError(veridca, 'OwnerQueryForNonexistentToken');
      await expect(veridca.tokenURI(1)).to.revertedWithCustomError(veridca, 'URIQueryForNonexistentToken');
      expect(await veridca.totalSupply()).to.be.equal(0);
      expect(await veridca.currentIndex()).to.be.equal(initialTokenId + 1);
      expect(await veridca.totalMinted()).to.be.equal(1);
      expect(await veridca.totalBurned()).to.be.equal(1);
    });

    it('should revert if the token does not exist', async function () {
      const { veridca, owner, initialTokenId } = await loadFixture(deploySimpleFixture);
      expect(await veridca.hasRole(Roles.BURNER_ROLE, owner.address)).to.be.equal(true);
      expect(await veridca.totalSupply()).to.be.equal(0);

      await expect(veridca.burn(1)).to.be.revertedWithCustomError(veridca, 'OwnerQueryForNonexistentToken');
      expect(await veridca.currentIndex()).to.be.equal(initialTokenId);
      expect(await veridca.totalSupply()).to.be.equal(0);
      expect(await veridca.totalMinted()).to.be.equal(0);
      expect(await veridca.totalBurned()).to.be.equal(0);
    });

    it('should emit a Transfer event', async function () {
      const { veridca, owner } = await loadFixture(deploySimpleFixture);
      await veridca.safeMint(owner.address, IPFS_SAMPLE_URL);
      await expect(veridca.burn(1))
        .to.emit(veridca, 'Transfer')
        .withArgs(owner.address, ethers.constants.AddressZero, 1);

      await veridca.safeMint(owner.address, IPFS_SAMPLE_URL);
      await expect(veridca.burn(2))
        .to.emit(veridca, 'Transfer')
        .withArgs(owner.address, ethers.constants.AddressZero, 2);

      await veridca.safeMint(owner.address, IPFS_SAMPLE_URL);
      await expect(veridca.burn(3));
    });
  });

  describe('Exists', function () {
    it('should return true if the token exists', async function () {
      const { veridca, owner, initialTokenId } = await loadFixture(deploySimpleFixture);
      expect(await veridca.totalSupply()).to.be.equal(0);
      expect(await veridca.exists(initialTokenId)).to.be.equal(false);
      await veridca.safeMint(owner.address, IPFS_SAMPLE_URL);
      expect(await veridca.exists(initialTokenId)).to.be.equal(true);
      expect(await veridca.totalMinted()).to.be.equal(1);
    });

    it('should return false if the token does not exist', async function () {
      const { veridca, initialTokenId } = await loadFixture(deploySimpleFixture);
      expect(await veridca.totalMinted()).to.be.equal(0);
      expect(await veridca.exists(initialTokenId)).to.be.equal(false);
    });
  });

  describe('TokenURI', function () {
    it('should return the token URI', async function () {
      const { veridca, owner } = await loadFixture(deploySimpleFixture);
      expect(await veridca.totalMinted()).to.be.equal(0);
      await veridca.safeMint(owner.address, IPFS_SAMPLE_URL);
      expect(await veridca.tokenURI(1)).to.be.equal(IPFS_SAMPLE_URL);
      expect(await veridca.totalMinted()).to.be.equal(1);
    });

    it('should revert if the token does not exist', async function () {
      const { veridca } = await loadFixture(deploySimpleFixture);
      expect(await veridca.totalMinted()).to.be.equal(0);
      await expect(veridca.tokenURI(1)).to.be.revertedWithCustomError(veridca, 'URIQueryForNonexistentToken');
    });

    it('should revert if the token URI is empty', async function () {
      const { veridca, owner } = await loadFixture(deploySimpleFixture);
      expect(await veridca.totalMinted()).to.be.equal(0);

      await expect(veridca.safeMint(owner.address, '')).to.revertedWithCustomError(veridca, 'URISetEmptyValue');
      expect(await veridca.exists(1)).to.be.equal(false);
    });

    // it('should revert if setTokenURL if called for a non-existent token', async function () {
    //   const { veridca } = await loadFixture(deploySimpleFixture);
    //   expect(await veridca.totalMinted()).to.be.equal(0);
    //   await expect(veridca.setTokenURI(1, IPFS_SAMPLE_URL)).to.be.revertedWithCustomError(
    //     veridca,
    //     'URIQueryForNonexistentToken',
    //   );
    // });
  });
});
