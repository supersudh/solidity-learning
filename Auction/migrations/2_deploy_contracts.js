const SimpleAuction = artifacts.require('SimpleAuction.sol');
const BlindAuction = artifacts.require('BlindAuction.sol');

module.exports = deployer => {
  deployer.deploy(
    SimpleAuction,
    50,
    '0x548f696DD9Cde08B12cFc25f806e5cEcdA95C66D'
  );

  deployer.deploy(
    BlindAuction,
    50,
    50,
    '0x548f696DD9Cde08B12cFc25f806e5cEcdA95C66D'
  )
};
