const Transaction = require('./transaction');

class TransactionPool {

    constructor(){
        this.transactionMap = {};
    }

    setTransaction(transaction){ // sets the transaction id = to the transaction itself
        this.transactionMap[transaction.id] = transaction;
        // console.log('Setting Transaction' , transaction);
    }

    existingTransaction({ inputAddress }) { // find out if the transaction already exist
        const transactions = Object.values(this.transactionMap);
    
        return transactions.find(transaction => transaction.input.address === inputAddress);
      }

    setMap(transactionPoolMap){ // will update map to the incoming map
        this.transactionMap  = transactionPoolMap;
    }


    validTransactions() { //filters transaction map for valid transaction
      return Object.values(this.transactionMap).filter(
        transaction => Transaction.validTransaction(transaction)
      );
    }

    clear(){ // clears the transaction map
        this.transactionMap = {};
    }


    clearBlockchainTransactions({ chain }) { //clears transactions from the map that have already been added to the chain
        for (let i=1; i<chain.length; i++) {
          const block = chain[i];
    
          for (let transaction of block.data) {
            if (this.transactionMap[transaction.id]) {
              delete this.transactionMap[transaction.id];
            }
          }
        }
      }

}


module.exports =  TransactionPool;