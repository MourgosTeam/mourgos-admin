import React, { Component } from 'react';
import Net from '../helpers/net';


class Campaigns extends Component {

  constructor(props){
    super(props);
    this.state = {
      campaigns: []
    }
    this.loadUsers();
  }

  loadUsers = () => {
    Net.GetItWithToken('campaigns/').then( (data) => {
      this.setState({
        campaigns : data
      })
    });
  }
  
  changeCampaign = (id, event) => {
    const body = {
      [event.target.id]: event.target.value
    };
    Net.PostItWithToken('campaigns/edit/'+id, body).then( (data) => {
      window.location.href = window.location.href;
    });
  }

  registerCampaign = (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const formula = document.getElementById('formula').value;
    const hashtag = document.getElementById('hashtag').value;
    const usages = document.getElementById('usages').value;

    var campaign = {
      name,
      formula,
      hashtag,
      usages
    }

    Net.PostItWithToken('campaigns/new', campaign).then( (data) => {
      window.location.href = window.location.href;
    });
  }

  deleted(id, name) {
    if(window.confirm("Are you sure you want to delete campaign : "+ name +" ?")) {
      Net.DeleteItWithToken('campaigns/'+id).then(() => window.location.href = window.location.href);
    }
  }

  render() {
    return (
      <div>
        <table className="table">
          <thead>
            <tr>
              <th scope="col">#</th>
              <th scope="col">Όνομα</th>
              <th scope="col">Formula</th>
              <th scope="col">Hashtag</th>
              <th scope="col">Χρήσεις</th>
            </tr>
          </thead>
          <tbody>
          {this.state.campaigns.map((campaign, index) => 
              <tr key={index}>
                <th scope="row">{campaign.id}</th>
                <td>{campaign.Name}</td>

                <td><input type="text" id="Formula" defaultValue={campaign.Formula} onBlur={(e) => this.changeCampaign(campaign.id, e)} /></td>
                <td className="row">
                  <div className="col">
                    {campaign.Hashtag}
                  </div>
                  <div className="col">
                    <button className="btn btn-sm btn-danger col-3" onClick={(e) => {e.stopPropagation();this.deleted(campaign.id,campaign.Hashtag)}}>Delete</button>
                  </div>
                </td>
                <td>{campaign.CurrentUsages} / <input type="text" id="MaxUsages" placeholder="" defaultValue={campaign.MaxUsages} onBlur={(e) => this.changeCampaign(campaign.id, e)} /></td>
              </tr>
          )}
          </tbody>
        </table>
        <div className="container col-12 col-md-4 offset-md-4">
          <form onSubmit={this.registerCampaign}>
            <div className="form-group">
              <label>Όνομα</label>
              <input type="text" className="form-control" id="name" placeholder="Name" />
            </div>
            <div className="form-group">
              <label>Formula</label>
              <input type="text" className="form-control" id="formula" placeholder="Formula" />
            </div>
            <div className="form-group">
              <label>Hashtag</label>
              <input type="text" className="form-control" id="hashtag" placeholder="Hashtag" />
            </div>
            <div className="form-group">
              <label>Χρήσεις</label>
              <input type="text" className="form-control" id="usages" placeholder="Χρήσεις" />
            </div>
            <button type="submit" className="btn btn-primary">Καταχώρηση</button>
          </form>
        </div>
      </div>
    );
  }
}

export default Campaigns;
