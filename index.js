const bodyParser = require('body-parser');
const express = require('express');
const request = require('request');
const path = require('path');
const Blockchain = require('./blockchain');
const PubSub = require('./app/pubsub');
const TransactionPool = require('./wallet/transaction-pool');
const Wallet = require('./wallet');
const TransactionMiner = require('./app/transaction-miner');

const isDevelopment = process.env.ENV === 'development';

const REDIS_URL = isDevelopment ?
  'redis://127.0.0.1:6379' :
  'redis://:p609795f4eec7f801682abd1894e0169c9aea54c1c4f8b1c692eeb695633a28f0@ec2-54-88-72-153.compute-1.amazonaws.com:18749'

const DEFAULT_PORT = 3000;
const ROOT_NODE_ADDRESS = `http://localhost:${DEFAULT_PORT}`;

//Variables 

const app = express(); // host the express app
const blockchain = new Blockchain(); //blockchain instance
const transactionPool = new TransactionPool(); // transaction pool instance
const wallet = new Wallet();
const pubsub = new PubSub({ blockchain, transactionPool, redisUrl: REDIS_URL });
const transactionMiner = new TransactionMiner({ blockchain, transactionPool, wallet, pubsub });

app.use(express.json()); 
app.use(express.static(path.join(__dirname, 'client/dist')));

app.get('/api/blocks', (req, res) => { // list of all of the blocks on the blockchain
  res.json(blockchain.chain);
});

app.get('/api/blocks/length', (req, res) => { // resturns the length of the chian
  res.json(blockchain.chain.length);
});

app.get('/api/blocks/:id', (req, res) => { // this is the get request used to paginate the blocks in recent-oldest
  const { id } = req.params;
  const { length } = blockchain.chain;

  const blocksReversed = blockchain.chain.slice().reverse();

  let startIndex = (id-1) * 5;
  let endIndex = id * 5;

  startIndex = startIndex < length ? startIndex : length;
  endIndex = endIndex < length ? endIndex : length;

  res.json(blocksReversed.slice(startIndex, endIndex));
});

app.post('/api/mine', (req, res) => { //mines block with post request 
  const { data } = req.body; // takes data from json body

  blockchain.addBlock({ data });

  pubsub.broadcastChain(); //broadcasts the chain on the network

  res.redirect('/api/blocks'); // redirects to blocks once request is over
});

app.post('/api/transact', (req, res) => { // post request to process transaction
  const { amount, recipient } = req.body;

  let transaction = transactionPool
    .existingTransaction({ inputAddress: wallet.publicKey });

  try { // this will prevent multiple transactions within the sma epool. if a transaction already excist with that recipient then just add the amouns
    if (transaction) {
      transaction.update({ senderWallet: wallet, recipient, amount });
    } else {
      transaction = wallet.createTransaction({
        recipient,
        amount,
        chain: blockchain.chain
      });
    }
  } catch(error) {
    return res.status(400).json({ type: 'error', message: error.message });
  }

  transactionPool.setTransaction(transaction); // sets the transaction in the pool

  pubsub.broadcastTransaction(transaction); // broadcast the transaction to everyone

  res.json({ type: 'success', transaction });
});

app.get('/api/transaction-pool-map', (req, res) => { // list all transactions in the pool map
  res.json(transactionPool.transactionMap);
});

app.get('/api/mine-transactions', (req, res) => { // node mines all the transactions in the pool
  transactionMiner.mineTransactions();

  res.redirect('/api/blocks'); //redirects to /api/blocks
});

app.get('/api/wallet-info', (req, res) => { //displays wallet info
  const address = wallet.publicKey;

  res.json({
    address,
    balance: Wallet.calculateBalance({ chain: blockchain.chain, address })
  });
});

app.get('/api/known-addresses', (req, res) => { // displays known addreses, all addreses that you hvae previously completed transactions with
  const addressMap = {};

  for (let block of blockchain.chain) {
    for (let transaction of block.data) {
      const recipient = Object.keys(transaction.outputMap);

      recipient.forEach(recipient => addressMap[recipient] = recipient);
    }
  }

  res.json(Object.keys(addressMap));
});

app.get('*', (req, res) => { // 
  res.sendFile(path.join(__dirname, 'client/dist/index.html'));
});

const syncWithRootState = () => { // this will make sure that new nodes are up to date with the current chain
  request({ url: `${ROOT_NODE_ADDRESS}/api/blocks` }, (error, response, body) => {
    if (!error && response.statusCode === 200) {
      const rootChain = JSON.parse(body);

      console.log('replace chain on a sync with', rootChain);
      blockchain.replaceChain(rootChain);
    }
  });

  //makes sure that the new nodes are also synced with the pool map
  request({ url: `${ROOT_NODE_ADDRESS}/api/transaction-pool-map` }, (error, response, body) => {
    if (!error && response.statusCode === 200) {
      const rootTransactionPoolMap = JSON.parse(body);

      console.log('replace transaction pool map on a sync with', rootTransactionPoolMap);
      transactionPool.setMap(rootTransactionPoolMap);
    }
  });
};

let PEER_PORT;

if (process.env.GENERATE_PEER_PORT === 'true') { // this allows for the generation of peer nodes on the dev env
  PEER_PORT = DEFAULT_PORT + Math.ceil(Math.random() * 1000);
}

const PORT = process.env.PORT || PEER_PORT || DEFAULT_PORT; //sets up the port
app.listen(PORT, () => { //starts the client
  console.log(`listening at localhost:${PORT}`);

  if (PORT !== DEFAULT_PORT) {
    syncWithRootState();
  }
});