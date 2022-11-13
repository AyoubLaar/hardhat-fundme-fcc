const {network} = require("hardhat");
const {DeveloppementChains , DECIMALS , INITIAL_ANSWER} = require("../helper-hardhat-config.js");

module.exports = async ({getNamedAccounts , deployments})=>{
    console.log("We're in ...1");
    // console.log(getNamedAccounts);
    // console.log("---------------------------");
    // console.log(deployments);
    // console.log("---------------------------");
    const {deploy , log} = deployments;
    // console.log(deploy);
    // console.log("---------------------------");
    // console.log(log);
    // console.log("---------------------------");
    const {deployer} = await getNamedAccounts() ;
    // console.log(deployer);
    // console.log("---------------------------");
    const chainId = network.config.chainId;

    if(DeveloppementChains.includes(network.name)){
        console.log("Local Network Detected ! Deploying Mocks ....");
        await deploy("MockV3Aggregator",{
            contract: "MockV3Aggregator",
            from: deployer,
            log: true,//to console.log some stuff 
            args: [DECIMALS,INITIAL_ANSWER],
        });
        console.log("Mocks Deployed !");
        console.log("---------------------------");
    }
}   

module.exports.tags = ["all","mocks"];