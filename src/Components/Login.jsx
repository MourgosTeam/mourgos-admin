import React, { Component } from 'react'

import DataLayer from '../helpers/DAL.jsx'
import Net from '../helpers/net.js'

const whiteLogo = '/images/mourgos-logo-white.png';
class Login extends Component {

  constructor(props){
    super(props);
    console.log(props.resolves);
  }

  login = (event) => {
    event.preventDefault();
    const password = document.getElementById('password').value;
    const username = document.getElementById('username').value;

    Net.Login(username, password).then( () => {
      this.props.resolves.$transition$.router.stateService.go('home.dashboard');
    });
    return false;
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={whiteLogo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to Mourgos Admin Panel</h1>
        </header>
        <div className="container p-t-lg">
        	<div className="col-12 col-lg-4 offset-lg-4">
        		<form onSubmit={this.login}>
    				  <div className="form-group">
    				    <label>Username</label>
    				    <input type="text" className="form-control" id="username" placeholder="Username" />
    				  </div>
    				  <div className="form-group">
    				    <label>Password</label>
    				    <input type="password" className="form-control" id="password" placeholder="Password" />
    				  </div>
    				  <button type="submit" className="btn btn-primary">Login</button>
            </form>
        	</div>
        </div>
      </div>
    );
  }
}

export default Login;
