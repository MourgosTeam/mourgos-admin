import React, { Component } from 'react';
import Net from '../helpers/net';
import timeago from 'timeago.js';

import {UIView} from '@uirouter/react';

class Template extends Component {

  constructor(props){
    super(props);
  }

  goTo = (stateName) => {
    this.props.resolves.$transition$.router.StateService.go(stateName);
  }

  render() {
    return (
      <div>
        <ul className="nav">
          <li className="nav-item">
            <span className="nav-link active">All Orders</span>
          </li>
          <li className="nav-item">
            <span className="nav-link" href="#"></span>
          </li>
          <li className="nav-item">
            <span className="nav-link" href="#"></span>
          </li>
          <li className="nav-item">
            <span className="nav-link disabled" href="#"></span>
          </li>
        </ul>
        <UIView />
      </div>
    );
  }
}

export default Template;
