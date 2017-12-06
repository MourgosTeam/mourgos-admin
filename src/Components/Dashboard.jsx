import React, { Component } from 'react';
import Net from '../helpers/net';
import timeago from 'timeago.js';

import './Dashboard.css';

import Constants from '../helpers/Constants';

class OrderLogRow extends Component {

  toggle = (id) => {
    const text = ".logFor" + id;
    var elems = document.querySelectorAll(text);
    for(var i=0;i < elems.length; i+=1){
      elems[i].style.display = ( elems[i].style.display === 'table-row' ) ? 'none' : 'table-row';
    }
  }

  render() {
    const clickable = this.props.order.logs.length > 0 ? 'pointer' : '';
    return [
    <tr key={0} className={clickable + ' ' + Constants.lineColor[this.props.order.Status]} onClick={() => this.toggle(this.props.order.id)}>
      <th scope="row">{this.props.order.id}</th>
      <td>{this.props.order.ShopName}</td>
      <td>{this.props.order.Address}<br /><small>{this.props.order.Phone}</small></td>
      <td>{Constants.statusText[this.props.order.Status]}</td>
      <td><span className="need_to_be_rendered" dateTime={this.props.order.PostDate}></span></td>
    </tr>,
    this.props.order.logs.map((log,pos) => {
    const temp = 'logFor'+log.EntityID;
    const tt = new Date(log.created_on);
    return <tr key={pos+1} className={`log ${temp}`}>
      <td></td>
      <td>{log.name}<br /><small>{log.phone}</small></td>
      <td></td>
      <td>{log.Value}</td>
      <td><small>{tt.getDate()}/{tt.getMonth()+1}</small> - {tt.getHours()}:{tt.getMinutes()}</td>
    </tr>
    })]
  }  
}

class Dashboard extends Component {

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

  mixLogs = (orders, logs) => {
    for(var i= 0, lo= orders.length; i < lo; i+=1) {
      orders[i].logs = [];
      for(var j= 0, lj= logs.length; j < lj; j+=1) {
        if(logs[j].EntityID === orders[i].id){
          orders[i].logs.push(logs[j]);
        }
      }
    }
    return orders;
  }

  loadOrders = () => {
    Net.GetItWithToken('orders/').then( (data) => {
      this.orders = data;
    }).
    then(() => Net.GetItWithToken('orders/logs')).
    then((logs) => this.mixLogs(this.orders, logs)).
    then((mixedData) => {
      this.setState({
        orders: mixedData
      });
    });
  }

  render() {
    return (
      <div className="App">
        <table className="table table-hover">
          <thead>
            <tr>
              <th scope="col">#</th>
              <th scope="col">Κατάστημα</th>
              <th scope="col">Διεύθυνση</th>
              <th scope="col">Κατάσταση</th>
              <th scope="col">Ώρα</th>
            </tr>
          </thead>
          <tbody>
          {this.state.orders.map((order, index) => 
              <OrderLogRow order={order} key={index}/>
          )}
          </tbody>
        </table>
      </div>
    );
  }
}

export default Dashboard;
