const Web3 = require('web3');
const fs = require('fs');

var web3 = new Web3(Web3.givenProvider || "ws://localhost:7545");

function resultCallBack(error, result) {
  if (error) {
    throw error;
  } else {
    console.log(result);
  }
}

!async function () {
  const accounts = await web3.eth.getAccounts();
  const Structs1JSON = JSON.parse(fs.readFileSync(`${__dirname}/../build/contracts/Structs1.json`));
  const { abi } = Structs1JSON;
  const { address } = Structs1JSON.networks['5777'];
  const s1Contract = new web3.eth.Contract(abi, address);

  // s1Contract.methods
  //   .addUser('Sudharsan', 26, 'I am a very good person. You will fall in love with my eloquency')
  //   .send({ from: accounts[0], gasPrice: '20000000000', gas: 6721975 }, resultCallBack);

  // s1Contract.methods
  //   .addUser('Sarge', 206, 'The legacy speaks!')
  //   .send({ from: accounts[1], gasPrice: '20000000000', gas: 6721975 }, resultCallBack);

  // s1Contract.methods.getUser(accounts[0]).call({}, resultCallBack);

  // s1Contract.methods.users(accounts[1]).call({}, resultCallBack);

  s1Contract.methods.usersList(0).call({}, resultCallBack);
}();