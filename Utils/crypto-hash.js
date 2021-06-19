const crypto = require('crypto');


//combines any inputs as an array
const cryptoHash = (...inputs) => {
    const hash = crypto.createHash('sha256'); //depending on the string is what type of hash it creates

    hash.update(inputs.map((input) => JSON.stringify(input)).sort().join(' ')); //will sort so no matter the order of the input it will always be the same.
    // the JSON.Stringify is meant for pointer exception to not acour. the objects will be the same refardless of their properties even after being changed.

    return hash.digest('hex'); // must use digest and the type that you want
};

module.exports = cryptoHash;

