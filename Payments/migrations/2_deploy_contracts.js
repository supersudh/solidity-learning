const web3 = require('web3');
const ReceiverPays = artifacts.require('ReceiverPays.sol');

module.exports = deployer => {
  deployer.deploy(
    ReceiverPays,
    {
      from: '0xEA5dad775Fa244f68b377F8214872D911964a282',
      value: web3.utils.toWei('20')
    }
  );
};
