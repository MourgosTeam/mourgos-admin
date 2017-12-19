import React, { Component } from 'react';
import './App.css';
import {UIRouter, UIView} from '@uirouter/react';
import {router} from './router.config.js';

import './helpers/stringformat.min.js'

class App extends Component {
  render() {
    return (
      <UIRouter router={router}>
        <div className="App">
          <UIView />
        </div>
      </UIRouter>
    );
  }
}

export default App;
