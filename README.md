# 🪙  Blockchain Project 🪙  

## Description

This is a project description along with how to run it yourself localy if youd like to give it a go. This project supports basic functionality of a blockchain. It introduces the backend logic while also implementing a frontend and even having a distributed network. It works off a publisher/subscriber template that will allow nodes to recognise when there has been a change on a respective channel.

  Video Link: [Preview] | https://www.youtube.com/watch?v=xVQarGlAV2A

  Node Live on Heroku: [Node 1]

  Node Live on Heroku: [Node 2]
  

## Test It Yourself 🛠

If you have npm already installed in your machine and you have already cloned the project into a local directory.

#### Step 1

```bash
npm install
```

This will install all the needed dependencies.

#### Step 2

```bash
npm run dev
```

![Preview of Code](https://raw.githubusercontent.com/LkingForW/Pictures/main/Screen%20Shot%202021-06-30%20at%208.06.50%20PM.png?token=AK6BS76343RNGFMK5MIHQDDA3UFJK)

This will run a local instance of the project on your machine in http://localhost:3000/

#### Step 3

```bash
npm run dev-peer
```

![Preview of Node-Peer](https://raw.githubusercontent.com/LkingForW/Pictures/main/Screen%20Shot%202021-06-30%20at%208.14.34%20PM.png?token=AK6BS7ZH5AJK3RXCLXJEKX3A3UFQA)

This will run a second copy on an open port, this will have a broadcasted chain in it so you will have to SCROLL UP ON THE TERMINAL to find the port it is running in.

    🍾 Congrats!🍾

    You're finished and if everything went well, the project should be working !

## Features

Sub-features will be labeled as either [BE] Back End or [FR] Front End

- ### Blockchain

  - Test Driven Approach [BE]
  - Allows Chain replacement [BE]
  - Validates chain and incoming chains [BE]
  - Broadcasting chain on network [BE]
  - Pagginated exploration of the Blocks within the chain [FE]

- ### Block

  - Test Driven Approach [BE]
  - Genesis Block [BE]
  - Functionality to mine block [BE]
  - Sha-256 hash based of Block data [BE]
  - Block Includes: Last Hash, Hash, Nonce, Difficulty, Transaction, Timestamp [BE]
  - Displays Block Data in the front end [FE]

- ### Transactions

  - Main Transaction class consisting of output map and input map [BE]
  - Validates Transactions [BE]
  - In joint with Wallet class [BE]
  - Covered edge Cases to prevent vulnerabilities ( invalid amount, insufficient funds) [BE]
  - Reusable transaction component [FE]
  - Post transaction throught frontend [FE]
  - Known addresses are feautured in frontend and backend [BE] [FE]

- ### Transaction Pool

  - Core Transaction Pool class with ability to add transaction to the pool and set [BE]
  - Through POST request, transactions are added to the pool [BE]
  - Validation of transaction before passing to the pool [BE]
  - Able to read Transaction Pool data through API GET request [BE]
  - Synced transaction pool amongst all peers of the network [BE]
  - Displays Pool from frontend [FE]

- ### Transaction Miner

  - Transaction Miner class handles how miners "mine" transaction to the blockchain [BE]
  - Ability to grab valid transactions from the pool [BE]
  - Only unique transactions are mined (no duplicates) [BE]
  - Able to mine transaction through GET equest via API [BE]
  - Validates incoming transaction balances [BE]
  - Can mine from pool in frontend [FE]

- ### Wallet

  - Core wallet class [BE]
  - cryptographic key pairs (public key) & (private key) using [Elliptic] [BE]
  - Signiture generation & verification for transaction verification [BE]
  - Calculates wallet balnce based on the chain history [BE]

- ### Application
  
  - [Express] API allowing HTTP request [BE]
  - Real-Time messaging network through [Redis] [BE]
  - "Peers" are initiated through alternate ports [BE]
  - Chain is synced when a new peer joins the network, new peers will have updated chain at moment of joining [BE]
  - Serving front end page using [Express] [FE]
  - Using React in the frontend using [parcel-bundler] [FE]
  - Styling the application so its not barbones HTML [FE]
  - Better Visualisation of the blocks from the chain [FE]
  - Toggling transaction display [FE]
  - Added routing for a multi-page application using [react-router-dom] [FE]

- ### Proof of Work

  - Proof of work system added, difficulty and nonce added to every block [BE]
  - Smart scrypt that will adjust difficulty based on the MINE_RATE [BE]
  - Hash 256 Incryptiong is in binary bit format for more accuracy on the difficulty [BE]
  - Patched jump attack exploit by adding extra validation step on the blockchain [BE]

- ### API

  - /api/blocks
  - /api/blocks/length
  - /api/blocks/:id
  - /api/mine
  - /api/blocks
  - /api/transact
  - /api/transaction-pool-map
  - /api/mine-transactions
  - /api/wallet-info
  - /api/known-addresses

[Redis]: <https://redis.io/>
[Express]: <https://expressjs.com/>
[Elliptic]: <https://www.npmjs.com/package/elliptic>
[parcel-bundler]: <https://www.npmjs.com/package/parcel-bundler>
[react-router-dom]: <https://reactrouter.com/web/guides/quick-start>
[Preview]: <https://www.youtube.com/watch?v=xVQarGlAV2A>
[Node 1]: <https://shrouded-escarpment-73920.herokuapp.com/>
[Node 2]: <https://blooming-sands-21568.herokuapp.com/>
[Preview of Code]: <https://raw.githubusercontent.com/LkingForW/Pictures/main/Screen%20Shot%202021-06-30%20at%208.06.50%20PM.png?token=AK6BS76343RNGFMK5MIHQDDA3UFJK>
[Preview of Node-Peer]: <https://raw.githubusercontent.com/LkingForW/Pictures/main/Screen%20Shot%202021-06-30%20at%208.14.34%20PM.png?token=AK6BS7ZH5AJK3RXCLXJEKX3A3UFQA>
