const TransactionPool = require('./transaction-pool');
const Transaction = require('./transaction');
const Blockchain = require('../blockchain');
const Wallet = require('./index');

describe('TransactionPool' , () => {
    let transactionPool, transaction , senderWallet;


    beforeEach(() => {
        transactionPool = new TransactionPool();
        senderWallet = new Wallet();
        transaction = new Transaction( {
            senderWallet,
            recipient: 'fake-recipient' ,
            amount: 50
        });
    })//end of beforeEach


    describe('setTransaction()' , () => {
        it('adds a transaction' ,() => {
            transactionPool.setTransaction(transaction);
            expect(transactionPool.transactionMap[transaction.id]).toBe(transaction);
        });



    }) // end of setTransaction()
    describe('existingTransaction()', () => {
        it('returns an existing transaction given an input address', () => {
          transactionPool.setTransaction(transaction);
    
          expect(
            transactionPool.existingTransaction({ inputAddress: senderWallet.publicKey })
          ).toBe(transaction);
        });
      });

      describe('validTransactions()' , () => {
        let validTransactions , errorMock; // array of valid transactions from the transaction pool

        beforeEach(()=>{
          validTransactions = [];
          errorMock = jest.fn()
          global.console.error = errorMock;
          for(let i=0 ; i <10 ; i++){
            transaction = new Transaction({
              senderWallet, recipient: "Any recipient" , amount: 30
            });

            if(i%3===0){ // creting invalid transaction to test
              transaction.input.amount = 99999;
            }else if ( i%3===1){ // creating invalid transaction to test
              transaction.input.signiture = new Wallet().sign('foo');
            }else{ // good transaction
              validTransactions.push(transaction); /// these are transactions that are valid , validTransactions will only hold valid Transactions
            }

            transactionPool.setTransaction(transaction); 
          }//end of for
        }); // ends forEach

        it ( 'returns valid transaction' , () => {
          expect(transactionPool.validTransactions()).toEqual(validTransactions); //this will only look at the valid transactions
        })

        it('logs error for the invalid transactions', () => {
          transactionPool.validTransactions();
          expect(errorMock).toHaveBeenCalled();
        })
      })

      describe('clear()' , ()=> {

        

        

        it('clears the transaction' , () => {
          transactionPool.clear();

          expect(transactionPool.transactionMap).toEqual({});
        })
      });

      describe('clearBlockchainTransactions()' , () => {
        it('clears the pool of any existing blockchain transactions' , () =>{
          const blockchain = new Blockchain();
          const expectedTransactionMap = {};
          for(let i = 0 ; i<6 ; i++){
            const transaction = new Wallet().createTransaction({
              recipient: 'foo' , amount: 20
            });

            transactionPool.setTransaction(transaction);

            if(i%2===0){ // not valid transaction
              blockchain.addBlock({
                data: [transaction]
              });
            }else{
              expectedTransactionMap[transaction.id] = transaction; //valid transaction
            }

          }

          transactionPool.clearBlockchainTransactions({chain:blockchain.chain});
          expect(transactionPool.transactionMap).toEqual(expectedTransactionMap);
          
        });
      });


}); //end of TransactionPool descibe