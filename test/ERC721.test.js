const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ERC721", function () {
    let ERC721, erc721, owner, addr1, addr2;
    beforeEach(async function () {
        ERC721 = await ethers.getContractFactory("ERC721");
        [owner, addr1, addr2] = await ethers.getSigners();
        erc721 = await ERC721.deploy();
    });

    describe("Deployment", function () {
        it("Should set the right owner", async function () {
            expect(await erc721.owner()).to.equal(owner.address);
        });
    });

    describe("Minting", function () {
        it("Should mint a token", async function () {
            await erc721.mint(addr1.address, 1);
            expect(await erc721.ownerOf(1)).to.equal(addr1.address);
        });

        it("Should revert if non-owner tries to mint", async function () {
            await expect(erc721.connect(addr1).mint(addr2.address, 1)).to.be.revertedWith("ERC721: only owner can mint");
        });
    });

    describe("Balance and Ownership", function () {
        beforeEach(async function () {
            await erc721.mint(addr1.address, 1);
        });

        it("Should return the correct balance of an address", async function () {
            expect(await erc721.balanceOf(addr1.address)).to.equal(1);
        });

        it("Should return the correct owner of a token", async function () {
            expect(await erc721.ownerOf(1)).to.equal(addr1.address);
        });

        it("Should revert if querying the owner of a nonexistent token", async function () {
            await expect(erc721.ownerOf(2)).to.be.revertedWith("ERC721: owner query for nonexistent token");
        });
    });

    describe("Approvals", function () {
        beforeEach(async function () {
            await erc721.mint(addr1.address, 1);
        });

        it("Should approve an address to transfer a token", async function () {
            await erc721.connect(addr1).approve(addr2.address, 1);
            expect(await erc721.getApproved(1)).to.equal(addr2.address);
        });

        it("Should emit an Approval event", async function () {
            await expect(erc721.connect(addr1).approve(addr2.address, 1))
                .to.emit(erc721, "Approval")
                .withArgs(addr1.address, addr2.address, 1);
        });
    });

    describe("Transfers", function () {
        beforeEach(async function () {
            await erc721.mint(addr1.address, 1);
        });

        it("Should transfer a token from one address to another", async function () {
            await erc721.connect(addr1).transferFrom(addr1.address, addr2.address, 1);
            expect(await erc721.ownerOf(1)).to.equal(addr2.address);
        });
    });

    describe("Safe Transfers", function () {
        beforeEach(async function () {
            await erc721.mint(addr1.address, 1);
        });

        it("Should safely transfer a token", async function () {
            await erc721.connect(addr1)["safeTransferFrom(address,address,uint256)"](addr1.address, addr2.address, 1);
            expect(await erc721.ownerOf(1)).to.equal(addr2.address);
        });
    });
});
