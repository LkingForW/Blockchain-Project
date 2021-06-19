const Blockchain = require('./index');
const Block = require('./block');
const {cryptoHash} = require('../Utils');

describe('Blockchain', () => {
    let blockchain , newChain , originalChain;

    beforeEach(() => { // must do this to reset variable so that every time we use it, it does not just modify itself.
        blockchain = new Blockchain();
        newChain = new Blockchain();

        originalChain = blockchain.chain; // this kind of serves as temperary variable for when we are comapring chains in the replace chain function
    });

    it('conatins a `chain` Array instance' , () => {
        expect(blockchain.chain instanceof Array).toBe(true);
    });

    it('starts with a genesis block', () => {
        expect(blockchain.chain[0]).toEqual(Block.genesis());
    });

    it('adds a new block to the `chain`', () => {
        const newData = 'foo-bar';
        blockchain.addBlock({ data: newData});

        expect(blockchain.chain[blockchain.chain.length -1 ].data).toEqual(newData);
        
    });

    describe('isValidChain()', () => {

        describe('when the chain does not start with the genesis block', () => {
            
            it('returns false', () =>{ //if the the first block is not the genesis block then return false
                blockchain.chain[0] = {data: "Fake-Genesis-Data"};
                
                expect(Blockchain.isValidChain(blockchain.chain)).toBe(false); 
            });
        });

        describe('when the chain starts with the genesis block and has multiple block' , () => {

            beforeEach(() => {
                blockchain.addBlock({data: "Alain"});
                blockchain.addBlock({data: "Perez"});
                blockchain.addBlock({data: "Erica"});
            });

            describe('and a lastHash reference has changed', () => {
                it('return false', () => { // if the hashes does not match
                    blockchain.chain[2].lastHash = "broken last hash";
                    expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
                });
            });

            describe('and the chain conatins a block with an invalid field', () => { // checks to see if data was tampered with
                it('returns false' , () => {
                    blockchain.chain[2].data = "modified datas";
                    expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
                });
            });

            describe('and the chain contains a block with a jumped difficulty' , () => {
                it('returns false', () => {
                    const lastBlock = blockchain.chain[blockchain.chain.length -1 ];
                    const lastHash = lastBlock.hash;
                    const timestamp = Date.now();
                    const nonce = 0; 
                    const data = [];
                    const difficulty = lastBlock.difficulty - 3;

                    const hash = cryptoHash(timestamp, lastHash, difficulty, nonce, data);

                    const badBlock  = new Block ({ timestamp , lastHash , nonce , difficulty ,hash, data})

                    blockchain.chain.push(badBlock);

                    expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
                });
            });

            describe('and the chain does not conatin any invalid blocks', () => { //checks to see if the function works well when data is added properly
                it('returns true', () => {
                    expect(Blockchain.isValidChain(blockchain.chain)).toBe(true);
                });
            });

        });

    });

    describe('replaceChain', () => {

        let errorMock, logMock;

        beforeEach(()=>{
            errorMock = jest.fn();
            logMock = jest.fn();

            global.console.error = errorMock;
            global.console.log = logMock;
        });

        describe('When the chain is not longer' ,() => {
            it('does not get replaced', () => { // here we create a new chain and give it some dummy data
                newChain.chain[0] = {data: "Some-Data"}; 

                blockchain.replaceChain(newChain.chain); //then we pass this new argument to the function replace Chain

                //the replace chain function should not go through with it, because it is not longer, hence it should keep the original chain
                expect(blockchain.chain).toEqual(originalChain);
            });
        });

        describe('when the new chain is longer', () => {
            beforeEach(() => {
                newChain.addBlock({data: "Alain"});
                newChain.addBlock({data: "Perez"});
                newChain.addBlock({data: "Erica"});
            });

            describe('and the chain is invalid', ()=> {
                it('does not get replaced' , () => { // this is testing if the function is valid to beguin with
                    newChain.chain[2].hash = "some-fake-hash";

                    blockchain.replaceChain(newChain.chain);

                    expect(blockchain.chain).toEqual(originalChain);
                });
            });

            describe('and the new chain is valid' , ()=>{
                it('the chain is replaced', () => {
                    blockchain.replaceChain(newChain.chain);

                    expect(blockchain.chain).toEqual(newChain.chain);
                });
            });
        });
    });

});