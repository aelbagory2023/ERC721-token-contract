const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ERC721", function () {
    let ERC721, erc721, owner, addr1, addr2, tokenId;
    const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

    beforeEach(async function () {
        ERC721 = await ethers.getContractFactory("ERC721");
        [owner, addr1, addr2] = await ethers.getSigners();
        erc721 = await ERC721.deploy();
        tokenId = 1; // Example token ID
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

    describe("Input Validation", function () {
        describe("Minting", function () {
            it("Should revert if minting to the zero address", async function () {
                await expect(erc721.mint(ZERO_ADDRESS, tokenId)).to.be.revertedWith("ERC721: mint to the zero address");
            });

            it("Should revert if trying to mint an already minted token", async function () {
                await erc721.mint(owner.address, tokenId);
                await expect(erc721.mint(owner.address, tokenId)).to.be.revertedWith("ERC721: token already minted");
            });

            it("Should revert if called by a non-owner", async function () {
                await expect(erc721.connect(addr1).mint(owner.address, tokenId)).to.be.revertedWith("ERC721: only owner can mint");
            });
        });

        describe("Approvals", function () {
            beforeEach(async function () {
                await erc721.mint(owner.address, tokenId);
            });

            it("Should revert if trying to approve the zero address", async function () {
                await expect(erc721.approve(ZERO_ADDRESS, tokenId)).to.be.revertedWith("ERC721: approval to the zero address");
            });

            it("Should revert if trying to approve the current owner", async function () {
                await expect(erc721.approve(owner.address, tokenId)).to.be.revertedWith("ERC721: approval to current owner");
            });

            it("Should revert if trying to approve a nonexistent token", async function () {
                await expect(erc721.approve(addr1.address, 999)).to.be.revertedWith("ERC721: owner query for nonexistent token");
            });
        });

        describe("Transfers", function () {
            beforeEach(async function () {
                await erc721.mint(owner.address, tokenId);
            });

            it("Should revert if trying to transfer to the zero address", async function () {
                await expect(erc721.transferFrom(owner.address, ZERO_ADDRESS, tokenId)).to.be.revertedWith("ERC721: transfer to the zero address");
            });

            it("Should revert if trying to transfer a token that is not owned", async function () {
                await expect(erc721.transferFrom(addr1.address, addr2.address, tokenId)).to.be.revertedWith("ERC721: transfer of token that is not own");
            });

            it("Should revert if trying to transfer a nonexistent token", async function () {
                await expect(erc721.transferFrom(owner.address, addr1.address, 999)).to.be.revertedWith("ERC721: transfer of token that is not own");
            });
        });

        describe("Safe Transfers", function () {
            beforeEach(async function () {
                await erc721.mint(owner.address, tokenId);
            });

            it("Should revert if trying to safely transfer to the zero address", async function () {
                await expect(erc721.safeTransferFrom(owner.address, ZERO_ADDRESS, tokenId)).to.be.revertedWith("ERC721: transfer to the zero address");
            });

            it("Should revert if trying to safely transfer a token that is not owned", async function () {
                await expect(erc721.safeTransferFrom(addr1.address, addr2.address, tokenId)).to.be.revertedWith("ERC721: transfer of token that is not own");
            });

            it("Should revert if trying to safely transfer a nonexistent token", async function () {
                await expect(erc721.safeTransferFrom(owner.address, addr1.address, 999)).to.be.revertedWith("ERC721: transfer of token that is not own");
            });
        });
    });
});
