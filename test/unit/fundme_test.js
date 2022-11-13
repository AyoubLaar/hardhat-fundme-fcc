const { network,deployments, ethers, getNamedAccounts } = require("hardhat");
const { assert , expect} = require("chai");
const {DeveloppementChains} = require("../../helper-hardhat-config");

if(DeveloppementChains.includes(network.name)){
describe("Fundme",async () => {
    let fundMe , deployer , mockV3Aggregator;
    const sendValue = ethers.utils.parseEther("1"); // 1 ETH

    beforeEach(async ()=>{
        // const accounts = await ethers.getSigners();
        // const deployer = await getNamedAccounts();
        deployer = (await getNamedAccounts()).deployer;
        await deployments.fixture(["all"]);
        mockV3Aggregator = await ethers.getContract("MockV3Aggregator",deployer);
        fundMe = await ethers.getContract("FundMe",deployer);
    })

    describe("Constructor",async ()=>{
        it("sets the aggregator correctly",async () => {
            const response = await fundMe.getPriceFeed();
            assert(response == mockV3Aggregator.address);
        })
    })

    describe("Fundme",async ()=>{
        it("Fails if you don't send enough eth ",async () => {
                await expect(fundMe.fund()).to.be.revertedWith("You need to spend more ETH!");
            })

        // it("Should update the funds",async () => { 
        //     await fundMe.fund({ value: sentvalue});
        //     const response = await fundMe.getaddressToAmountFunded(deployer);
        //     assert(response.toString() == sentvalue.toString());
        // })

        it("Updates the amount funded data structure", async () => {
            console.log(sendValue);
            await fundMe.fund({ value: sendValue })
            const response = await fundMe.getaddressToAmountFunded(
                deployer
            )
            assert.equal(response.toString(), sendValue.toString())
        })

        it("Adds funder to funder array",async () => { 
            await fundMe.fund({ value: sendValue});
            const response = await fundMe.getfunders(0);
            //const response = await fundMe.getfunders[0]; , [] does not work when indexing the array .
            assert(response == deployer);
        })
    })

    describe("withdraw",async () =>{
        beforeEach(async () => {
            await fundMe.fund({ value:sendValue});
        })

        it("Withdraw ETH from a single founder ",async () => { 
            const startingFundMeBalance = await fundMe.provider.getBalance(fundMe.address);
            const startingdeployerBalance = await fundMe.provider.getBalance(deployer);

            const transactionResponse = await fundMe.withdraw();
            const transactionReceipt = await transactionResponse.wait(1);
            const {gasUsed,effectiveGasPrice} = transactionReceipt;
            const gasCost = gasUsed.mul(effectiveGasPrice);

            const endingFundMeBalance = await fundMe.provider.getBalance(fundMe.address);
            const endingdeployerBalance = await fundMe.provider.getBalance(deployer);

            assert(endingFundMeBalance == 0);
            assert(endingdeployerBalance.add(gasCost).toString() == startingdeployerBalance.add(startingFundMeBalance).toString());
        })
        it("Allows us to withdraw with multiple getfunders",async () => { 
            //Arrange
            const accounts = await ethers.getSigners();

            for(let i=1 ; i < 6 ; i++){
                const fundMeConnected = await fundMe.connect(
                    accounts[i]
                );
            await fundMeConnected.fund({value: sendValue});
            }
            const startingFundMeBalance = await fundMe.provider.getBalance(fundMe.address);
            const startingdeployerBalance = await fundMe.provider.getBalance(deployer);
            //Act
            const transactionResponse = await fundMe.withdraw();
            const transactionReceipt = await transactionResponse.wait(1);
            const {gasUsed,effectiveGasPrice} = transactionReceipt;
            const gasCost = gasUsed.mul(effectiveGasPrice);
            const endingFundMeBalance = await fundMe.provider.getBalance(fundMe.address);
            const endingdeployerBalance = await fundMe.provider.getBalance(deployer);
            //Assert
            assert(endingFundMeBalance == 0);
            assert(endingdeployerBalance.add(gasCost).toString() == startingdeployerBalance.add(startingFundMeBalance).toString());
            console.log("1");
            await expect(fundMe.getfunders(0)).to.be.reverted;
            console.log("1");
            for(let i=1 ; i<6 ; i++){
                assert.equal(await fundMe.getaddressToAmountFunded(accounts[i].address),0);
            }  
        })
        it("Only allows the owner to withdraw",async () => { 
            const accounts = await ethers.getSigners();
            const FundMeConnected = await fundMe.connect(accounts[1]);
            //FundMeConnected.fund({value:sendValue}); <= unecessary
            expect(FundMeConnected.withdraw()).to.be.revertedWith("FundMe__NotOwner");
        })

        it("CheaperWithdraw testing ..",async () => { 
            //Arrange
            const accounts = await ethers.getSigners();

            for(let i=1 ; i < 6 ; i++){
                const fundMeConnected = await fundMe.connect(
                    accounts[i]
                );
            await fundMeConnected.fund({value: sendValue});
            }
            const startingFundMeBalance = await fundMe.provider.getBalance(fundMe.address);
            const startingdeployerBalance = await fundMe.provider.getBalance(deployer);
            //Act
            const transactionResponse = await fundMe.cheapWithdraw();
            const transactionReceipt = await transactionResponse.wait(1);
            const {gasUsed,effectiveGasPrice} = transactionReceipt;
            const gasCost = gasUsed.mul(effectiveGasPrice);
            const endingFundMeBalance = await fundMe.provider.getBalance(fundMe.address);
            const endingdeployerBalance = await fundMe.provider.getBalance(deployer);
            //Assert
            assert(endingFundMeBalance == 0);
            assert(endingdeployerBalance.add(gasCost).toString() == startingdeployerBalance.add(startingFundMeBalance).toString());
            console.log("1");
            await expect(fundMe.getfunders(0)).to.be.reverted;
            console.log("1");
            for(let i=1 ; i<6 ; i++){
                assert.equal(await fundMe.getaddressToAmountFunded(accounts[i].address),0);
            }  
        })

        it("CheapWithdraw ETH from a single founder ",async () => { 
            const startingFundMeBalance = await fundMe.provider.getBalance(fundMe.address);
            const startingdeployerBalance = await fundMe.provider.getBalance(deployer);

            const transactionResponse = await fundMe.cheapWithdraw();
            const transactionReceipt = await transactionResponse.wait(1);
            const {gasUsed,effectiveGasPrice} = transactionReceipt;
            const gasCost = gasUsed.mul(effectiveGasPrice);

            const endingFundMeBalance = await fundMe.provider.getBalance(fundMe.address);
            const endingdeployerBalance = await fundMe.provider.getBalance(deployer);

            assert(endingFundMeBalance == 0);
            assert(endingdeployerBalance.add(gasCost).toString() == startingdeployerBalance.add(startingFundMeBalance).toString());
        })

    })
})
}else{
    describe.skip;
}
/*
    describe("",async () =>{
        
    })

    it("",async () => { 

        })
*/