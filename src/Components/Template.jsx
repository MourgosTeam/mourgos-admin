import React, { Component } from 'react';
import Net from '../helpers/net';

import './Template.css';

import {UIView} from '@uirouter/react';

class Template extends Component {

  constructor(props) {
    super(props);

    this.state = {
      isSiteOpen: false,
      isSiteProblem: false,
      workingHours: '',
      fvalue: '',
      tvalue: ''
    };


    Net.GetItWithToken('globals/MourgosWorkingHours').then((data) => {
      const value = data.Value;
      const arr = value.split('-');
      this.setState({
        workingHours: value,
        fvalue: arr[0],
        tvalue: arr[1]
      });
    });

    Net.GetItWithToken('globals/MourgosIsLive').then((data) => {
      this.setState({
        isSiteOpen: data.Value === "1"
      })
    });
    Net.GetItWithToken('globals/MourgosHasProblem').then((data) => {
      this.setState({
        isSiteProblem: data.Value === "1"
      })
    });
  }

  goTo = (stateName) => {
    this.props.resolves.$transition$.router.stateService.go(stateName);
  }

  logout = () => {
    Net.clearToken();
    this.goTo('login');
  }

  toggleSite = (e) => {
    const target = e.target;
    const value = target.checked;

    let uri = "";
    if(value === true){
      uri = "open";
    }
    else{
      uri = "close";
    }
    document.getElementById('siteStatus').disabled = true;
    Net.GetItWithToken('admin/site/'+uri).then( (data) => {
      let isOpen = data;
      return isOpen === true ? true : false;
    })
    .then((open) => {
      document.getElementById('siteStatus').disabled = false;
      this.setState({
        isSiteOpen: open 
      });
    });
  }
  toggleSiteProblem = (e) => {
    const target = e.target;
    const value = target.checked;

    let v = 0;
    if(value === true){
      v = 1;
    }
    else{
      v = 0;
    }
    document.getElementById('siteProblem').disabled = true;
    Net.PostItWithToken('admin/site/problem', {value: v}).then((data) => v === 1)
    .then((open) => {
      document.getElementById('siteProblem').disabled = false;
      this.setState({
        isSiteProblem: open
      });
    });
  }

  updateWH = () => {
    const fWH = this.state.fvalue;
    const tWH = this.state.tvalue;
    Net.PostItWithToken('globals/change/workingHours', { value: fWH+"-"+tWH }).
    then(() => {
      window.location.href = window.location.href;
    });
  }

  render() {
    const whours = this.state.workingHours.split("-");
    return (
      <div>
        <ul className="nav">
          <li className="nav-item">
            <span className="nav-link active" onClick={ () => this.goTo('home.dashboard')}>All Orders</span>
          </li>
          <li className="nav-item">
            <span className="nav-link" onClick={ () => this.goTo('home.alerts')}>Alerts</span>
          </li>
          <li className="nav-item">
            <span className="nav-link" onClick={ () => this.goTo('home.campaigns')}>Campaigns</span>
          </li>
          <li className="nav-item">
            <span className="nav-link" onClick={ () => this.goTo('home.map')}>Χάρτης</span>
          </li>
          <li className="nav-item">
            <span className="nav-link" onClick={ () => this.goTo('home.import')}>Import</span>
          </li>
          <li className="nav-item">
            <span className="nav-link" onClick={ () => this.goTo('home.users')}>Users</span>
          </li>
          <li className="nav-item">
            <span className="nav-link" onClick={this.logout}>Logout</span>
          </li>
          <li style={{padding: 8}} className="nav-item">
            <label className="custom-control custom-checkbox mb-2 mr-sm-2 mb-sm-0">
              <input type="checkbox" 
                     className="custom-control-input"
                     onChange={this.toggleSite}
                     id="siteStatus"
                     checked={this.state.isSiteOpen}
                     value={this.state.isSiteOpen ? 'on' : 'off'} />
              <span className="custom-control-indicator"></span>
              <span className="custom-control-description">{this.state.isSiteOpen ? 'Μόνιμα ανοιχτός':'Ωράριο'}!</span>
            </label>
          </li>
          <li style={{padding: 8}} className="nav-item">
            <label className="custom-control custom-checkbox mb-2 mr-sm-2 mb-sm-0">
              <input type="checkbox" 
                     className="custom-control-input"
                     onChange={this.toggleSiteProblem}
                     id="siteProblem"
                     checked={this.state.isSiteProblem}
                     value={this.state.isSiteProblem ? 'on' : 'off'} />
              <span className="custom-control-indicator"></span>
              <span className="custom-control-description">Ο μουργος {this.state.isSiteProblem ? '':'δεν'} εχει πρόβλημα!</span>
            </label>
          </li>
          <li style={{padding: 8}} className="nav-item">
            <label className="custom-control custom-checkbox mb-2 mr-sm-2 mb-sm-0">
              <span className="custom-control-description">Ωράριο: {this.state.workingHours}</span>
              <input type="text" className="timetable-input" value={this.state.fvalue} onChange={(e) => this.setState({ fvalue: e.target.value })} /> - 
              <input type="text" className="timetable-input" value={this.state.tvalue} onChange={(e) => this.setState({ tvalue: e.target.value })} />
              <button className="btn btn-sm" onClick={ () => this.updateWH() }>Αλλαγή</button>
            </label>
          </li>
        </ul>
        <UIView />
      </div>
    );
  }
}

export default Template;
