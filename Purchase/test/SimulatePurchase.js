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

class SimulatePurchase {
  saContract = null;

  constructor() {
    const _JSON = JSON.parse(fs.readFileSync(`${__dirname}/../build/contracts/Purchase.json`, 'utf-8'));
    const { abi } = _JSON;
    const { address } = _JSON.networks['5777'];
    const saContract = new web3.eth.Contract(abi, address);
    this.saContract = saContract;
  }

  async simulate() {
    const accounts = await web3.eth.getAccounts();
    const [seller, buyer] = accounts;
    // 1. Perform buy
    let result = await makeSCCall(
      this.saContract.methods.performPurchase(),
      { from: buyer, value: web3.utils.toWei('2') },
      'send'
    );
    console.log('buy success! ', result);
    // 2. Confirm receipt
    result = await makeSCCall(
      this.saContract.methods.confirmReceipt(),
      { from: buyer },
      'send'
    );
    console.log('Receipt confirmed!', result);

    // 3. Claim seller refund
    result = await makeSCCall(
      this.saContract.methods.refundSeller(),
      { from: seller },
      'send'
    );
    console.log('Refund confirmed!', result);
  }
}

!async function () {
  const ins = new SimulatePurchase();
  await ins.simulate();
}();