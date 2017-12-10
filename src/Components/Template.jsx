import React, { Component } from 'react';
import Net from '../helpers/net';

import './Template.css';

import {UIView} from '@uirouter/react';

class Template extends Component {

  goTo = (stateName) => {
    this.props.resolves.$transition$.router.stateService.go(stateName);
  }

  logout = () => {
    Net.clearToken();
    this.goTo('login');
  }

  render() {
    return (
      <div>
        <ul className="nav">
          <li className="nav-item">
            <span className="nav-link active" onClick={ () => this.goTo('home.dashboard')}>All Orders</span>
          </li>
          <li className="nav-item">
            <span className="nav-link">Alerts</span>
          </li>
          <li className="nav-item">
            <span className="nav-link" onClick={ () => this.goTo('home.users')}>Users</span>
          </li>
          <li className="nav-item">
            <span className="nav-link" onClick={this.logout}>Logout</span>
          </li>
        </ul>
        <UIView />
      </div>
    );
  }
}

export default Template;
