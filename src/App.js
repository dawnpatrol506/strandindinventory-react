import React from 'react';
import InventoryTable from './components/InventoryTable';
import TopNav from './components/NavBar';

class App extends React.Component {
    render() {
        return (
            <div>
                <TopNav />
                <InventoryTable />
            </div>
        )
    }
}

export default App;