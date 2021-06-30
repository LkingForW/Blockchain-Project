/**
 * This File will handle everything with requesting and handling JASON
 */




//CLASS INPPORTS
const express = require('express');
const request = require('request'); // Allows for HTTP Request
const path = require('path');
const Blockchain = require('./blockchain/index');
const PubSub = require('./app/pubsub');
const TransactionPool = require('./wallet/transaction-pool');
const Wallet = require('./wallet');
const { response } = require('express');
const TransactionMiner = require('./app/transaction-miner');


const isDevelopment = process.env.ENV === 'development';
//CONSTANTS
const DEFAULT_PORT = 3000 // PORT FOR LSITEN
const ROOT_NODE_ADRESS = isDevelopment ? `http://localhost:${DEFAULT_PORT}` : 'https://shrouded-escarpment-73920.herokuapp.com';
const REDIS_URL = isDevelopment ? 
    'redis://127.0.0.1:6379' :
    'redis://:p609795f4eec7f801682abd1894e0169c9aea54c1c4f8b1c692eeb695633a28f0@ec2-54-88-72-153.compute-1.amazonaws.com:18749';

//VARIABLES
let PEER_PORT;



//CLASS INITS
const app = express();
const blockchain = new Blockchain();

const transactionPool = new TransactionPool();
const wallet = new Wallet();
const pubsub = new PubSub({blockchain , transactionPool , redisUrl: REDIS_URL});
const transactionMiner = new TransactionMiner({blockchain, transactionPool, wallet, pubsub});

app.use(express.json()); // use to PARSE JSON
app.use(express.static(path.join(__dirname , 'client/dist')));//serve static files from a directory , this will allow any file within this directory to be used

//GET Request 
app.get('/api/blocks' , (req , res ) => { // the rrs object allows us to understand how the get will repsond
    res.json(blockchain.chain);
});

app.get('/api/transaction-pool-map', (req, res) => { // gets the transaction Pool
    res.json(transactionPool.transactionMap);
});

app.get('/api/mine-transactions', (req , res) => { // mines all of the transactions on the map
    transactionMiner.mineTransactions();

    res.redirect('/api/blocks'); // will redirect to the blocks
});

app.get('/api/wallet-info' , (req, res) => {
    res.json({
        address: wallet.publicKey,
        balance: Wallet.calculateBalance({chain: blockchain.chain  , address: wallet.publicKey})
    });
});

//POST REQUEST
app.post('/api/mine' , (req , res) => {
    const {data} = req.body;

    blockchain.addBlock({data}); // adds the data from the req 
    pubsub.broadcastChain();//will broadcast chain automatically
    res.redirect('/api/blocks');
})

app.post('/api/transact' , (req , res) => {
    const {recipient , amount } = req.body;

    let transaction = transactionPool.existingTransaction({inputAddress: wallet.publicKey});

    try{
        if(transaction){ // if the transaction is identified and exists 
            transaction.update({senderWallet: wallet , recipient, amount});
        }else{ // if it does not excist then create the transaction
            transaction = wallet.createTransaction({
                recipient , 
                amount , 
                chain:blockchain.chain }); // this will make sure that the transaction is added with the correct balance on wallet
        }

    }catch(error){
       return res.status(400).json({ // 400 means this is a bad request
            type: 'error',
            message: error.message
        });
    }
    
    transactionPool.setTransaction(transaction); // adding transaction to the pool

    pubsub.broadcastTransaction(transaction); // this will broadcast transaction pool

    res.json({ type: 'success' , transaction });

});

//FRONT END
app.get('*', (req , res) => { // any endpoint that has not already been defined
    res.sendFile(path.join(__dirname, "./client/dist/index.html")); //need the path.join method to be able to utilize the url
});




//SYNC CHAIN FUNCTION
const syncWithRootState = () => { // this function will make http request to the /api/blocks to obtain the current blockchain chain
    request({url: `${ROOT_NODE_ADRESS}/api/blocks` }, (error , response , body ) => {
        if(!error && response.statusCode === 200) { // if no errors and the request is succesfull then parse the current chain to root chain & replace the local chain with root chain
            const rootChain = JSON.parse(body);
            console.log('root chain has been synced ' , rootChain); //this will print the most up to date chain in the
            blockchain.replaceChain(rootChain);
        }else{
            console.log(error);
            
        }
    })

    request({ url: `${ROOT_NODE_ADRESS}/api/transaction-pool-map`}, (error , response , body) => {
        if(!error && response.statusCode === 200){
            const rootPoolMap = JSON.parse(body);
            console.log('Transaction pool has been synced' , rootPoolMap);
            transactionPool.setMap(rootPoolMap);
        }else{
            console.log(error);
        }
    });
};



if(isDevelopment){
    // const walletFoo = new Wallet();
    // const walletBar = new Wallet();

    // const generateWalletTransaction = ({ wallet, recipient, amount }) => {
    //   const transaction = wallet.createTransaction({
    //     recipient, amount, chain: blockchain.chain
    //   });

    //   transactionPool.setTransaction(transaction);
    // };

    // const walletAction = () => generateWalletTransaction({
    //   wallet, recipient: walletFoo.publicKey, amount: 5
    // });

    // const walletFooAction = () => generateWalletTransaction({
    //   wallet: walletFoo, recipient: walletBar.publicKey, amount: 10
    // });

    // const walletBarAction = () => generateWalletTransaction({
    //   wallet: walletBar, recipient: wallet.publicKey, amount: 15
    // });

    // for (let i=0; i<10; i++) {
    //   if (i%3 === 0) {
    //     walletAction();
    //     walletFooAction();
        
    //   } else if (i%3 === 1) {
    //     walletAction();
    //     walletBarAction();
    //   } else {
    //     walletFooAction();
    //     walletBarAction();
    //   }
    //   transactionMiner.mineTransactions();
    // }
}



  


if( process.env.GENERATE_PEER_PORT === 'true') {
    PEER_PORT = DEFAULT_PORT + Math.ceil(Math.random() *1000); // add a random number from 3k to 4k
}

const PORT = process.env.PORT || PEER_PORT || DEFAULT_PORT;

app.listen(PORT , () => {
    console.log(`Listening at localhost:${PORT}`);

    if(PORT !== DEFAULT_PORT){ //this will prevent the default port to call itself
        syncWithRootState(); //This will allow chains to be up to date when a new listening is created
    }
    
});

