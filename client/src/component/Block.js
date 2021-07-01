import React, { Component } from 'react';
import { Button } from 'react-bootstrap';
import Transaction from './Transaction';

class Block extends Component {
  state = { displayTransaction: false }; //to keep track of button in front end to extend the transaction

  toggleTransaction = () => { //toogles the view more button state (display transaction state)
    this.setState({ displayTransaction: !this.state.displayTransaction });
  }

  get displayTransaction() { //display the transaction of the block
    const { data } = this.props.block; //brings in the data through the component property

    const stringifiedData = JSON.stringify(data); //stringifies the data into json


    //if the data is more than 35 characters then truncate
    const dataDisplay = stringifiedData.length > 35 ? 
      `${stringifiedData.substring(0, 35)}...` :
      stringifiedData;

      //when display transaction = true then display the transaction in the style
    if (this.state.displayTransaction) {
      return (
        <div>
          {
            data.map(transaction => (
              <div key={transaction.id}>
                <hr />
                <Transaction transaction={transaction} />
              </div>
            ))
          }
          <br />
          <Button
            bsStyle="danger"
            bsSize="small"
            onClick={this.toggleTransaction}
          >
            Show Less
          </Button>
        </div>
      )
    }

    // //displays the truncated data
    return (
      <div>
        <div>Data: {dataDisplay}</div> 
        <Button
          bsStyle="danger"
          bsSize="small"
          onClick={this.toggleTransaction}
        >
          Show More
        </Button>
      </div>
    );
  }

  render() { //renders the component data
    const { timestamp, hash } = this.props.block;

    const hashDisplay = `${hash.substring(0, 15)}...`;

    return (
      <div className='Block'>
        <div>Hash: {hashDisplay}</div>
        <div>Timestamp: {new Date(timestamp).toLocaleString()}</div>
        {this.displayTransaction}
      </div>
    );
  }
};

export default Block;
