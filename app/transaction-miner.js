const Transaction = require('../wallet/transaction')



class TransactionMiner{
    constructor({blockchain , transactionPool , wallet , pubsub}){
        this.blockchain = blockchain;
        this.transactionPool = transactionPool;
        this.wallet = wallet;
        this.pubsub = pubsub;
    }


    mineTransacions(){
        const validTransactions = this.transactionPool.validTransactions(); //retuns list of valid transactions

        validTransactions.push(//generate the miners reward
            Transaction.rewardTransaction( { //creates reward transaction from current Wallet
                        minerWallet: this.wallet
                    })
        );
            //add a block consisting of these transaction to the blockchain
        this.blockchain.addBlock({data: validTransactions});
            // broadcast the updated blockchain
        this.pubsub.broadcastChain();
             // clear the pool
        this.transactionPool.clear(); // one the valid transactions are out
  
    }


}

module.exports = TransactionMiner;