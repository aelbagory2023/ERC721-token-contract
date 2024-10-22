pragma solidity ^0.8.0;

interface IERC165 {
    function supportsInterface(bytes4 interfaceId) external view returns (bool);
}

interface IERC721 is IERC165 {
    function balanceOf(address owner) external view returns (uint256);
    function ownerOf(uint256 tokenId) external view returns (address);
    function safeTransferFrom(address from, address to, uint256 tokenId) external;
    function safeTransferFrom(address from, address to, uint256 tokenId, bytes calldata data) external;
    function transferFrom(address from, address to, uint256 tokenId) external;
    function approve(address to, uint256 tokenId) external;
    function getApproved(uint256 tokenId) external view returns (address);
    function setApprovalForAll(address operator, bool approved) external;
}

interface ERC721receiver {
    function onERC721Received(address operator, address from, uint256 tokenId, bytes calldata data) external returns (bytes4);
}

interface IERC721Metadata is IERC721 {
    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);
    event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId);
    event ApprovalForAll(address indexed owner, address indexed operator, bool approved);
    event Mint(address indexed to, uint256 indexed tokenId);
}

contract ERC721 is IERC721, IERC721Metadata {
    address public owner;

    constructor() {
        owner = msg.sender;
    }

    mapping(uint => address) internal _ownerOf;
    mapping(address => uint) internal _balanceOf;
    mapping(uint => address) internal _approvals;
    mapping(address => mapping(address => bool)) public _isApprovedForAll;
  
    function supportsInterface(bytes4 interfaceId) external pure returns (bool) {
        return interfaceId == type(IERC721).interfaceId || 
               interfaceId == type(IERC165).interfaceId ||
               interfaceId == type(IERC721Metadata).interfaceId;
    }
    function balanceOf(address account) external view returns (uint256){ // Renamed parameter
        require(account != address(0), "ERC721: balance query for the zero address");
        return _balanceOf[account]; // Updated to use the new parameter name
    }

    function ownerOf(uint256 tokenId) external view returns (address) {
        address tokenOwner = _ownerOf[tokenId]; // Renamed local variable
        require(tokenOwner != address(0), "ERC721: owner query for nonexistent token");
        return tokenOwner; // Return the renamed variable
    }
    function setApprovalForAll(address operator, bool approved) external{
        _isApprovedForAll[msg.sender][operator] = approved;
        emit ApprovalForAll(msg.sender, operator, approved);    
    }

    function approve(address to, uint256 tokenId) external {
        address ownerOfToken = _ownerOf[tokenId];
        require(to != ownerOfToken, "ERC721: approval to current owner");
        require(
            msg.sender == ownerOfToken || _isApprovedForAll[ownerOfToken][msg.sender],
            "ERC721: approve caller is not owner nor approved for all"
        );
        _approvals[tokenId] = to;
        emit Approval(ownerOfToken, to, tokenId);
    }
    function getApproved(uint256 tokenId) external view returns (address){
        require(_ownerOf[tokenId] != address(0), "ERC721: approved query for nonexistent token");
        return _approvals[tokenId];
    }
    function isApprovedOrOwner(address ownerOfToken, address spender, uint256 tokenId) internal view returns (bool){
        return (spender == ownerOfToken || _isApprovedForAll[ownerOfToken][spender] || spender == _approvals[tokenId]);
    }
    function transferFrom(address from, address to, uint256 tokenId) public{
        require(from == _ownerOf[tokenId], "ERC721: transfer of token that is not own");
        require(to != address(0), "ERC721: transfer to the zero address");
        require(isApprovedOrOwner(from, msg.sender, tokenId), "ERC721: transfer caller is not owner nor approved");

        _balanceOf[from] --;
        _balanceOf[to] ++;
        _ownerOf[tokenId] = to;
        delete _approvals[tokenId];
        emit Transfer(from, to, tokenId);
    }
    function safeTransferFrom(address from, address to, uint256 tokenId) external{
        transferFrom(from, to, tokenId);

        require( to.code.length == 0 || ERC721receiver(to).onERC721Received(msg.sender, from, tokenId, "") == ERC721receiver.onERC721Received.selector, "ERC721: transfer to non ERC721Receiver implementer");
    }
    function safeTransferFrom(address from, address to, uint256 tokenId, bytes calldata data) external{
        transferFrom(from, to, tokenId);
        require( to.code.length == 0 || ERC721receiver(to).onERC721Received(msg.sender, from, tokenId, data) == ERC721receiver.onERC721Received.selector, "ERC721: transfer to non ERC721Receiver implementer");
    }

    function mint(address to, uint256 tokenId) public {
        require(msg.sender == owner, "ERC721: only owner can mint");
        require(to != address(0), "ERC721: mint to the zero address");
        require(_ownerOf[tokenId] == address(0), "ERC721: token already minted");

        _balanceOf[to]++;
        _ownerOf[tokenId] = to;

        emit Transfer(address(0), to, tokenId);
        emit Mint(to, tokenId);
    }
}
