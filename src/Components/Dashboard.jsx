import React, { Component } from 'react';
import Net from '../helpers/net';
import timeago from 'timeago.js';


class App extends Component {

  constructor(props){
    super(props);
    this.socket = props.resolves.socket;
    this.socket.on('connect', this.loadOrders);
    this.socket.on('new-order', this.loadOrders);
    this.socket.on('assign-order', this.loadOrders);
    this.socket.on('update-order', this.loadOrders);

    this.state = {
      orders: []
    }
    this.loadOrders();
  }
  
  componentDidUpdate(){
    timeago().render(document.querySelectorAll('.need_to_be_rendered'));
  }

  loadOrders = () => {
    Net.GetItWithToken('orders/').then( (data) => {
      this.setState({
        orders : data
      })
    });
  }

  render() {
    return (
      <div className="App">
        <table className="table">
          <thead>
            <tr>
              <th scope="col">#</th>
              <th scope="col">Κατάστημα</th>
              <th scope="col">Seen</th>
              <th scope="col">Διεύθυνση</th>
              <th scope="col">Τηλέφωνο</th>
              <th scope="col">Κατάσταση</th>
              <th scope="col">Ώρα</th>
            </tr>
          </thead>
          <tbody>
          {this.state.orders.map((order, index) => 
              <tr key={index}>
                <th scope="row">{order.id}</th>
                <td>{order.ShopName}</td>
                <td>{order.Opened}</td>
                <td>{order.Address}</td>
                <td>{order.Phone}</td>
                <td>{order.Status}</td>
                <td><span className="need_to_be_rendered" dateTime={order.PostDate}></span></td>
              </tr>
          )}
          </tbody>
        </table>
      </div>
    );
  }
}

export default App;
