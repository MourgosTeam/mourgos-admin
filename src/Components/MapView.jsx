import React, { Component } from 'react';
import Net from '../helpers/net';

import './MapView.css';

import GoogleMapReact from 'google-map-react';

import 'rc-slider/assets/index.css';
import Tooltip from 'rc-tooltip';
import Slider from 'rc-slider';
const Handle = Slider.Handle;
const wrapperStyle = { width: 400, margin: 50 };


const handle = (props) => {
  const { value, dragging, index, ...restProps } = props;
  return (
    <Tooltip
      prefixCls="rc-slider-tooltip"
      overlay={value}
      visible={dragging}
      placement="top"
      key={index}
    >
      <Handle value={value} {...restProps} />
    </Tooltip>
  );
}
class MyMarker extends Component {
  render() {
    const pos = 'mymarker-' + (this.props.data.position || 0);
    return <div className={`mymarker ${pos} ${this.props.data.color}`}>{this.props.data.letter}</div>;
  }
}
class MapView extends Component {

  constructor(props){
    super(props);
    this.state = {
      logs: [],
      markers: [],
      sliders: [],
      options: {},
      users: {}
    }
    this.loadUsers().then(() => this.loadLogs());
  }

  castToCoords(marker) { 
    let { coords, position, ...restProps } = marker;
    let res = {
      lng: coords.longitude,
      lat: coords.latitude,
      position: position,
      ...restProps
    }
    return res;
  }
  arrayToCoords = (arr) => {
    let res = [];
    for(var i=0;i<arr.length;i++) {
      let item = null;
      try{
        item = this.castToCoords(arr[i]);
      }
      catch(e){
        item = null;
      }
      if(item!==null)
        res.push(item);
    }
    return res;
  }
  calculateMarkers = (options) => {
    let marks = this.state.marks;
    let markers = [];
    for (var user in marks) {
      if(user === 'undefined')continue;
      user = parseInt(user, 10);
      let fromIndex = options[user] || 0;
      let toIndex = (fromIndex + 5) > marks[user].length ? marks[user].length : (fromIndex+5);
      markers = markers.concat(marks[user].slice(fromIndex,toIndex));
      console.log(markers);
    }
    this.setState({
      markers: this.arrayToCoords(markers)
    });
  }

  createMarkers = (data) => {
    let marks = {};
    let groups = [];
    for (let i=0;i<data.length;i++) {
      let obj = JSON.parse(data[i].Value);
      groups[data[i].user_id] = (groups[data[i].user_id] + 1 )|| 0;
      obj.position = groups[data[i].user_id];
      obj.color = 'red';
      obj.letter =  this.state.users[data[i].user_id].username[0];
      if (!marks[data[i].user_id]) marks[data[i].user_id] = [];
      marks[data[i].user_id].push(obj);
    }
    let sliders = [];
    let nopts = {};
    for (var user in marks) {
      nopts[user] = marks[user].length;
      sliders.push({id: user});
    }
    this.setState({
      marks: marks,
      options: nopts,
      sliders: sliders
    });
    return [];
  }

  loadLogs = () => {
    return Net.GetItWithToken('log/locations').then( (data) => {
      this.setState({
        logs: data,
        markers: this.createMarkers(data)
      })
    });
  }
  
  loadUsers = () => {
    return Net.GetItWithToken('users').then( (data) => {
      let cusers = {};
      for(var i = 0; i < data.length; i ++) {
        cusers[data[i].id] = data[i];
      }
      this.setState({
        users: cusers
      })
      return cusers;
    });
  }
  
  slide = (uid, value) => {
    let nopts = this.state.options;
    nopts[uid] = value;
    this.setState({
      options: nopts
    });
    this.calculateMarkers(nopts);
  }

  render() {
    return (
      [<div key={'MAP'}>
        <GoogleMapReact
          bootstrapURLKeys={{key: 'AIzaSyDRALlPKsBze51zayYTLaJFZxZtdWl6zLU'}}
          defaultCenter={{lat: 40.63178, lng: 22.95151}}
          defaultZoom={12}
          style={{height: '70vh', position:'relative'}}
        >
              {this.state.markers.map((marker, i) =>{
                return(
                  <MyMarker key={''+i+marker.lat + marker.lng}
                    lat={marker.lat}
                    lng={marker.lng}
                    data={marker}
                  />
                )
              })}
        </GoogleMapReact>
      </div>,
      <div style={wrapperStyle} key={2}>
        {this.state.sliders.map((slider, i) => 
            <div key={slider.id}>
              <span>Χρήστης: {this.state.users[slider.id].username}</span>
              <Slider min={0} max={this.state.marks[slider.id].length} defaultValue={this.state.marks[slider.id].length} handle={handle} onChange={(v) => this.slide(slider.id, v)}/>
            </div>
            )
        }
      </div>]
    );
  }
}

export default MapView;