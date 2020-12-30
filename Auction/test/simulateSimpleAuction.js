const Web3 = require('web3');
const fs = require('fs');

var web3 = new Web3(Web3.givenProvider || "ws://localhost:7545");

const gasPrice = '20000000000';
const gas = 6721975;

function makeSCCall(method, args = {}, type = 'call') {
  return new Promise((resolve, reject) => {
    method[type]({ ...args, gasPrice, gas }, (err, result) => {
      if (err) {
        console.log(err.message)
        return reject(err);
      } else {
        return resolve(result);
      }
    });
  });
}

!async function () {
  const accounts = await web3.eth.getAccounts();
  const _JSON = JSON.parse(fs.readFileSync(`${__dirname}/../build/contracts/SimpleAuction.json`, 'utf-8'));
  const { abi } = _JSON;
  const { address } = _JSON.networks['5777'];
  const saContract = new web3.eth.Contract(abi, address);

  const admin = accounts[0];
  let result;

  // result = await makeSCCall(
  //   saContract.methods.expiryTime(),
  //   {}
  // );
  // console.log(result);

  // result = await makeSCCall(
  //   saContract.methods.getBlockTime(),
  //   {}
  // );

  // 1. Bid using 9 accounts
  // for (let i = 1; i <= 9; i++) {
  //   result = await makeSCCall(
  //     saContract.methods.bid(),
  //     { from: accounts[i], value: `100000000000000000${i-1}` },
  //     'send'
  //   );
  //   console.log(`Bid ${i} success!, ${result}`);
  // }

  // 1.1 call dummy toggle to simulate block time increase
  // result = await makeSCCall(
  //   saContract.methods.setBored(),
  //   { from: accounts[9] },
  //   'send'
  // );
  // console.log(`Simulated!, ${result}`);

  // 2. Get highest bidder
  // result = await makeSCCall(
  //   saContract.methods.highestBidder(),
  //   {}
  // );

  // 3. End auction!
  // result = await makeSCCall(
  //   saContract.methods.auctionEnd(),
  //   { from: accounts[0] },
  //   'send'
  // );

  // 4. Withdraw <after ended>
  for (let i = 1; i <= 9; i++) {
    result = await makeSCCall(
      saContract.methods.withdraw(),
      { from: accounts[i] },
      'send'
    );
    console.log(`Withdraw ${i} success!, ${result}`);
  }

  console.log(result);
}();