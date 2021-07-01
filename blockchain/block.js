const { GENESIS_DATA, MINE_RATE } = require("../config");
const {cryptoHash} = require('../Utils');
const hexToBinary = require('hex-to-binary');

//block class 
class Block {
    constructor({timestamp,lastHash, hash,data,nonce , difficulty}){
        this.timestamp = timestamp;
        this.lastHash = lastHash;
        this.hash = hash;
        this.data = data;
        this.nonce = nonce; 
        this.difficulty = difficulty;
    }
    
    //generates the genesis block
    static genesis(){
        return new this(GENESIS_DATA);
    }

    //this will take in the previous block in the chain and create a new on with the incoming data
    static mineBlock({lastBlock , data}){

        const lastHash = lastBlock.hash;
        let timestamp , hash;
        let { difficulty } = lastBlock;
        let nonce = 0;

        do {
            nonce++;
            timestamp = Date.now(); // every time the chain rties to find the hash the time changes , hence the timestamp needs to change as well
            difficulty = Block.adjustDifficulty({ originalBlock: lastBlock, timestamp }); // The difficulty will be based of the timestamp from the last guess of block
            hash = cryptoHash(timestamp, lastHash, data, nonce, difficulty);
          } while (hexToBinary(hash).substring(0, difficulty) !== '0'.repeat(difficulty)) // The hex to binary function comes from the hex-to-binary library  that turns hex to binary 
          // - > this is better because it allows for a more adjustable difficulty setting


        return new this({ //returns the newly created block
            timestamp,  
            lastHash,
            data ,
            difficulty,
            nonce,
            hash
        });
    }

    //This will adjust the difficulty based on the mine rate of the application
    static adjustDifficulty({ originalBlock, timestamp }) {
    let { difficulty } = originalBlock;

    if (difficulty < 1) return 1; // in case the difficulty ever goes negative.

    if ((timestamp - originalBlock.timestamp) > MINE_RATE ) return difficulty - 1;

    return difficulty + 1;
  }
}

module.exports = Block; //used to share files 


