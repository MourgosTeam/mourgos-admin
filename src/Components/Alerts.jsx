import React, { Component } from 'react';
import Net from '../helpers/net';
import timeago from 'timeago.js';

import './Dashboard.css';

import Constants from '../helpers/Constants';

import OrderLogRow from './OrderLogRow.jsx'

class Alerts extends Component {

  constructor(props){
    super(props);
    this.socket = props.resolves.socket;
    this.socket.on('connect', () => this.loadOrders());
    this.socket.on('new-order', () => this.loadOrders());
    this.socket.on('assign-order', () => this.loadOrders());
    this.socket.on('update-order', () => this.loadOrders());

    this.now = new Date(Date.now());

    this.state = {
      orders: [],
      filtered: [],
      shops: [],
      couriers: []
    }

    this.totalValue = {
      sum: 0,
      gain: 0
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

  filterStatusLogs = (data) => {
    let narr = [];
    for (let i=0; i < data.length ; i+=1) {
      if(data[i].Value.includes("StatusChange"))
        narr.push(data[i]);
    }
    return narr;
  }

  findAlerts = (data) => {

    let alerts = [];
    for (let i=0; i < data.length ; i+=1) {
      if(parseInt(data[i].Status, 10) === 10 || parseInt(data[i].Status, 10) === 99)continue;

      let logs = data[i].logs;
      let statusLogs = this.filterStatusLogs(logs); 
      
      if (statusLogs.length === 0) {
        let ltime = new Date(data[i].PostDate);
        let elapsed = Date.now() - ltime.getTime();
        let minutes = elapsed/1000/60;
        if (minutes > Constants.alertDelay) {
          alerts.push(data[i]);
        }        
      }
      else {
        let ltime = new Date(statusLogs[0].created_on);
        let elapsed = Date.now() - ltime.getTime();   
        let minutes = elapsed/1000/60;
        if (minutes > Constants.alertDelay) {
          alerts.push(data[i]);
        }        
      }
    }
    return alerts;
  }

  loadOrders = () => {
    Net.GetItWithToken('orders/').then( (data) => {
      this.orders = data;
      //this.totalValue = calculateSum(this.orders);
    })
    .then(() => Net.GetItWithToken('orders/logs/'))
    .then((logs) => this.mixLogs(this.orders, logs))
    .then((data) => this.findAlerts(data))
    .then((mixedData) => {
      this.setState({
        orders: mixedData
      });
    });
  }

  onFilteredData = (data) => {
    this.setState({
      filtered: data
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
              <th scope="col">Κουπόνι</th>
              <th scope="col">
                Κόστος/Κέρδος
                <br />
                <small>{this.totalValue.sum} / {this.totalValue.gain}</small>
              </th>
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

export default Alerts;
