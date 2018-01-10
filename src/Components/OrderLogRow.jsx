import React, { Component } from 'react';

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
        <select className="form-control" value={this.props.order.Status} 
                onChange={ (e) => this.props.onStatusChange(this.props.order.id, e.target.value)}
                onClick={ (e) => e.stopPropagation() }>
          {
            Constants.statusText.map( (text, index) =>
              <option value={index} key={index}>{text}</option>
            )
          }
        </select>
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

export default OrderLogRow;
