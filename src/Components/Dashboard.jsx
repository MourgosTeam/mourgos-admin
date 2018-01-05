import React, { Component } from 'react';
import Net from '../helpers/net';
import timeago from 'timeago.js';

import './Dashboard.css';

import Constants from '../helpers/Constants';

import DatePicker from 'material-ui/DatePicker';
import TimePicker from 'material-ui/TimePicker';

import 'rc-slider/assets/index.css';
import Slider from 'rc-slider';
import Tooltip from 'rc-tooltip';
const Handle = Slider.Handle;


class OrderLogRow extends Component {
  toggle = (id) => {
    const text = ".logFor" + id;
    var elems = document.querySelectorAll(text);
    for(var i=0;i < elems.length; i+=1){
      elems[i].style.display = ( elems[i].style.display === 'table-row' ) ? 'none' : 'table-row';
    }
  }

  render() {
    const dtime = new Date(this.props.order.PostDate);
    const clickable = this.props.order.logs.length > 0 ? 'pointer' : '';
    let instate = false,fresh,last;
    if (this.props.order.logs[0] && this.props.order.logs[1]) {
      fresh = new Date();
      last = new Date(this.props.order.logs[0].created_on);
      instate = new Date(fresh - last);
      if( instate.getTime() / 1000 < 60 || instate.getTime() / 1000 > 12000 ) {
        instate = false;
      }
    }
    return [
    <tr key={0} className={clickable + ' ' + Constants.lineColor[this.props.order.Status]} onClick={() => this.toggle(this.props.order.id)}>
      <th scope="row">{this.props.order.id}</th>
      <td>{this.props.order.ShopName}<br /><small>{this.props.order.ShopPhone}</small></td>
      <td>{this.props.order.Address}<br /><small>{this.props.order.Name}, {this.props.order.Koudouni}, {this.props.order.Phone}</small></td>
      <td>
        {Constants.statusText[this.props.order.Status]}<br />
        <small>
          {instate && 'for ' + parseInt(instate.getTime() / 1000 / 60, 10) + ' minutes'}
        </small>
      </td>
      <td>
        {this.props.order.Hashtag ? 
          <span>
            Κουπόνι : {this.props.order.Hashtag} <br />
            <small>Έκπτωση : - {parseFloat(this.props.order.HashtagFormula).toFixed(2)}</small>
          </span>
        : ''}
      </td>
      <td>
        {this.props.order.Total} { this.props.order.Extra ? '+ 0.50' : '' } <br />
        <small>Κέρδος: { (this.props.order.Total * Constants.gainMultiplier + this.props.order.Extra * 0.5).toFixed(2) }</small>
      </td>
      <td>
        <span>{dtime.format("HH:mm")}</span><br />
        <span className="need_to_be_rendered" dateTime={this.props.order.PostDate}></span>
      </td>
    </tr>,
    this.props.order.logs.map((log,pos) => {
      const temp = 'logFor'+log.EntityID;
      const tt = new Date(log.created_on);
      let prevLog = pos === 0 ? new Date() : new Date(this.props.order.logs[pos-1].created_on);
      let instate = false;
      if (prevLog) {
        instate = new Date(prevLog - tt);
        if( instate.getTime() / 1000 < 60 || instate.getTime() / 1000 > 12000 ) {
          instate = false;
        }
      }
      return <tr key={pos+1} className={`log table-active ${temp}`}>
        <td></td>
        <td>{log.name}<br /><small>{log.phone}</small></td>
        <td></td>
        <td>
        {log.Value}<br />
        <small>{instate && 'for ' + parseInt(instate.getTime() / 1000 / 60, 10) + ' minutes'}</small>
        </td>
        <td></td>
        <td></td>
        <td><small>{tt.getDate()}/{tt.getMonth()+1}</small> - {tt.format('HH:mm')}</td>
      </tr>
    })]
  }  
}

class CoinCaluclator extends Component {
  constructor(props) {
    super(props);

    this.today = new Date(Date.now());
    this.state = {
      orders: [],
      profits: {},
      shop: -1,
      dates: {
        mindate: new Date(),
        mintime: new Date(),
        maxdate: new Date(),
        maxtime: new Date()
      }
    };
    setTimeout(() => this.setTheDate(-1), 1000);
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
      if ( (!shop || parseInt(shop, 10) === -1 || parseInt(this.props.orders[i].CatalogueId,10) === parseInt(shop, 10) )
          && (!sdate || this.props.orders[i].PostDate > sdate)
          && (!edate || this.props.orders[i].PostDate < edate)) {
        newarr.push(this.props.orders[i]);
      }
    }
    return newarr;
  }

  selectShop = (shop) => {
    const ndates = this.state.dates;
    const mindatetime = new Date(ndates.mindate.getFullYear(), ndates.mindate.getMonth(), ndates.mindate.getDate(), 
                   ndates.mintime.getHours(), ndates.mintime.getMinutes(), ndates.mintime.getSeconds())
                   .toISOString();
    const maxdatetime = new Date(ndates.maxdate.getFullYear(), ndates.maxdate.getMonth(), ndates.maxdate.getDate(), 
                   ndates.maxtime.getHours(), ndates.maxtime.getMinutes(), ndates.maxtime.getSeconds())
                   .toISOString();
    let coll = this.filterCollection(shop, mindatetime, maxdatetime);
    this.setState({
      shop: shop,
      orders: coll
    });
  }

  slide = (value) => {
    var mindatetime = new Date(this.state.dates.mindate.getFullYear(), this.state.dates.mindate.getMonth(), this.state.dates.mindate.getDate(), 
                   this.state.dates.mintime.getHours(), this.state.dates.mintime.getMinutes(), this.state.dates.mintime.getSeconds())
                   .toISOString();
    var maxdatetime = new Date(this.state.dates.maxdate.getFullYear(), this.state.dates.maxdate.getMonth(), this.state.dates.maxdate.getDate(), 
                   this.state.dates.maxtime.getHours(), this.state.dates.maxtime.getMinutes(), this.state.dates.maxtime.getSeconds())
                   .toISOString();
    let calculatorarr = this.filterCollection(this.state.shop, mindatetime, maxdatetime);
    let total = calculateSum(calculatorarr.slice(0, value));
    this.setState({
      profits: total,
      metadata: {}
    });
  }

  handle = (n, p) => {
    let ndates = this.state.dates;
    ndates[n] = p;
    var mindatetime = new Date(ndates.mindate.getFullYear(), ndates.mindate.getMonth(), ndates.mindate.getDate(), 
                   ndates.mintime.getHours(), ndates.mintime.getMinutes(), ndates.mintime.getSeconds())
                   .toISOString();
    var maxdatetime = new Date(ndates.maxdate.getFullYear(), ndates.maxdate.getMonth(), ndates.maxdate.getDate(), 
                   ndates.maxtime.getHours(), ndates.maxtime.getMinutes(), ndates.maxtime.getSeconds())
                   .toISOString();

    let arr = this.filterCollection(this.state.shop, mindatetime, maxdatetime);
    this.setState({
      dates: ndates,
      orders: arr
    });
  }

  setTheDate = (v) => {
    let ndates = this.state.dates;
    ndates['mindate'] = new Date(this.today.getTime());
    ndates['mindate'].setDate(this.today.getDate() + v);
    this.handle('mindate', ndates['mindate']);
  }

  render() {
    return  [<div className="coin-calculator" key="1">
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
              <span> Τζίρος: {this.state.profits.sum} 
               <br />
               <small>
                ( {(1-Constants.gainMultiplier)*100}% -> {this.state.profits.sum * (1 - Constants.gainMultiplier) || 0} 
                | {Constants.gainMultiplier*100}% -> {this.state.profits.sum * Constants.gainMultiplier || 0}) 
               </small>
              <br />Κέρδος: { this.state.profits.netgain }  
              <br />Κουπόνια: {this.state.profits.coupons}</span>
            </div>,
            <div className="coin-calculator" key="2">
              Ημερομηνία και ώρα από: 
              <DatePicker hintText="Min Date" autoOk={true} value={this.state.dates.mindate} onChange={(n,p) => this.handle('mindate', p)}/>
              <TimePicker hintText="Time" autoOk={true} value={this.state.dates.mintime} onChange={(n,p) => this.handle('mintime', p)}/>
              Ημερομηνία και ώρα μέχρι: 
              <DatePicker hintText="Max Date" autoOk={true} value={this.state.dates.maxdate} onChange={(n,p) => this.handle('maxdate', p)}/>
              <TimePicker hintText="Time" autoOk={true} value={this.state.dates.maxtime} onChange={(n,p) => this.handle('maxtime', p)}/>
              <button className="btn btn-sm" onClick={() => this.setTheDate(-1)}>Απο χθές</button>
              <button className="btn btn-sm" onClick={() => this.setTheDate(-7)}>Τελευταία εβδομάδα</button> 
              <button className="btn btn-sm" onClick={() => this.setTheDate(-30)}>30 ημέρες</button> 
            </div>
            ];
  }

}
let calculateSum = (orders) => {
  let sum = 0;
  for(let i=0; i < orders.length; i+=1){
    sum += parseFloat(orders[i].Total);
  }
  let gain = sum * Constants.gainMultiplier;
  for(let i=0; i < orders.length; i+=1){
    gain += Constants.extraCharge * orders[i].Extra;
  }
  let coupons = 0;
  for(let i=0; i < orders.length; i+=1){
    const value = parseFloat(orders[i].Total) + Constants.extraCharge * orders[i].Extra;
    const disc = parseFloat(orders[i].HashtagFormula) || 0;
    coupons += (disc < value) ? disc : value;
  }

  sum  = sum.toFixed(2);
  gain = gain.toFixed(2);
  coupons = coupons.toFixed(2);
  let netgain = gain - coupons;
  netgain = netgain.toFixed(2);
  return {
    coupons,
    gain,
    netgain,
    sum
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
      shops: []
    }

    this.totalValue = {
      sum: 0,
      gain: 0
    }
    this.loadCatalogues();
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
      console.log(data);
      this.setState({
        shops: data
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
        orders: mixedData
      });
    });
  }



  render() {
    return (
      <div className="App">
        <CoinCaluclator orders={this.state.orders} shops={this.state.shops} />
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

export default Dashboard;
