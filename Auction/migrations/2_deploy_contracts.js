const SimpleAuction = artifacts.require('SimpleAuction.sol');

module.exports = deployer => {
  deployer.deploy(
    SimpleAuction,
    50,
    '0x548f696DD9Cde08B12cFc25f806e5cEcdA95C66D'
  );
};
