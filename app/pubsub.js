
/**
 * Redis a a module that allows for publisher / subcriber relationship. This means that publishers will handle the broadcasting 
 * of messages and subcriber the listening of the messager. Each instance will have a publisher and a su
 */

const redis = require('redis');
const Blockchain = require('../blockchain');

const CHANNELS = { // sets up the channels
    TEST: "TESTS",
    BLOCKCHAIN: "BLOCKCHAIN",
    TRANSACTION: 'TRANSACTION'
}

class PubSub {

    constructor({blockchain , transactionPool , redisUrl}){

        this.blockchain = blockchain;//NOTE: Each blockchain should be able to broadcast and replace in case that it is valid.
        this.transactionPool = transactionPool;

        this.publisher = redis.createClient(redisUrl);
        this.subscriber = redis.createClient(redisUrl);
        
        this.subscribeToChannels(); //This will handle all of the channel subscribtions --> WHenever a new message is sent out, it will listen and update
        
        this.subscriber.on('message', 
        (channel , message) => this.handleMessage(channel, message) 
        ); // this will publish the message on a specific channel , allowing all other nodes to listen in
        
    }

    handleMessage(channel, message) {
        //For now we are just logging the message 
        console.log(`Message recieve. Channel ${channel} , Message: ${message}`);

        const parsedMessage = JSON.parse(message); //will parse the message 


        switch(channel){
            case CHANNELS.BLOCKCHAIN:
                this.blockchain.replaceChain(parsedMessage, true , () => {
                    this.transactionPool.clearBlockchainTransactions({
                        chain: parsedMessage
                    });
                });
                break;

            case CHANNELS.TRANSACTION:
                this.transactionPool.setTransaction(parsedMessage); //adds transaction to the pool
                break;
            
            default:
                return;
        }
    }

    subscribeToChannels(){//subscribe to all channels part of `CHANNEL`
        
        Object.values(CHANNELS).forEach(channel => {
            this.subscriber.subscribe(channel);
        })
    }

    

    publish( {channel , message} ){ // this function will not only publihsh a message but also prevent the subscriber to subscribe on itself

        //NOTE: it does this but unsubscribing -> publishing -> then subscribing again
        this.subscriber.unsubscribe(channel , () => {
            this.publisher.publish(channel,message , () => {
                this.subscriber.subscribe(channel);
            });
        });

        
    }

    broadcastChain(){ //this will publish the blockchain
        
        this.publish({
            channel: CHANNELS.BLOCKCHAIN ,
            message: JSON.stringify(this.blockchain.chain) // needs to be a string
        });
    }

    broadcastTransaction(transaction){ // will broadcast the transaction to all the nodes
        this.publish({
            channel: CHANNELS.TRANSACTION,
            message: JSON.stringify(transaction)
        })
    }

}



 module.exports = PubSub; //exports class so other classes can use this as well


