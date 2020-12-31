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

class SimulateBlindAuction {
  saContract = null;

  constructor() {
    const _JSON = JSON.parse(fs.readFileSync(`${__dirname}/../build/contracts/BlindAuction.json`, 'utf-8'));
    const { abi } = _JSON;
    const { address } = _JSON.networks['5777'];
    const saContract = new web3.eth.Contract(abi, address);
    this.saContract = saContract;
  }

  async performBidding() {
    const accounts = await web3.eth.getAccounts();
    // 1. Bid using 9 accounts
    for (let i = 1; i <= 9; i++) {
      console.log(web3.utils.soliditySha3(`100000000000000000${i - 1}`, false, web3.utils.soliditySha3(`account${i}`)));
      const result = await makeSCCall(
        this.saContract.methods.bid(
          web3.utils.soliditySha3(`100000000000000000${i - 1}`, false, web3.utils.soliditySha3(`account${i}`))
        ),
        { from: accounts[i], value: `100000000000000000${i - 1}` },
        'send'
      );
      console.log(`Bid ${i} success!, ${result}`);
    }
  }

  async performrevealing() {
    const accounts = await web3.eth.getAccounts();
    // 2. Reveal using 9 accounts
    for (let i = 1; i <= 9; i++) {
      const result = await makeSCCall(
        this.saContract.methods.reveal(
          [`100000000000000000${i - 1}`],
          [false],
          [web3.utils.soliditySha3(`account${i}`)]
        ),
        { from: accounts[i], },
        'send'
      );
      console.log(`Reveal ${i} success!, ${result}`);
    }
  }

  async withdraw() {
    const accounts = await web3.eth.getAccounts();
    for (let i = 1; i <= 9; i++) {
      const result = await makeSCCall(
        this.saContract.methods.withdraw(),
        { from: accounts[i], },
        'send'
      );
      console.log(`Withdraw ${i} success!, ${result}`);
    }
  }

  async auctionEnd() {
    const accounts = await web3.eth.getAccounts();
    const result = await makeSCCall(
      this.saContract.methods.auctionEnd(),
      { from: accounts[0] },
      'send'
    );
    console.log(result);
  }

  async increaseBT() {
    const accounts = await web3.eth.getAccounts();
    const result = await makeSCCall(
      this.saContract.methods.setBored(),
      { from: accounts[9] },
      'send'
    );
    console.log(`Simulated!, ${result}`);
  }

  async getTimeData() {
    const results = await Promise.all([
      makeSCCall(
        this.saContract.methods.getBlockTime(),
        {}
      ),
      makeSCCall(
        this.saContract.methods.biddingEnd(),
        {}
      ),
      makeSCCall(
        this.saContract.methods.revealEnd(),
        {}
      )
    ]);
    console.log(results);
  }

  async simulate() {
    // await this.getTimeData();
    ///
    // await this.performBidding();
    // await this.increaseBT();
    // await this.performrevealing();
    // await this.increaseBT();
    // await this.auctionEnd()
    // await this.withdraw();
  }
}

!async function () {
  const ins = new SimulateBlindAuction();
  await ins.simulate();
}();