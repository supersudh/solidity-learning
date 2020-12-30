const Web3 = require('web3');
const fs = require('fs');

var web3 = new Web3(Web3.givenProvider || "ws://localhost:7545");
const account1 = '0x82C7CaDF5f41eC8371871A8a66a15811094225e9';

function resultCallBack(error, result) {
  if (error) {
    throw error;
  } else {
    console.log(result);
  }
}

!async function () {
  // console.log(await web3.eth.getAccounts());
  const HelloWorldJSON = JSON.parse(fs.readFileSync(`${__dirname}/../build/contracts/HelloWorld.json`));
  const { abi } = HelloWorldJSON;
  const { address } = HelloWorldJSON.networks['5777'];
  const hwContract = new web3.eth.Contract(abi, address);
  // console.log(hwContract);

  // hwContract.methods.hi().call({}, resultCallBack);

  // hwContract.methods.set(25000).send({ from: account1 }, resultCallBack);
  // hwContract.methods.get().call({}, resultCallBack);
  hwContract.methods.getTimeStamp().call({}, resultCallBack);

  // hwContract.methods.setName('0x1').send({ from: account1 }, resultCallBack);
  // hwContract.methods.name().call({}, resultCallBack);
}();