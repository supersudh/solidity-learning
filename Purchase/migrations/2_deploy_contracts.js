const web3 = require('web3');
const Purchase = artifacts.require('Purchase.sol');

module.exports = deployer => {
  deployer.deploy(
    Purchase,
    {
      from: '0xEDc515cf488012AD4544B1da6fFE5467CC58b824',
      value: web3.utils.toWei('2')
    }
  );
};
