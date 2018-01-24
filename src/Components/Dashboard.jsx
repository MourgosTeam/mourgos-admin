import React, { Component } from 'react';
import Net from '../helpers/net';
import timeago from 'timeago.js';

import './Dashboard.css';

import OrderLogRow from './OrderLogRow.jsx'

import Constants from '../helpers/Constants';

import DatePicker from 'material-ui/DatePicker';
import TimePicker from 'material-ui/TimePicker';

import Hash from 'object-hash';

import 'rc-slider/assets/index.css';
import Slider from 'rc-slider';
import Tooltip from 'rc-tooltip';
const Handle = Slider.Handle;

class CoinCalculator extends Component {
  constructor(props) {
    super(props);

    this.today = new Date(Date.now());
    this.tomorrow = new Date(this.today.getTime());
    this.tomorrow.setDate(this.today.getDate() + 1);
    this.state = {
      orders: [],
      profits: {},
      filters: {
        mindate: new Date(),
        mintime: new Date(),
        maxdate: this.tomorrow,
        maxtime: this.tomorrow,
        shop: -1,
        courier: -1,
        slider: 0
      }
    };
    setTimeout(() => this.setTheDate(-1), 1000);
    this.forceUpdate = false;
  }

  // Custom setFilters used in the same way as setState but under state.filters
  setFilters = (obj) => {
    let filters = this.state.filters || {};
    Object.assign(filters, obj);
    this.setState({
      filters: filters
    });
  }

  componentDidUpdate() {
    this.updateCarefully();
  }

  updateCarefully = (force) => { 
    let filters = this.state.filters;
    let hash = Hash(filters);
    // Catch loop
    if(this.filtering === hash && this.props.nonce === this.nonce)return;
    this.filtering = hash;
    this.nonce = this.props.nonce;

    const ndates = filters;
    const mindatetime = new Date(ndates.mindate.getFullYear(), ndates.mindate.getMonth(), ndates.mindate.getDate(), 
                   ndates.mintime.getHours(), ndates.mintime.getMinutes(), ndates.mintime.getSeconds())
                   .toISOString();
    const maxdatetime = new Date(ndates.maxdate.getFullYear(), ndates.maxdate.getMonth(), ndates.maxdate.getDate(), 
                   ndates.maxtime.getHours(), ndates.maxtime.getMinutes(), ndates.maxtime.getSeconds())
                   .toISOString();
    let coll = this.filterCollection(filters.shop, mindatetime, maxdatetime);
    let arr = coll.slice(0, filters.slider);
    let total = calculateSum(arr, filters.courier);

    // Event onFilteredData
    if (filters.fireEvents)
      this.props.onFilteredData(arr);
    else
      this.props.onFilteredData(this.props.orders);

    this.setState({
      orders: coll,
      profits: total
    });
  }
  
  handleSlider = (props) => {
    const { value, dragging, index, ...restProps } = props;
    let order = this.state.orders[value-1];
    let temp = value-1;
    if(order) {
      const dt = new Date(order.PostDate);
      temp = dt.format("dd/MM HH:mm");
    }
    return (
      <Tooltip
        prefixCls="rc-slider-tooltip"
        overlay={temp}
        visible={dragging}
        placement="top"
        key={index}
      >
        <Handle value={value} {...restProps} />
      </Tooltip>
    );
  }

  filterCollection = (shop, sdate, edate) => {
    let newarr = [];
    for (let i=0; i < this.props.orders.length; i = i + 1) {
      if (   (!shop || parseInt(shop, 10) === -1 || parseInt(this.props.orders[i].CatalogueId,10) === parseInt(shop, 10) )
          && (!sdate || this.props.orders[i].PostDate > sdate)
          && (!edate || this.props.orders[i].PostDate < edate)) {
        newarr.push(this.props.orders[i]);
      }
    }
    return newarr;
  }
  selectShop = (shop) => {
    this.setFilters({
      shop: shop
    });
  }
  selectCourier = (courier) => {
    this.setFilters({
      courier: courier
    });
  }
  slide = (value) => {
    this.setFilters({
      slider: value
    });
  }
  handle = (n, p) => {
    this.setFilters({
      [n]: p
    });
  }

  setTheDate = (v) => {
    let ndates = this.state.filters;
    ndates['mindate'] = new Date(this.today.getTime());
    ndates['mindate'].setDate(this.today.getDate() + v);
    this.setFilters({
      mindate: ndates['mindate']
    });
  }
  
  toggleFireEvents = () => {
    this.setFilters({
      fireEvents: !this.state.filters.fireEvents,
      slider: this.state.orders.length
    });
  }

  render() {
    return  [<div className="coin-calculator" key="1">
              <button className="update-btn btn btn-secondary" onClick={() => this.toggleFireEvents()}>{this.state.filters.fireEvents ? 'Free List' : 'Update List'}</button>
              <Slider min={0} max={this.state.orders.length}
                      handle={this.handleSlider} onChange={(v) => this.slide(v)}/>
              <select className="form-control" defaultValue={-1} onChange={ (e) => this.selectShop(e.target.value) }>
                <option value={-1}>All</option>
                {
                  this.props.shops.map( (shop) =>
                    <option value={shop.id} key={shop.id}>{shop.Name}</option>
                  )
                }
              </select>
              <select className="form-control" onChange={ (e) => this.selectCourier(e.target.value) }>
                {
                  this.props.couriers.map( (courier) =>
                    <option value={courier.id} key={courier.id}>{courier.name}</option>
                  )
                }
              </select>
              <span> Τζίρος: {this.state.profits.sum} + {this.state.profits.extras}
               <br />
               <small>
                ( {(1-Constants.gainMultiplier)*100}% -> {(this.state.profits.sum * (1 - Constants.gainMultiplier)).toFixed(2) || 0} 
                | {Constants.gainMultiplier*100}% -> {(this.state.profits.sum * Constants.gainMultiplier).toFixed(2) || 0}) 
               </small>
              <br />Κέρδος: { this.state.profits.netgain }  
              <br />Κουπόνια: {this.state.profits.coupons}
              <br />Courier: {this.state.profits.courier}</span>
            </div>,
            <div className="coin-calculator" key="2">
              Ημερομηνία και ώρα από: 
              <DatePicker hintText="Min Date" autoOk={true} value={this.state.filters.mindate} onChange={(n,p) => this.handle('mindate', p)}/>
              <TimePicker hintText="Time" autoOk={true} value={this.state.filters.mintime} onChange={(n,p) => this.handle('mintime', p)}/>
              Ημερομηνία και ώρα μέχρι: 
              <DatePicker hintText="Max Date" autoOk={true} value={this.state.filters.maxdate} onChange={(n,p) => this.handle('maxdate', p)}/>
              <TimePicker hintText="Time" autoOk={true} value={this.state.filters.maxtime} onChange={(n,p) => this.handle('maxtime', p)}/>
              <button className="btn btn-sm" onClick={() => this.setTheDate(-1)}>Απο χθές</button>
              <button className="btn btn-sm" onClick={() => this.setTheDate(-7)}>Τελευταία εβδομάδα</button> 
              <button className="btn btn-sm" onClick={() => this.setTheDate(-30)}>30 ημέρες</button> 
            </div>
            ];
  }

}
let calculateSum = (orders, courierID) => {
  let sum = 0;
  let coupons = 0;
  let gain = 0;
  let courier = 0;
  let extras = 0;
  for (let i=0; i < orders.length; i+=1) {
    if (parseInt(orders[i].Status, 10) !== 10) continue;
    const tsum = parseFloat(orders[i].Total);
    const tgain = Constants.extraCharge * orders[i].Extra;
    const value = tsum + tgain;
    const disc = (parseInt(orders[i].HashtagFormula, 10) === 100) ? (parseFloat(orders[i].HashtagFormula) - 100) * value : parseFloat(orders[i].HashtagFormula) || 0;
    const coupon = (disc < value) ? disc : value;
    
    extras += tgain;
    sum += tsum;
    gain += tgain;
    coupons += coupon;
    if (parseInt(orders[i].DeliveryID,10) === parseInt(courierID,10)) {
      courier += value - coupon;
    }
  }

  extras = extras.toFixed(2);
  gain = (sum * Constants.gainMultiplier + gain).toFixed(2);
  sum  = sum.toFixed(2);
  coupons = coupons.toFixed(2);
  let netgain = gain - coupons;
  netgain = netgain.toFixed(2);
  courier = courier.toFixed(2);
  return {
    coupons,
    extras,
    gain,
    netgain,
    sum,
    courier
  };
}
class Dashboard extends Component {

  constructor(props){
    super(props);
    this.socket = props.resolves.socket;
    this.socket.on('connect', () => this.loadOrders());
    this.socket.on('new-order', () => this.loadOrders());
    this.socket.on('assign-order', () => this.loadOrders());
    this.socket.on('update-order', () => this.loadOrders());

    this.state = {
      orders: [],
      filtered: [],
      shops: [],
      couriers: [],
      nonce: 0
    }

    this.totalValue = {
      sum: 0,
      gain: 0
    }
    this.loadCatalogues();
    this.loadCouriers();
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
        couriers: data
      })
    });
  }

  loadOrders = () => {
    Net.GetItWithToken('orders/').then( (data) => {
      this.orders = data;
      this.totalValue = calculateSum(this.orders);
    })
    .then(() => Net.GetItWithToken('orders/logs/'))
    .then((logs) => this.mixLogs(this.orders, logs))
    .then((mixedData) => {
      this.setState({
        orders: mixedData,
        nonce: (this.state.nonce + 1)
      });
    });
  }

  onFilteredData = (data) => {
    this.setState({
      filtered: data
    });
  }

  onStatusChange = (orderid, status) => {
    Net.PostItWithToken('orders/'+orderid, {statusCode: status})
    .then(() => this.loadOrders());
  }

  render() {
    return (
      <div className="App">
        <CoinCalculator orders={this.state.orders} shops={this.state.shops} couriers={this.state.couriers} 
                        onFilteredData={this.onFilteredData} nonce={this.state.nonce}/>
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
          {this.state.filtered.map((order, index) => 
              <OrderLogRow order={order} key={index}  onStatusChange={this.onStatusChange}/>
          )}
          </tbody>
        </table>
      </div>
    );
  }
}

export default Dashboard;
