const web3 = require('web3');

function makeZeroes(str) {
  let cons = '';
  for (let i = 0;i<66;i++) {
    if (str[i]) {
      cons += str[i];
    } else {
      cons += '0';
    }
  }
  return cons;
}

console.log(makeZeroes(web3.utils.fromAscii('trump')));
console.log(makeZeroes(web3.utils.fromAscii('biden')));
console.log(makeZeroes(web3.utils.fromAscii('sarge')));

// 0x7472756d70000000000000000000000000000000000000000000000000000000,0x626964656e000000000000000000000000000000000000000000000000000000,0x7361726765000000000000000000000000000000000000000000000000000000


console.log(makeZeroes(web3.utils.soliditySha3('trump')));