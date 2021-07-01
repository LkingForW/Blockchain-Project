
//Mine rate the app will allow for miners to mine
const MINE_RATE = 1000; // 1 second  

//initial difficulty, will change depending on mine rate
const INITIAL_DIFFICULTY = 1;

const GENESIS_DATA = { //first block of the blockchain
    timestamp: 1,
    lastHash: 'Genesis init',
    hash: 'GENESIS',
    difficulty: INITIAL_DIFFICULTY,
    nonce: 0,
    data: []
};

//starting balance on anyones wallet
const STARTING_BALANCE = 1000;

//address for reward transactions
const REWARD_INPUT = {
    address: '*authorized-reward*'
};

//reward for mining a block
const MINING_REWARD = 50;

module.exports = {GENESIS_DATA , MINE_RATE , STARTING_BALANCE,REWARD_INPUT,MINING_REWARD};
