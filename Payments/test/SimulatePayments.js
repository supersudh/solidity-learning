require('dotenv').config();
const Web3 = require('web3');
var abi = require('ethereumjs-abi')
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

class SimulatePayment {
  saContract = null;

  constructor() {
    const _JSON = JSON.parse(fs.readFileSync(`${__dirname}/../build/contracts/ReceiverPays.json`, 'utf-8'));
    const { abi } = _JSON;
    const { address } = _JSON.networks['5777'];
    const saContract = new web3.eth.Contract(abi, address);
    this.saContract = saContract;
  }

  async getContractBalance() {
    const accounts = await web3.eth.getAccounts();
    return await makeSCCall(
      this.saContract.methods.getContractBalance(),
      {},
      'call'
    );
  }

  signPayment(
    recipient,
    amount,
    nonce,
    contractAddress
  ) {
    return new Promise((resolve, reject) => {
      const hash = `0x${abi.soliditySHA3(
        ["address", "uint256", "uint256", "address"],
        [recipient, amount, nonce, contractAddress]
      ).toString('hex')}`;
      const { signature } = web3.eth.accounts.sign(hash, process.env.PK);
      return resolve(signature);
    });

  }

  async simulate() {
    const accounts = await web3.eth.getAccounts();
    const [owner] = accounts;
    const { _address } = this.saContract;

    // 0. Self-destruct
    // await makeSCCall(
    //   this.saContract.methods.shutdown(),
    //   {from: owner},
    //   'send'
    // )
    // return;


    // 1. Get contract balance
    // const balance = await this.getContractBalance();
    // console.log(web3.utils.fromWei(balance));
    // return;

    // 2. generate signed proof 9 times for accounts(1-9)
    const signatures = [];
    let nonce = 0;
    for (let i = 1; i <= 9; i++) {
      const signature = await this.signPayment(accounts[i], web3.utils.toWei('2'), ++nonce, _address);
      signatures.push(signature);
    }

    // 3. Claim payment for each signature
    nonce = 0;
    for (let i = 1; i <= 9; i++) {
      const result = await makeSCCall(
        this.saContract.methods.claimPayment(
          signatures[i - 1],
          ++nonce,
          web3.utils.toWei('2')
        ),
        { from: accounts[i] },
        'send'
      );

      console.log(`claim success for account ${i} ${result}`);
    }
  }
}

!async function () {
  const ins = new SimulatePayment();
  await ins.simulate();
}();