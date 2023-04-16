//var MyContract1 = artifacts.require("Hello");
//var MyContract2 = artifacts.require("HelloFactory");
var MyContract1 = artifacts.require("Campaign");
var MyContract2 = artifacts.require("CampaignFactory");

module.exports = function(deployer) {
  
  //deployer.deploy(MyContract1,"test", 1000000000, 100);
  deployer.deploy(MyContract2);

};