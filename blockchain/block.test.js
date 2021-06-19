
//used to test block.js 
const hexToBinary = require('hex-to-binary');
const {adjustDifficulty} = require('./block');
const Block = require('./block');
const { GENESIS_DATA , MINE_RATE } = require('../config');
const {cryptoHash} = require('../Utils');


describe('Block', () => {

    const timestamp = Date.now();
    const lastHash = "foo-lastHash";
    const hash = " foo-hash"; 
    const data = "foo-data";

    const nonce = 1;
    let difficulty = 1;

    const block = new Block({ timestamp,data,hash, lastHash, nonce , difficulty});

    it('has a timestamp, a lastHash, hash,nonce, difficulty and data property', () => {
        expect(block.timestamp).toEqual(timestamp);
        expect(block.hash).toEqual(hash);
        expect(block.lastHash).toEqual(lastHash);
        expect(block.data).toEqual(data);
        expect(block.nonce).toEqual(nonce);
        expect(block.difficulty).toEqual(difficulty);
    });


    //Testing to see if the genesis block was actually created
    describe('genesis()', () =>{ 
        const genesisBlock = Block.genesis();

        // console.log('genesisBlock', genesisBlock);

        it('returns a Block instance', () => {
            expect(genesisBlock instanceof Block).toBe(true);
        });

        it('it returns the genesis data', () => {
            expect(genesisBlock).toEqual(GENESIS_DATA);
        });
    });


    describe('mineBlock()' , () => { 
        const lastBlock = Block.genesis(); // this can be any block
        const data = 'mined data'; // this can also be any data
        
        const minedBlock = Block.mineBlock({lastBlock, data});
        
        it('returns a block instance', () => {
            expect(minedBlock instanceof Block).toBe(true);
        });

        it('sets the `lastHash` to be the `hash` of the lstBlock', () => { //used last hash as the genesis block
            expect(minedBlock.lastHash).toEqual(lastBlock.hash);
        });

        it('sets the `data`', () => {
            expect(minedBlock.data).toEqual(data);
        });

        it('sets up the `timestamp`', () => {
            expect(minedBlock.timestamp ).not.toEqual(undefined); // makes sure its not null
        });

        it('sets a `hash` that matches the dificulty setting' , () => { //will check for the hash to have the number of difficulty as leading zeros
            expect(hexToBinary(minedBlock.hash).substring(0, minedBlock.difficulty)).toEqual('0'.repeat(minedBlock.difficulty)); 
        });

        it('creates a sha256-hash for the data given', () => {
            expect(minedBlock.hash).toEqual(cryptoHash(
                minedBlock.timestamp,
                data,
                lastBlock.hash,
                minedBlock.nonce,
                minedBlock.difficulty
                )
            );
        });

        it ( 'adjust the difficulty ' , () => {
            const possibleResults = [lastBlock.difficulty + 1 ,lastBlock.difficulty - 1];

            expect(possibleResults.includes(minedBlock.difficulty)).toBe(true);
        });

    }); //Mined Block

    describe('adjustDifficulty' , () => {
        it('raises the difficulty for a quickly mined block', () => {
            expect(Block.adjustDifficulty({
                
              originalBlock: block, timestamp: block.timestamp + MINE_RATE - 100
            })).toEqual(block.difficulty+1);
          });
      
          it('lowers the difficulty for a slowly mined block', () => {
           
            expect(Block.adjustDifficulty({
              originalBlock: block, timestamp: (block.timestamp + MINE_RATE + 100)
            })).toEqual(block.difficulty-1);
          });

          it( 'has a lower limit of 1' , () => {
              block.difficulty = -1;

              expect(adjustDifficulty({originalBlock: block})).toEqual(1);
          });

    });

});
