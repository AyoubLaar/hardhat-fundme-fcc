const { assert } = require("chai");
const {network,getNamedAccounts,ethers} = require("hardhat");
const {DeveloppementChains} = require("../../helper-hardhat-config");


DeveloppementChains.includes(network.name) 
    ? describe.skip
    : describe("FundMe",async()=>{
        let FundMe , deployer;
        const sentValue = await ethers.utils.parseEther("1");
        beforeEach(async ()=>{
            deployer = (await getNamedAccounts()).deployer;
            FundMe = await ethers.getContract("FundMe",deployer);
        })
        it("Allows people to fund and withdraw",async () =>{
            await FundMe.fund({value : sentValue});
            await console.log(FundMe.getfunders(0));
            await FundMe.withdraw();
            const endingBalance = await FundMe.provider.getBalance(FundMe.address);
            assert.equal(endingBalance.toString() , ethers.utils.parseEther("0"));
        })
      })