const cryptoHash = require('./crypto-hash');

describe ('cryptoHash()' , () => {
    

    it('generates a SHE-256 hashed output' , () => {
        expect(cryptoHash('foo')).toEqual('b2213295d564916f89a6a42455567c87c3f480fcd7a1c15e220f17d7169a790b');
    });

    it('generates teh same output with different ordered fields' , () => {
        expect(cryptoHash('one', 'two' , 'three')).toEqual(cryptoHash('two', 'one','three'));
    });

    it('produces a unique hash when the properties have changed on an input' , () => {
        const foo ={};
        const originalHash = cryptoHash(foo);
        foo['a'] = 'a';

        expect(cryptoHash(foo)).not.toEqual(originalHash);
    })

});