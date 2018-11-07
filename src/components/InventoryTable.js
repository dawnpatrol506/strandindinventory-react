import React from 'react';
import { Row, Button, Icon, Modal, Input } from 'react-materialize';
import firebase from 'firebase/app';
import 'firebase/database';
import Container from 'react-materialize/lib/Container';

firebase.initializeApp({
    "apiKey": "AIzaSyD2CbEExz1gA7rxIviKjncl9Rpw03WpbXY",
    "databaseURL": "https://strandindinventory.firebaseio.com",
    "storageBucket": "strandindinventory.appspot.com",
    "authDomain": "strandindinventory.firebaseapp.com",
    "messagingSenderId": "854079353246",
    "projectId": "strandindinventory"
});

let db = firebase.database();


function TableRow(props) {
    return (
        <tr onClick={props.onClick} value={props.partId}>
            <td>{props.partName}</td>
            <td>{props.partQty}</td>
        </tr>
    );
};

function CheckModal(props) {
    return (
        <Modal
            header="Check Inventory"
            trigger={
                <Button waves='light' className="green black-text" style={{ display: 'inline', float: 'left', margin: '0px 5px' }}>
                    <Icon>check</Icon>
                </Button>
            }>
            <p>Test</p>
        </Modal>
    )
}

function AlertToggle(props) {
    return (
        <Button waves='light' className='orange black-text' style={{ display: 'inline', float: 'left', margin: '0px 5px' }}>
            <Icon>priority_high</Icon>
        </Button>
    )
}

function CloseRowHelper(props) {
    return (
        <Button waves='light' className='red black-text' style={{ display: 'inline', float: 'left', margin: '0px 5px' }} onClick={props.onClick}>
            <Icon>close</Icon>
        </Button>
    );
}

function SalesDisplay(props) {
    return (
        <p>
            <span className='red-text' style={{ fontSize: '1.8em', fontWeight: 'bold' }}>{props.today} </span>
            <span className='blue-text' style={{ fontSize: '1.8em', fontWeight: 'bold' }}>{props.thisWeek} </span>
            <span className='green-text' style={{ fontSize: '1.8em', fontWeight: 'bold' }}>{props.lastWeek} </span>
        </p>
    )
}

function RowHelper(props) {
    return (
        <tr>

            <td>
                <CheckModal />
                <AlertToggle />
                <CloseRowHelper 
                    onClick={props.closeButtonHandler}
                />
            </td>
            <td>
                <SalesDisplay
                    today={props.today}
                    thisWeek={props.thisWeek}
                    lastWeek={props.lastWeek}
                />
            </td>
        </tr>
    );
}

function ColorSelector(props) {
    return (
        <Input s={12} type='select' label='Color Selection' defaultValue='BLACK' onChange={props.onChange}>
            {props.colors.map(color => {
                return (<option key={color} value={color}>{color}</option>)
            })}
        </Input>
    );
}

class InventoryTable extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            rows: [],
            itemsIdArray: [],
            colors: [
                'BLACK',
                'WHITE',
                'BLUE',
                'ORANGE',
                'RED',
                'LIME',
                'GRAY',
                'CLEAR',
                'TINTED',
                'BLACK WRINKLE',
                'BLACK TEXTURE'
            ],
            currentColor: 'BLACK',
            currentRowIndex: 0,
        };
    }

    getItemIdArray = (color, callback) => {
        let ItemIdArray = [];
        db.ref('/master_lookup').once('value', snap => {
            for (const id in snap.val()) {
                const colors = snap.val()[id].colors.split(', ');
                if (colors.indexOf(color) !== -1) {
                    ItemIdArray.push({
                        id: id,
                        name: snap.val()[id].name
                    });
                }
            }
            this.setState({ItemIdArray});
            callback(ItemIdArray);
        })
    }

    populateRowsObjects = (ItemIdArray, color, callback) => {
        let newRowsArray = [];
        db.ref('/inventory').once('value', snap => {
            const keysArray = Object.keys(snap.val());
            ItemIdArray.forEach(obj => {
                let count = 0;
                if (keysArray.indexOf(obj.id) !== -1) {
                    if (obj.id !== 'bi' && snap.val()[obj.id][color] !== undefined) {
                        const items = snap.val()[obj.id][color];
                        for(const item in items){
                            if(items[item].status.trim().toUpperCase() === 'ACTIVE'){
                                count++;
                            }
                        }
                    }
                }
                newRowsArray.push({
                    id: obj.id,
                    name: obj.name,
                    count
                })
            })
            callback(newRowsArray);
        })
    }

    componentWillMount = () => {
        this.getItemIdArray(this.state.currentColor, ItemIdArray => {
            this.populateRowsObjects(ItemIdArray, this.state.currentColor, (newRowsArray) => {
                this.setState({ rows: newRowsArray });
            })
        })
    }

    componentDidMount = () => {
        db.ref('/inventory').on('value', () => {
            this.populateRowsObjects(this.state.ItemIdArray, this.state.currentColor, newRowsArray => {
                this.setState({rows: newRowsArray});
            })
        })
    }

    componentWillUnmount = () => {
        db.ref('/inventory').off();
    }

    selectChangeHandler = (event) => {
        this.setState({ currentColor: event.target.value });
        this.getItemIdArray(this.state.currentColor, ItemIdArray => {
            this.populateRowsObjects(ItemIdArray, this.state.currentColor, (newRowsArray) => {
                this.setState({ rows: newRowsArray });
            })
        })

    }

    rowClickHandler = (event) => {
        let newRows = this.state.rows;
        let existsHelperRow = 0;
        newRows.forEach(row => {
            if (row.id === 'rowHelper')
                existsHelperRow = newRows.indexOf(row);
        })

        if (existsHelperRow) {
            newRows.splice(existsHelperRow, 1);
        }

        newRows.forEach(row => {
            if (row.name === event.target.innerHTML) {
                const index = newRows.indexOf(row);
                this.setState({ currentRowIndex: index }, () => {
                    newRows.splice(index + 1, 0, { id: 'rowHelper' });
                    this.setState({ rows: newRows });
                });
            }
        })
    }

    closeButtonHandler = (event) => {
        let newRows = this.state.rows;

        newRows.forEach(row => {
            if(row.id === 'rowHelper'){
                newRows.splice(newRows.indexOf(row), 1);
                this.setState({rows: newRows}, () => {
                    return;
                })
            }
        })
    }

    render() {
        return (
            <Container>
                <Row>
                    <h1>Current Inventory</h1>
                </Row>
                <Row>
                    <ColorSelector
                        colors={this.state.colors}
                        onChange={this.selectChangeHandler}
                    />
                </Row>
                <Row>
                    <table>
                        <thead>
                            <tr>
                                <th>Part</th>
                                <th>Quantity</th>
                            </tr>
                        </thead>
                        <tbody>
                            {this.state.rows.map(row => {
                                if (row.id === 'rowHelper') {
                                    return (
                                        <RowHelper
                                            key='rowHelper'
                                            closeButtonHandler={this.closeButtonHandler}
                                        />
                                    );
                                }
                                else {
                                    return (
                                        <TableRow
                                            onClick={this.rowClickHandler}
                                            key={row.id}
                                            partKey={row.id}
                                            partName={row.name}
                                            partQty={row.count}
                                        />
                                    );
                                }
                            })}
                        </tbody>
                    </table>
                </Row >
            </Container>
        );
    }
}

export default InventoryTable;