const { ethers } = require("hardhat");

async function main() {
    // Get the contract factory
    const ERC721 = await ethers.getContractFactory("ERC721");

    // Deploy the contract
    const erc721 = await ERC721.deploy();

    // Wait for the deployment to be mined
    await erc721.deployed();

    console.log("ERC721 deployed to:", erc721.address);
}

// Execute the deployment script
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
