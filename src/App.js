import React, { Component } from 'react';
import './App.css';
import {UIRouter, UIView} from '@uirouter/react';
import {router} from './router.config.js';


class App extends Component {

  constructor(props){
    super(props);
  }

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
