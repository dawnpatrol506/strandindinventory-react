import React from 'react';
import { Navbar, NavItem, Modal, Input, Button} from 'react-materialize';

class TopNav extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    render() {
        return (
            <Navbar brand='Inventory' right className='black white-text'>
                <NavItem>
                    <Modal
                        header='Add Inventory'
                        trigger={<div>Add</div>}>
                        <Input placeholder='Barcode' s={12} />
                    </Modal>
                </NavItem>
                <NavItem href='components.html'>Components</NavItem>
            </Navbar>
        );
    }
}

export default TopNav;