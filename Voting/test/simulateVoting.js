const Web3 = require('web3');
const fs = require('fs');

var web3 = new Web3(Web3.givenProvider || "ws://localhost:7545");

const gasPrice = '20000000000';
const gas = 6721975;

function resultCallBack(error, result) {
  if (error) {
    throw error;
  } else {
    console.log(result);
  }
}

function makeSCCall(method, args = {}, type = 'call') {
  return new Promise((resolve, reject) => {
    method[type]({ ...args, gasPrice, gas }, (err, result) => {
      if (err) {
        return reject(err);
      } else {
        return resolve(result);
      }
    });
  });
}

!async function () {
  const accounts = await web3.eth.getAccounts();
  const BallotJSON = JSON.parse(fs.readFileSync(`${__dirname}/../build/contracts/Ballot.json`, 'utf-8'));
  const { abi } = BallotJSON;
  const { address } = BallotJSON.networks['5777'];
  const ballotContract = new web3.eth.Contract(abi, address);

  const admin = accounts[0];
  let result;

  // 1. Set rights bulk...
  const addressesToGiveRights = [];
  for (let i = 1; i <= 9; i++) {
    addressesToGiveRights.push(accounts[i]);
  }
  result = await makeSCCall(
    ballotContract.methods.giveRightToVoters(addressesToGiveRights),
    { from: admin },
    'send'
  );
  console.log(`Set Rights -> ${result}`);

  // 1. Set rights solo...
  // for (let i = 1; i <= 9; i++) {
  //   const thisAccount = accounts[i];

  //   result = await makeSCCall(
  //     ballotContract.methods.giveRightToVote(thisAccount),
  //     { from: admin },
  //     'send'
  //   );
  //   console.log(`Set Rights #${i} -> ${result}`);
  // }

  // 2. Vote
  for (let i = 1; i <= 9; i++) {
    const thisAccount = accounts[i];
    let party = i > 3 ? 2 : 0;
    result = await makeSCCall(
      ballotContract.methods.vote(party),
      { from: thisAccount },
      'send'
    );

    console.log(`Vote #${i} -> ${result}`);
  }

  // 3. Calc winner
  result = await makeSCCall(
    ballotContract.methods.winnerName(),
  );

  console.log(`Winner is ${web3.utils.toAscii(result)}`);
}();