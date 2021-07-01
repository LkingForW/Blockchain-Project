const Transaction = require('../wallet/transaction');

//Mines the transaction from the pool
class TransactionMiner {
  constructor({ blockchain, transactionPool, wallet, pubsub }) {
    this.blockchain = blockchain;
    this.transactionPool = transactionPool;
    this.wallet = wallet;
    this.pubsub = pubsub;
  }

  //Method will make sure that the transaction is valid befor pushing it on the chain
  mineTransactions() {
    const validTransactions = this.transactionPool.validTransactions();

    validTransactions.push( //will also push the reward transaction
      Transaction.rewardTransaction({ minerWallet: this.wallet })
    );


    this.blockchain.addBlock({ data: validTransactions }); //will add the block to the chain

    this.pubsub.broadcastChain(); //then broadcast the chain to all its nodes

    this.transactionPool.clear(); //shortly after, clears the pool once everything has been mined
  }
}

module.exports = TransactionMiner;