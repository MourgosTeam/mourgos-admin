import React, { Component } from 'react';
import Net from '../helpers/net';

import { withScriptjs, withGoogleMap, GoogleMap, Marker } from "react-google-maps"
import GoogleMapReact from 'google-map-react';

class MyMapComponent extends Component{
  constructor(props) {
    super(props);

    this.state = {
      markers: []
    };
  }
  componentWillReceiveProps(props) {
    this.setState({
      markers: props.markers
    });
  }

  render() {
    return (
    <GoogleMap

      defaultZoom={12}
      defaultCenter={{lat: 40.63178, lng: 22.95151}}
    >
      {this.state.markers.map((coords, index) => {
        <Marker position={coords} />
      })}
    </GoogleMap>
    );
  }
}
const MyGoogleMap = withScriptjs(withGoogleMap(MyMapComponent));
const MyMarker = ({}) => <div>M</div>;
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
      lat: marker.coords.latitude
    }
    return res;
  }
  createMarkers = (data) => {
    let marks = [];
    for(let i=0;i<data.length;i++){
      marks.push(this.castToCoords(JSON.parse(data[i].Value)));
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
                  <MyMarker key={i}
                    lat={marker.lat}
                    lng={marker.lng}
                  />

                )
              })}      
        </GoogleMapReact>
      </div>
    );
  }
}

export default MapView;