import React, { Component } from 'react';
import Net from '../helpers/net';
import './Summaries.css';

import Constants from '../helpers/Constants';

import DatePicker from 'material-ui/DatePicker';

class Summaries extends Component {

  constructor(props){
    super(props);
    this.state = {
      orders: [],
      courier: [],
      shops: [],
      filters: {
        shop: -1,
        delivery: -1
      },
      day: 0,
      profits: {
        total: 0,
        gain: 0,
        courier: 0,
        shops: 0,
        coupons: 0
      }
    }
    this.loadOrders();
    this.loadCatalogues();
    this.loadCouriers();
  }

  calculateProfits(orders) {
    var total   = 0,
        gain    = 0,
        courier = 0,
        extras  = 0,
        coupons = 0,
        shops   = 0;

    for ( var i = 0; i < orders.length; i+= 1) {
      const item = orders[i];
      const price = parseFloat(item.Total);
      const extra = item.Extra * Constants.extraCharge;
      const value = price + extra;
      const disc = (parseInt(item.HashtagFormula, 10) === 100) ? (parseFloat(item.HashtagFormula) - 100) * value : parseFloat(item.HashtagFormula) || 0;
      const coupon = (disc < value) ? disc : value; // coupon 
      total  += value;
      shops  += price;
      extras += extra;
      coupons+= coupon;
    }

    gain = Constants.gainMultiplier * shops + extras;
    courier = total - coupons;

    const shopsPart = shops*(1-Constants.gainMultiplier);
    return {
      total: parseFloat(total.toFixed(2)),
      gain: parseFloat(gain.toFixed(2)),
      courier: parseFloat(courier.toFixed(2)),
      shops: parseFloat(shopsPart.toFixed(2)),
      coupons: parseFloat(coupons.toFixed(2))
    }
  }

  calculatePrices(orders, d, filters) {
    const today = new Date();
    today.setDate(today.getDate() + d);

    const compare = today.toISOString().split('T')[0];
    const batch = [];
    for ( var i = 0; i < orders.length; i+= 1) {
      const str = orders[i].PostDate.split('T')[0];
      const shopName = orders[i].CatalogueId;
      const delivery = orders[i].DeliveryID;
      if (str === compare) { // date spec
        if( (shopName === parseInt(filters.shop, 10)     || parseInt(filters.shop, 10) === -1)    &&
            (delivery === parseInt(filters.delivery, 10) || parseInt(filters.delivery, 10) === -1)) {
          batch.push(orders[i]);
        }
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
  
  exactDate = (dt) => {
    const date1 = new Date();
    const date2 = new Date(dt);
    var timeDiff = Math.abs(date2.getTime() - date1.getTime());
    var diffDays = Math.floor(timeDiff / (1000 * 3600 * 24)); 

    this.calculatePrices(this.state.orders, -diffDays, this.state.filters);

    this.setState({
      exactDate: dt,
      day: -diffDays
    });
  }
  relativeDate = (d) => {
    this.calculatePrices(this.state.orders, d, this.state.filters);
    this.setState({
      day: d
    });
  }

  filter = (obj) => {
    const filters = {
      ...this.state.filters,
      ...obj
    };

    this.calculatePrices(this.state.orders, this.state.day, filters);
    this.setState({filters});
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
            <b>Κατάστημα</b>
            <select className="form-control" onChange={(e) => this.filter({ shop: e.target.value})}>
              <option key={-1} value={-1}>Όλα</option>
              {this.state.shops.map((shop, index) => 
                <option key={index} value={shop.id}>{shop.Name}</option>
              )}
            </select>
          </div>
          <div className="col">
            <b>Ντελιβεράς</b>
            <select className="form-control" onChange={(e) => this.filter({ delivery: e.target.value})}>
              <option key={-1} value={-1}>Όλοι</option>
              {this.state.courier.map((courier, index) => 
                <option key={index} value={courier.id}>{courier.name}</option>
              )}
            </select>
          </div>
        </div>
        <div className="row">
          <div className="col col-md-2">
            <button className="btn btn-small btn-secondary" onClick={() => this.relativeDate(0)}>Σήμερα</button>
          </div>
          <div className="col col-md-2">
            <button className="btn btn-small btn-secondary" onClick={() => this.relativeDate(-1)}>Χθές</button>
          </div>
          <div className="col col-md-2">
            <button className="btn btn-small btn-secondary" onClick={() => this.relativeDate(-2)}>Προχθές</button>
          </div>

          <div className="col col-md-4">
            <DatePicker hintText="Ακριβή ημερομηνία" autoOk={false} value={this.state.exactDate} onChange={(n,p) => this.exactDate(p)}/>
          </div>
        </div>
        <div className="row">
          <div className="col-6 results">
            <div className="row">
              <b>Κέρδος:</b>
              {this.state.profits.gain}
            </div>
            <div className="row">
              <b>Κούριερ:</b>
              {this.state.profits.courier}
            </div>
            <div className="row">
              <b>Μαγαζί:</b>
              {this.state.profits.shops}
            </div>
          </div>
          <div className="col-6 results">
            <div className="row">
              <b>Κουπόνια:</b>
              {this.state.profits.coupons}
            </div>
            <div className="row">
              <b>xxxx:</b>
              {}
            </div>
            <div className="row">
              <b>xxx:</b>
              {}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Summaries;