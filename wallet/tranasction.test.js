const Wallet = require('.');
const { REWARD_INPUT, MINING_REWARD } = require('../config');
const { verifySigniture } = require('../Utils');
const Transaction = require('./transaction');


describe('Transaction', () => {
    let transaction , senderWallet, recipient, amount;


    describe('and the amount is valid' , () => {
        
    })
    beforeEach(()=>{
        senderWallet = new Wallet();
        recipient = 'recipient-public-key';
        amount = 50;
        transaction = new Transaction({senderWallet , recipient , amount});
    });

    it('has an id' , () => {
        expect(transaction).toHaveProperty('id'); //makes sure that the transaction has an id 
    });

    describe('outputMap' , () => {
        it('has an outputMap' , () => {
            expect(transaction).toHaveProperty('outputMap');
        });

        it('outputs the amount to the recipient', () => {
            expect(transaction.outputMap[recipient]).toEqual(amount);
        });

        it('outputs the ramaining balance for the senderWallet', () => {
            expect(transaction.outputMap[senderWallet.publicKey]).toEqual(senderWallet.balance - amount);
        })
    })


    describe('input', () => {
        it('has an input`' , () => {
            expect(transaction).toHaveProperty('input');
        });

        it(' has a timestamp in the input', () => {
            expect(transaction.input).toHaveProperty('timestamp');
        });

        it('sets the amount to the senderWallet balance', () => {
            expect(transaction.input.amount).toEqual(senderWallet.balance);
        });

        it('sets the address to the senderWallet publicKey', () => {
            expect(transaction.input.address).toEqual(senderWallet.publicKey);
        });

        it('signs the input' , () => {
           expect( verifySigniture({
            publicKey: senderWallet.publicKey,
            data: transaction.outputMap,
            signiture: transaction.input.signiture
             })
            ).toBe(true);
        })
    })

    describe('validTransaction', () => {
        let errorMock;

        beforeEach(()=>{
            errorMock = jest.fn();
            global.console.error = errorMock;
        })
        describe('when the transaction is valid', () => {
            it('returns true', ()=>{
                expect(Transaction.validTransaction(transaction)).toBe(true);
            });
        })

        describe('when the transaction is invalid', () => {
            describe('and a transaction outputMap value is invalid', () => {
                it('returns false , and logs an error',()=>{
                     transaction.outputMap[senderWallet.publicKey] = 9999999;   


                    expect(Transaction.validTransaction(transaction)).toBe(false);
                    expect(errorMock).toHaveBeenCalled();
                });
            })

            describe('and the transaction input signiture is invalid' , () => {
                it('returns false & and logs an error',()=>{
                    transaction.input.signiture = new Wallet().sign('fake-data'); //whenevr you sign something you are basically creating a hash based of the given information, if any information is changed then the data wont be valid anymore
                    expect(Transaction.validTransaction(transaction)).toBe(false);
                    expect(errorMock).toHaveBeenCalled();
                });
            })
        })
    })

    describe('update()' , () => {
        let orginalSigniture , originalSenderOutput , nextRecipient, nextAmount;

        describe('and the amount is invalid' , () => {
            it('throws an error' , () => {
                expect(() => {
                    transaction.update({
                        senderWallet,recipient: 'foo' , amount: 999999
                    })
                }).toThrow('Amount exceeds balance');
            })
        })



        describe('and the amount is valid' , () => {
            beforeEach(() => {
                orginalSigniture = transaction.input.signiture;
                originalSenderOutput = transaction.outputMap[senderWallet.publicKey];
                nextRecipient = 'next-recipient';
                nextAmount = 50;
    
                transaction.update({senderWallet, recipient:nextRecipient , amount: nextAmount})
            }) 
    
            it('outputs the amount to the next recipient' , () => {
                expect(transaction.outputMap[nextRecipient]).toEqual(nextAmount);
            });
    
            it('subtract the amount from the sender output amount', () => {
                expect(transaction.outputMap[senderWallet.publicKey]).toEqual(originalSenderOutput - nextAmount);
            });
            it('maintains a total output that matches the input amount', () => {
                expect(
                  Object.values(transaction.outputMap)
                    .reduce((total, outputAmount) => total + outputAmount)
                ).toEqual(transaction.input.amount);
              });
            it('re-signs the transaction', () => {
                expect(transaction.input.signiture).not.toEqual(orginalSigniture);
            });
        
            describe ('and another update for the same recipient' ,() => {
                let addedAmount;
    
                beforeEach(() => {
                    addedAmount = 80;
                    transaction.update({
                      senderWallet, recipient: nextRecipient, amount: addedAmount
                    });
                  });
    
                it('adds to the recipient amount', () => {
                    expect(transaction.outputMap[nextRecipient])
                      .toEqual(nextAmount + addedAmount);
                  });
    
                it('subtracts the amount from the original sender output amount', () => {
                    expect(transaction.outputMap[senderWallet.publicKey])
                      .toEqual(originalSenderOutput - nextAmount - addedAmount);
                });
            });
        })

        
    }); // end of update

    describe('rewardtransaction()', () =>{
        let rewardTransaction, minerWallet;

        beforeEach(() => {
            minerWallet = new Wallet();
            rewardTransaction = Transaction.rewardTransaction({minerWallet}); //creates a new transaction out of the wallet 
        });

        it('it creates a transaction with the reward input' , () => {
            expect(rewardTransaction.input).toEqual(REWARD_INPUT);
        });

        it('creates ones transaction for the miner with the MINING_REWARD' , () => {
            expect(rewardTransaction.outputMap[minerWallet.publicKey]).toEqual(MINING_REWARD);
        })
    });

}); //end of test