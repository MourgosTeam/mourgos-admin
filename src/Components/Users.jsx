import React, { Component } from 'react';
import Net from '../helpers/net';


class Users extends Component {

  constructor(props){
    super(props);
    this.state = {
      users: []
    }
    this.loadUsers();
  }

  loadUsers = () => {
    Net.GetItWithToken('users/').then( (data) => {
      this.setState({
        users : data
      })
    });
  }
  
  changeRole = (id, event) => {
    const role = event.target.value;
    const body = {
      id,
      role
    };
    Net.PostItWithToken('users/role', body).then( (data) => {
      window.location.href = window.location.href;
    });
  }

  register = (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const password2 = document.getElementById('cpassword').value;
    const name = document.getElementById('name').value;
    const phone = document.getElementById('phone').value;
    const email = document.getElementById('email').value;

    if(password2 !== password){
      alert('Passwords are different!');
      return;
    }

    var user = {
      username,
      password,
      name,
      phone,
      email
    }
    Net.PostItWithToken('users/register', user).then( (data) => {
      window.location.href = window.location.href;
    })

  }

  render() {
    return (
      <div>
        <table className="table">
          <thead>
            <tr>
              <th scope="col">#</th>
              <th scope="col">Username</th>
              <th scope="col">Όνομα</th>
              <th scope="col">Τηλέφωνο</th>
              <th scope="col">Email</th>
              <th scope="col">Role</th>
            </tr>
          </thead>
          <tbody>
          {this.state.users.map((user, index) => 
              <tr key={index}>
                <th scope="row">{user.id}</th>
                <td>{user.username}</td>
                <td>{user.name}</td>
                <td>{user.phone}</td>
                <td>{user.email}</td>
                <td>
                  <select className="form-control" defaultValue={user.role} onChange={ (e) => this.changeRole(user.id, e)}>
                    <option value={1}>Shop</option>
                    <option value={2}>Delivery</option>
                    <option value={0}>Admin</option>
                    <option value={-1}>No Role</option>
                  </select>
                </td>
              </tr>
          )}
          </tbody>
        </table>
        <div className="container col-12 col-md-4 offset-md-4">
          <form onSubmit={this.register}>
            <div className="form-group">
              <label>Username</label>
              <input type="text" className="form-control" id="username" placeholder="Username" />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="password" className="form-control" id="password" placeholder="Password" />
            </div>
            <div className="form-group">
              <label>Confirm Password</label>
              <input type="password" className="form-control" id="cpassword" placeholder="Confirm Password" />
            </div>
            <div className="form-group">
              <label>Όνομα</label>
              <input type="text" className="form-control" id="name" placeholder="Όνομα" />
            </div>
            <div className="form-group">
              <label>Τηλέφωνο</label>
              <input type="text" className="form-control" id="phone" placeholder="Τηλέφωνο" />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="text" className="form-control" id="email" placeholder="Mail" />
            </div>
            <button type="submit" className="btn btn-primary">Register</button>
          </form>
        </div>
      </div>
    );
  }
}

export default Users;
