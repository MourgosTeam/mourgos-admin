import React, { Component } from 'react';
import Net from '../helpers/net';

import './MapView.css';

import GoogleMapReact from 'google-map-react';

class MyMarker extends Component {

  render() {
    const pos = 'mymarker-' + (this.props.data.position || 0);
    return <div className={`mymarker ${pos}`}>M</div>;
  }
}
class MapView extends Component {

  constructor(props){
    super(props);
    this.state = {
      logs: [],
      markers: []
    }
    this.loadLogs();
  }

  castToCoords(marker) { 
    let res = {
      lng: marker.coords.longitude,
      lat: marker.coords.latitude,
      position: marker.position
    }
    return res;
  }
  createMarkers = (data) => {
    let marks = [];
    let groups = [];
    for(let i=0;i<data.length;i++){
      let obj = JSON.parse(data[i].Value);
      if(groups[obj.user_id] > 8)
        continue;
      groups[obj.user_id] = (groups[obj.user_id] + 1 )|| 0;
      obj.position = groups[obj.user_id];
      marks.push(this.castToCoords(obj));
    }
    return marks;
  }

  loadLogs = () => {
    Net.GetItWithToken('log/locations').then( (data) => {
      this.setState({
        logs: data,
        markers: this.createMarkers(data)
      })
    });
  }
  
  render() {
    return (
      <div>
        <GoogleMapReact
          apiKey={'AIzaSyDRALlPKsBze51zayYTLaJFZxZtdWl6zLU'}
          defaultCenter={{lat: 40.63178, lng: 22.95151}}
          defaultZoom={12}
          style={{height: '300px'}}
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
      </div>
    );
  }
}

export default MapView;