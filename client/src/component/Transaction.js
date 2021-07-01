import React from 'react';

const Transaction = ({transaction}) => { // getting the properties of the components
    const { input , outputMap} = transaction;
    const recipients = Object.keys(outputMap);

    return (
        <div className='Transaction'>
            <div>From: {`${input.address.substring(0,20)}...`} | Balance: {input.amount} </div>
            {
                recipients.map(recipient => ( // this syntax mean that it will return this output jsx
                        <div key={recipient}>
                            {/* Substrings the recipient address just so that its not long. */}
                            To: {`${recipient.substring(0,20)}...`} | Sent: {outputMap[recipient]} 
                        </div>
                    )
                )
            }
        </div>
    );


}

export default Transaction;
