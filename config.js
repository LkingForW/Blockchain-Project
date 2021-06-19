

const MINE_RATE = 20000; // 20 second  

const INITIAL_DIFFICULTY = 13;

const GENESIS_DATA = { //first block of the blockchain
    timestamp: 1,
    lastHash: 'Genesis init',
    hash: 'GENESIS',
    difficulty: INITIAL_DIFFICULTY,
    nonce: 0,
    data: []
};

const STARTING_BALANCE = 1000;

const REWARD_INPUT = {
    address: '*authorized-reward*'
};

const MINING_REWARD = 50;

module.exports = {GENESIS_DATA , MINE_RATE , STARTING_BALANCE,REWARD_INPUT,MINING_REWARD};
