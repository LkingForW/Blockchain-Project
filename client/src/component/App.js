import React, { Component } from 'react';
import logo from '../assests/logo.png';
import {Link} from 'react-router-dom'; // used instead of <a> tags to prevent the need for refreshing and using multiplle fetch if not needed.

class App extends Component{



    state = {
        walletInfo: { }
    };

    //Gets wallet info
    componentDidMount() { // fetch is how you proceed with get request in react. 
        fetch(`${document.location.origin}/api/wallet-info`).then((response)=>{
            response.json().then( json => { // a promise within a promise to obtain th json.
                this.setState({walletInfo: json})
            })
        });
    }

    render() { //will handle styling for the aplplication while bringing in other components
        const {address , balance} = this.state.walletInfo;
        return (
            <div className='App'> 
                <img className='logo' src={logo}></img>
                <br/>
                <div>Welcome to the blockchain...</div>
                <br/>
                <div><Link to='/blocks'>Blocks</Link></div>
                <div><Link to='/conduct-transaction'>Conduct Transaction</Link></div>
                <div><Link to='/transaction-pool'>Transaction Pool</Link></div>
                <br/>
                <div className='WalletInfo'> 
                    <div>Address: {address}</div>
                    <div>Balance: {balance}</div>
                </div>
            </div>
        );
    }

}

export default App;
