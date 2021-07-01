import React, { Component } from 'react';
import { Button } from 'react-bootstrap';
import Transaction from './Transaction';
import { Link } from 'react-router-dom';
import history from '../history';

const POLL_INERVAL_MS = 10000;

class TransactionPool extends Component {
  state = { transactionPoolMap: {} }; //sets the transaction pool map 

  fetchTransactionPoolMap = () => {  //gets the transaction pool from the api and updates the state of the component.
    fetch(`${document.location.origin}/api/transaction-pool-map`)
      .then(response => response.json())
      .then(json => this.setState({ transactionPoolMap: json }));
  }

  fetchMineTransactions = () => { //mines the transactions that are in the pool by making a call to the api
    fetch(`${document.location.origin}/api/mine-transactions`)
      .then(response => {
        if (response.status === 200) {
          alert('success');
          history.push('/blocks');
        } else {
          alert('The mine-transactions block request did not complete.');
        }
      });
  }

  componentDidMount() { //will fetch transaction pool and the continously update the current state every 10 seconds
    this.fetchTransactionPoolMap();

    this.fetchPoolMapInterval = setInterval(
      () => this.fetchTransactionPoolMap(),
      POLL_INERVAL_MS
    );
  }

  componentWillUnmount() { //stops the request from continously calling, this is from the interval set up above
    clearInterval(this.fetchPoolMapInterval);
  }

  render() { //styles the component
    return (
      <div className='TransactionPool'>
        <div><Link to='/'>Home</Link></div>
        <h3>Transaction Pool</h3>
        {
          Object.values(this.state.transactionPoolMap).map(transaction => {
            return (
              <div key={transaction.id}>
                <hr />
                <Transaction transaction={transaction} />
              </div>
            )
          })
        }
        <hr />
        <Button
          bsStyle="danger"
          onClick={this.fetchMineTransactions}
        >
          Mine the Transactions
        </Button>
      </div>
    )
  }
}

export default TransactionPool;