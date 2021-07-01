const uuid = require('uuid/v1');
const { verifySignature } = require('../Utils');
const { REWARD_INPUT, MINING_REWARD } = require('../config');

class Transaction { 
  constructor({ senderWallet, recipient, amount, outputMap, input }) {
    this.id = uuid(); //unique id for the transaction
    this.outputMap = outputMap || this.createOutputMap({ senderWallet, recipient, amount }); //output map containg home address, recipinet and amount
    this.input = input || this.createInput({ senderWallet, outputMap: this.outputMap }); 
  }

  createOutputMap({ senderWallet, recipient, amount }) { //returns an output map with recipient 
    const outputMap = {};

    outputMap[recipient] = amount;
    outputMap[senderWallet.publicKey] = senderWallet.balance - amount;

    return outputMap;
  }

  createInput({ senderWallet, outputMap }) { //returns input map 
    return {
      timestamp: Date.now(),
      amount: senderWallet.balance,
      address: senderWallet.publicKey,
      signature: senderWallet.sign(outputMap)
    };
  }

  update({ senderWallet, recipient, amount }) {
    if (amount > this.outputMap[senderWallet.publicKey]) { //validates that the amount does exceed balance
      throw new Error('Amount exceeds balance');
    }

    if (!this.outputMap[recipient]) {
      this.outputMap[recipient] = amount;
    } else {
      this.outputMap[recipient] = this.outputMap[recipient] + amount;
    }

    this.outputMap[senderWallet.publicKey] =
      this.outputMap[senderWallet.publicKey] - amount;

    this.input = this.createInput({ senderWallet, outputMap: this.outputMap });
  }

  static validTransaction(transaction) { //validates transaction
    const { input: { address, amount, signature }, outputMap } = transaction;

    const outputTotal = Object.values(outputMap)
      .reduce((total, outputAmount) => total + outputAmount);

    if (amount !== outputTotal) {
      console.error(`Invalid transaction from ${address}`);
      return false;
    }

    if (!verifySignature({ publicKey: address, data: outputMap, signature })) { //validates the signature
      console.error(`Invalid signature from ${address}`);
      return false;
    }

    return true;
  }

  static rewardTransaction({ minerWallet }) { //creates and returns the reward transaction
    return new this({
      input: REWARD_INPUT,
      outputMap: { [minerWallet.publicKey]: MINING_REWARD }
    });
  }
}

module.exports = Transaction;