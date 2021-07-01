const Block = require('./block');
const Transaction = require('../wallet/transaction');
const Wallet = require('../wallet');
const { cryptoHash } = require('../Utils');
const { REWARD_INPUT, MINING_REWARD } = require('../config');

//constructor makes sure that the chain is started off with the genesis block
class Blockchain {
  constructor() {
    this.chain = [Block.genesis()];
  }

  //adds a block to the chain using the static Block.mineBlock function
  addBlock({ data }) {
    const newBlock = Block.mineBlock({
      lastBlock: this.chain[this.chain.length-1],
      data
    });

    //pushing the block to the chain
    this.chain.push(newBlock);
  }

  //validates the incoming chain and relaces it if valid.
  replaceChain(chain, validateTransactions, onSuccess) {
    if (chain.length <= this.chain.length) {
      console.error('The incoming chain must be longer');
      return;
    }

    if (!Blockchain.isValidChain(chain)) {
      console.error('The incoming chain must be valid');
      return;
    }

    if (validateTransactions && !this.validTransactionData({ chain })) {
      console.error('The incoming chain has invalid data');
      return;
    }

    if (onSuccess) onSuccess();
    console.log('replacing chain with', chain);
    this.chain = chain;
  }

  //will handle validation of the chain
  validTransactionData({ chain }) {
    for (let i=1; i<chain.length; i++) { //iterates throught the chain
      const block = chain[i];
      const transactionSet = new Set();
      let rewardTransactionCount = 0; //counter to make sure that their is only one reward transaction

      for (let transaction of block.data) {
        if (transaction.input.address === REWARD_INPUT.address) { //keeps track of all reward transaction
          rewardTransactionCount += 1;

          if (rewardTransactionCount > 1) { //if the reward transactions are more than one the FALSE
            console.error('Miner rewards exceed limit');
            return false;
          }

          if (Object.values(transaction.outputMap)[0] !== MINING_REWARD) { //Makes sure that the mmining reward amount is the valid amount
            console.error('Miner reward amount is invalid');
            return false;
          }
        } else {
          if (!Transaction.validTransaction(transaction)) { //validates the transaction
            console.error('Invalid transaction');
            return false;
          }

        //   const trueBalance = Wallet.calculateBalance({
        //     chain,
        //     address: transaction.input.address,
        //     timestamp: chain[i-1].timestamp
        //  });

          //////////////////////////////////////////////////////////////////////
         //CURRENTLY A BUG IN THE PROGRAMN THAT INVALIDATES INCOMING TRANSACTIONS
          //////////////////////////////////////////////////////////////////////

          // if (transaction.input.amount !== trueBalance) { 
          //   console.log('transaction.input.amount',  transaction.input.amount, 'and' , trueBalance, 'Transaction ID: ',transaction.id );
          //   console.error('Invalid input amount');
          //   return false;
          // }

          if (transactionSet.has(transaction)) { //makes sure transactions are not duplicated
            console.error('An identical transaction appears more than once in the block');
            return false;
          } else {
            transactionSet.add(transaction);
          }
        }
      }
    }

    return true;
  }

  static isValidChain(chain) { //will validate the chain
    if (JSON.stringify(chain[0]) !== JSON.stringify(Block.genesis())) { //makes sure that the first block is the genesis block
      return false
    };

    for (let i=1; i<chain.length; i++) {
      const { timestamp, lastHash, hash, nonce, difficulty, data } = chain[i];
      const actualLastHash = chain[i-1].hash;
      const lastDifficulty = chain[i-1].difficulty;

      if (lastHash !== actualLastHash) return false; //re-checks the last hash

      const validatedHash = cryptoHash(timestamp, lastHash, data, nonce, difficulty);

      if (hash !== validatedHash) return false; //check the actual hash 

      if (Math.abs(lastDifficulty - difficulty) > 1) return false; //makes sure that there is no difficulty jumps in the chain
    }

    return true;
  }
}

module.exports = Blockchain;