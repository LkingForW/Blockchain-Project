

const MINE_RATE = 1000; // 1 second  

const INITIAL_DIFFICULTY = 1;

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
