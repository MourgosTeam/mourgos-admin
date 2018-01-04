import React, { Component } from 'react';
import './App.css';
import {UIRouter, UIView} from '@uirouter/react';
import {router} from './router.config.js';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

import './helpers/stringformat.min.js'

class App extends Component {
  render() {
    return (
   	<MuiThemeProvider>
      <UIRouter router={router}>
        <div className="App">
          <UIView />
        </div>
      </UIRouter>
    </MuiThemeProvider>
    );
  }
}

export default App;
