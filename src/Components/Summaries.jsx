import React, { Component } from 'react';
import Net from '../helpers/net';
import './Summaries.css';

import Constants from '../helpers/Constants';

class Summaries extends Component {

  constructor(props){
    super(props);
    this.state = {
      orders: [],
      courier: [],
      shops: [],
      day: 0,
      profits: {
        gain: 0
      }
    }
    this.loadOrders();
    this.loadCatalogues();
    this.loadCouriers();
  }

  calculateProfits(orders) {
    var total   = 0;
    var gain    = 0;
    var courier = 0;

    for ( var i = 0; i < orders.length; i+= 1) {
      const item = orders[i];
      total += item.Total;
      const value = item.Total + Constants.extraCharge * item.Extra;
      const disc = (parseInt(item.HashtagFormula, 10) === 100) ? (parseFloat(item.HashtagFormula) - 100) * value : parseFloat(item.HashtagFormula) || 0;
      const coupon = (disc < value) ? disc : value; // coupon 

    }
    return {
      total,
      gain,
      courier
    }
  }

  calculatePrices(orders, d) {
    const today = new Date();
    today.setDate(today.getDate() + d);

    const compare = today.toISOString().split('T')[0];
    const batch = [];
    for ( var i = 0; i < orders.length; i+= 1) {
      const str = orders.PostDate.split('T')[0];
      if (str === compare) {
        batch.push(orders[i]);
      }
    }
    const profits = this.calculateProfits(batch);
    this.setState({
      profits
    });

    return;
  }

  loadOrders = () => {
    return Net.GetItWithToken('orders').then( (data) => 
      this.setState({
        orders: data
      })
    );
  }
  loadCatalogues = () => {
    Net.GetItWithToken('catalogues/').then( (data) => {
      this.setState({
        shops: data
      })
    });
  }
  loadCouriers = () => {
    Net.GetItWithToken('admin/couriers/').then( (data) => {
      this.setState({
        courier: data
      })
    });
  }
  
  render() {
    return (
      <div className="container">
        <div className="row tools">
          <div className="col">

          </div>
          <div className="col">

          </div>
        </div>
        <div className="row board">
          <div className="col">
            <select onChange={(e) => this.setState({ shop: e.target.value})}>
              {this.state.shops.map((shop, index) => 
                <option key={index}>{shop.Name}</option>
              )}
            </select>
          </div>
          <div className="col">
            <select onChange={(e) => this.setState({ delivery: e.target.value})}>
              {this.state.courier.map((courier, index) => 
                <option key={index}>{courier.name}</option>
              )}
            </select>
          </div>
        </div>
        <div className="row">
          <div>
            <button onClick={() => this.setState({day: 0 })}>Σήμερα</button>
            <button onClick={() => this.setState({day: -1})}>Χθές</button>
            <button onClick={() => this.setState({day: -2})}>Προχθές</button>
          </div>
        </div>
        <div className="row">
          <div>
            { 
            //datepicker 
            }
          </div>
        </div>
        <div className="row">
          <div className="col-6">
            <div className="row">
              Κέρδος:
              {this.state.profits.gain}
            </div>
            <div className="row">
              Κούριερ:
              {this.state.profits.gain}
            </div>
            <div className="row">
              Μαγαζί:
              {this.state.profits.gain}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Summaries;