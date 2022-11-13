const { network } = require("hardhat");
const { networkConfig , DeveloppementChains , DECIMALS , INITIAL_ANSWER } = require("../helper-hardhat-config.js");
const { verify } = require("../utils/verify.js");
require("dotenv").config();

module.exports = async ({getNamedAccounts , deployments}) => {
    console.log("We're in ...2");
    const {deploy , log} = deployments;
    const {deployer} = await getNamedAccounts() ;
    const chainId = network.config.chainId;

    let ethUsdPriceFeedAddress; 

    if(DeveloppementChains.includes(network.name)){
        const ethUsdAggregator = await deployments.get("MockV3Aggregator");
        ethUsdPriceFeedAddress = ethUsdAggregator.address;
    }else{
        ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"];
    }

    const FundMe = await deploy("FundMe",{
        from: deployer , 
        args: [
            ethUsdPriceFeedAddress,
        ], 
        log: true ,
        waitConfirmations: network.config.blockConfirmations || 1,
    });

    if(!DeveloppementChains.includes(network.name) && process.env.ETHERSCAN_API_KEY){
        await verify(FundMe.address,[ethUsdPriceFeedAddress]);
    }


    console.log("---------------------------");
}

module.exports.tags = ["all","fundMe"];