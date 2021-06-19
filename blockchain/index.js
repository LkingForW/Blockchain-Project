
const Block = require('./block');
const {cryptoHash} = require('../Utils');


class Blockchain {
    constructor () {
        this.chain = [Block.genesis()]; // Makes sure that the first instance of the array is the genesis block
    }

     addBlock({data}){ // Adds block to the chain 

        const newBlock = Block.mineBlock({
            lastBlock: this.chain[this.chain.length -1 ],
            data
        });
        
        this.chain.push(newBlock);
    }

      static isValidChain( chain ){

        //Since no two object are ever the same we must compare their JSON properties to compary objects
        if( JSON.stringify(chain[0]) !== JSON.stringify(Block.genesis()) ) {
            return false;
        }

        
        
        for ( let i = 1 ; i < chain.length ; i++) {
            const { timestamp , data, hash, lastHash , nonce ,difficulty } = chain[i]; 
            const actualHash = chain[i-1].hash;

            if ( lastHash !== actualHash) return false; // looks to see if each hash is continuosly accurate

            const validatedHash = cryptoHash(timestamp,data,lastHash,nonce , difficulty);

            if(hash !== validatedHash) return false; // this makes sure that the original hash created is matches with the new hash, to check for data credibility

            
           const lastDifficulty = chain[i-1].difficulty;
           
           if(Math.abs(lastDifficulty - difficulty) > 1) return false;
        }


        return true;
    }

    replaceChain(chain, onSuccess){ // check to see if the new incoming chain is going to replace the original one



        //the chain is not longer
        if(chain.length <= this.chain.length) {
            console.error("The incoming chain must be longer");
            return;
        }

        //the chain is longer but the chain is not valid
        if(!Blockchain.isValidChain(chain)){
            console.error("The incoming chain must be valid");
            return;
        }


       
        if(onSuccess) onSuccess();

        console.log("Replacing chain with " , chain);
        this.chain = chain; //default statement if all other test pass -> the chain will be replaced 
    }

    
}

module.exports = Blockchain;