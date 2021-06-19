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

    validTransactions(){ // this function returns an array of valid transactions from the pool
         return  Object.values(this.transactionMap).filter(
            (transaction)=> Transaction.validTransaction(transaction)
        );
    }

    clear(){
        this.transactionMap = {};
    }


    clearBlockchainTransactions({ chain }) {
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