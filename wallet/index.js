
const {STARTING_BALANCE} = require('../config');
const {ec} = require('../Utils/index');
const { cryptoHash } = require('../Utils');
const Transaction = require('./transaction');

class Wallet {

    constructor(){
        this.balance = STARTING_BALANCE;
        
        this.keyPair = ec.genKeyPair(); // -> This generates the key key pair from the "ec" function 

        this.publicKey = this.keyPair.getPublic().encode('hex'); //--> Originally the getPublic() method returns a pair of x,y cordinates to a elliptic 
        //graph, you must encode to hex for it to be understandable 
    }

    sign(data){
        return this.keyPair.sign(cryptoHash(data));
    }

    createTransaction({recipient, amount , chain}){

        if(chain){//if chain is defined, then it will calculate the balance
            this.balance = Wallet.calculateBalance({
                chain,
                address: this.publicKey
            })
        }

        if(amount > this.balance){
            throw new Error("Amount exceeds balance");
        }

        return new Transaction({
            senderWallet: this, // when refering to the class itself you just call this "this = Wallet"
            recipient,
            amount
        });
    }

    static calculateBalance({ chain, address }) {
        let hasConductedTransaction = false;
        let outputsTotal = 0;
    
        for (let i=chain.length-1; i>0; i--) {
          const block = chain[i];
    
          for (let transaction of block.data) {
            if (transaction.input.address === address) {
              hasConductedTransaction = true;
            }
    
            const addressOutput = transaction.outputMap[address];
    
            if (addressOutput) {
              outputsTotal = outputsTotal + addressOutput;
            }
          }
    
          if (hasConductedTransaction) {
            break;
          }
        }
    
        return hasConductedTransaction ? outputsTotal : STARTING_BALANCE + outputsTotal;
      }

}

module.exports = Wallet;