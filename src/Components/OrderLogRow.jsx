import React, { Component } from 'react';

import './Dashboard.css';

import Net from '../helpers/net';
import Constants from '../helpers/Constants';

class LogRows extends Component {

  render() {
    const active = this.props.active === 1 ? 'showLog' : 'hideLog';
    let result = 
      this.props.logs.map((log,pos) => {
      const temp = 'logFor'+log.EntityID;
      const tt = new Date(log.created_on);
      let prevLog = pos === 0 ? new Date() : new Date(this.props.logs[pos-1].created_on);
      let instate = false;
      if (prevLog) {
        instate = new Date(prevLog - tt);
        if( instate.getTime() / 1000 < 60 || instate.getTime() / 1000 > 12000 ) {
          instate = false;
        }
      }
      return <tr key={pos+1} className={`log table-active ${temp} ${active}`}>
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
    });
    return result;
  }
}

class OrderLogRow extends Component {

  constructor(props) {
    super(props);

    this.state = {
      openLogs: 0
    };
  }

  componentDidMount() {
    this.link.addEventListener('click', (e) => {
      e.stopPropagation();
      return false;
    });
  }

  toggle = (id) => {
    let nlogs = this.state.openLogs === 1 ? 0 : 1;
    this.setState({
      openLogs: nlogs
    });
  }

  deleted(id) {
    if(window.confirm("Are you sure?")) {
      Net.DeleteItWithToken('orders/'+id);
    }
  }

  render() {
    const BASEURL = "http://"+window.location.hostname + '/readytoeat/';

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
      <th scope="row"><a href={BASEURL + this.props.order.id} ref={(input) => { this.link = input; }} target="_new">{this.props.order.id}</a></th>
      <td>{this.props.order.ShopName}<br /><small>{this.props.order.ShopPhone}</small></td>
      <td>{this.props.order.Address}<br /><small>{this.props.order.Name}, {this.props.order.Koudouni}, {this.props.order.Phone}</small></td>
      <td class="row">
        <select className="form-control col-9" value={this.props.order.Status} 
                onChange={ (e) => this.props.onStatusChange(this.props.order.id, e.target.value)}
                onClick={ (e) => e.stopPropagation() }>
          {
            Constants.statusText.map( (text, index) =>
              <option value={index} key={index}>{text}</option>
            )
          }
        </select>
        <button className="btn btn-sm btn-danger col-3" onClick={(e) => {e.stopPropagation();this.deleted(this.props.order.id)}}>Delete</button>
        <small>
          {instate && 'for ' + parseInt(instate.getTime() / 1000 / 60, 10) + ' minutes'}
        </small>
      </td>
      <td>
        {this.props.order.Hashtag ? 
          <span>
            Κουπόνι : {this.props.order.Hashtag} <br />
            <small>Έκπτωση : - { parseInt(this.props.order.HashtagFormula, 10) === 100 ?
             ((parseFloat(this.props.order.HashtagFormula) - 100) * (parseFloat(this.props.order.Total) + this.props.order.Extra * Constants.extraCharge)).toFixed(2) :
               parseFloat(this.props.order.HashtagFormula).toFixed(2)}
            </small>
          </span>
        : ''}
      </td>
      <td>
        { this.props.order.FinalPrice.toFixed(2) } <br />
        { this.props.order.ShopName !== 'Ψιλικά' &&
          [
          <small key={1}>{this.props.order.Total} { this.props.order.Extra ? '+ 0.50' : '' }</small>,
           <br key={2}/>,
          <small key={3}>Κέρδος: { (this.props.order.Total * Constants.gainMultiplier + this.props.order.Extra * Constants.extraCharge).toFixed(2) }</small>
          ]
        }
      </td>
      <td>
        <span>{dtime.format("HH:mm")}</span><br />
        <span>{dtime.format("dd/MM")}</span>
      </td>
    </tr>,
    <LogRows key={1312} logs={this.props.order.logs} active={this.state.openLogs}/>
    ]
  }  
}

export default OrderLogRow;
