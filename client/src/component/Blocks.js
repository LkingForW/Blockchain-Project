// This is the react component that will allows us to visuallize the blocks in the blockchain
import React , {Component}  from 'react';
import Block from './Block';
import {Link} from 'react-router-dom';

class Blocks extends Component {

    state = {blocks: []}

    componentDidMount(){
        fetch(`${document.location.origin}/api/blocks`)
        .then(response => response.json())
        .then(json => this.setState({ blocks : json}));

    }

    

    render(){
        let  count = -1;
        console.log('this.state' , this.state);
        return (
            <div > 
            <div><Link to='/'>Home</Link></div>
            <h3>Blocks</h3>
            {
                this.state.blocks.map(block => {
                    count += 1;
                    return (
                        <Block key={block.hash} block={block}/> //you pass on the block object to the component
                        
                    )
                })
            }
            </div>
            
        );
    }


}

export default Blocks;





