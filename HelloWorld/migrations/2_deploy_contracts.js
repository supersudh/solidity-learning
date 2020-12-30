const HelloWorld = artifacts.require("./HelloWorld.sol");
const Structs1 = artifacts.require("./Structs1.sol");

module.exports = function (deployer) {
    deployer.deploy(HelloWorld);
    deployer.deploy(Structs1);
  }
