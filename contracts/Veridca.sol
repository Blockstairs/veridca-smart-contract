// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import {ERC721AUpgradeable} from "erc721a-upgradeable/contracts/ERC721AUpgradeable.sol";
import {ERC721AStorage} from "erc721a-upgradeable/contracts/ERC721AStorage.sol";
import {ERC721ABurnableUpgradeable} from "erc721a-upgradeable/contracts/extensions/ERC721ABurnableUpgradeable.sol";
import {IERC721AUpgradeable} from "erc721a-upgradeable/contracts/IERC721AUpgradeable.sol";
import {ERC721URIStorageUpgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721URIStorageUpgradeable.sol";
import {AccessControlUpgradeable} from "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import {IAccessControlUpgradeable} from "@openzeppelin/contracts-upgradeable/access/IAccessControlUpgradeable.sol";
import {IERC165Upgradeable} from "@openzeppelin/contracts-upgradeable/utils/introspection/IERC165Upgradeable.sol";

/**
 * @dev Invalid URI.
 */
error URISetEmptyValue();

/**
 * @title Veridca
 * @notice This contract is used to register and verify the ownership of digital assets.
 * @dev This contract is based on the EIP721.
 * @author Blockstairs
 */
contract Veridca is ERC721ABurnableUpgradeable, AccessControlUpgradeable {
    using ERC721AStorage for ERC721AStorage.Layout;

    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant BURNER_ROLE = keccak256("BURNER_ROLE");

    mapping(uint256 => string) private _tokenURIs;

    /**
     * @notice This function is used to initialize the contract.
     * @dev This function is based on the OpenZeppelin implementation of the Initializable standard and can only be called once
     * @param owner The address of the owner/admin of the contract
     * @param name The name of the token
     * @param symbol The symbol of the token
     */
    function initialize(
        address owner,
        string memory name,
        string memory symbol
    ) public initializerERC721A initializer {
        __ERC721A_init(name, symbol);
        __AccessControl_init();
        __ERC721ABurnable_init();

        _grantRole(DEFAULT_ADMIN_ROLE, owner);
        _grantRole(PAUSER_ROLE, owner);
        _grantRole(MINTER_ROLE, owner);
        _grantRole(BURNER_ROLE, owner);
    }

    /**
     * @notice This function is used to mint a new token with a URI.
     * @dev This function uses ERC721._safeMint() to mint the token.
     *
     * Requirements:
     *
     * - The sender must have `MINTER_ROLE`.
     *
     * @param to The address of the new owner of the token
     * @param uri The URI of the token
     */
    function safeMint(address to, string memory uri) external onlyRole(MINTER_ROLE) {
        _safeMint(to, 1);
        /// @dev currentIndex is the next id to be minted
        _setTokenURI(currentIndex() - 1, uri);
    }

    /**
     * @notice A distinct Uniform Resource Identifier (URI) for a given asset.
     *  @dev Throws if `tokenId` is not a valid NFT. URIs are defined in RFC
     * 3986. The URI may point to a JSON file that conforms to the "ERC721
     * Metadata JSON Schema".
     * @param tokenId The token id
     * @return The URI of the token
     */
    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721AUpgradeable, IERC721AUpgradeable)
        returns (string memory)
    {
        if (!_exists(tokenId)) revert URIQueryForNonexistentToken();

        return _tokenURIs[tokenId];
    }

    // function setTokenURI(uint256 tokenId, string memory _tokenURI) external onlyRole(DEFAULT_ADMIN_ROLE) {
    //     _setTokenURI(tokenId, _tokenURI);
    // }

    /**
     * @dev Sets `_tokenURI` as the tokenURI of `tokenId`.
     * @param tokenId The id of the token
     * @param _tokenURI The URI of the token
     *
     */
    function _setTokenURI(uint256 tokenId, string memory _tokenURI) internal virtual {
        if (!_exists(tokenId)) revert URIQueryForNonexistentToken();
        if (bytes(_tokenURI).length == 0) revert URISetEmptyValue();
        _tokenURIs[tokenId] = _tokenURI;
    }

    /**
     * @return uint256 The next id to be minted.
     */
    function currentIndex() public view returns (uint256) {
        return ERC721AStorage.layout()._currentIndex;
    }

    /**
     * @dev First id to be minted.
     * @return uint256 The first id to be minted.
     */
    function startTokenId() external pure returns (uint256) {
        return _startTokenId();
    }

    /**
     * @dev First id to be minted.
     */
    function _startTokenId() internal pure override returns (uint256) {
        return 1;
    }

    /**
     * @dev Burn a token.
     * @param tokenId The id of the token to be burned
     */
    function burn(uint256 tokenId) public override onlyRole(BURNER_ROLE) {
        if (bytes(_tokenURIs[tokenId]).length != 0) {
            delete _tokenURIs[tokenId];
        }
        _burn(tokenId, true);
    }

    /**
     * @dev Returns the total amount of tokens burned in the contract.
     * @return uint256 representing the total amount of tokens burned
     */
    function totalBurned() external view returns (uint256) {
        return _totalMinted() - totalSupply();
    }

    /**
     * @dev Returns the total amount of tokens minted in the contract.
     * @return uint256 representing the total amount of tokens minted
     */
    function totalMinted() external view returns (uint256) {
        return _totalMinted();
    }

    /**
     * @dev Return if the tokenId exists or not.
     * @param tokenId The id of the token
     * @return bool
     */
    function exists(uint256 tokenId) public view returns (bool) {
        return _exists(tokenId);
    }

    /**
     * @dev Check if the contract supports an interface.
     * @param interfaceId The id of the interface
     */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721AUpgradeable, AccessControlUpgradeable, IERC721AUpgradeable)
        returns (bool)
    {
        return ERC721AUpgradeable.supportsInterface(interfaceId) || super.supportsInterface(interfaceId);
    }
}
