import React, { Component, Fragment } from "react";
import Geolocation from "react-native-geolocation-service";
import { View, Text, Image, YellowBox } from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import Geocoder from "react-native-geocoding";

import { getPixelSize } from "../../utils";

import Search from "../Search";
import Directions from "../Directions";
import Details from "../Details";

import markerImage from "../../assets/marker.png";
import backImage from "../../assets/back.png";

import {
  Back,
  LocationBox,
  LocationText,
  LocationTimeBox,
  LocationTimeText,
  LocationTimeTextSmall
} from "./styles";

YellowBox.ignoreWarnings(["Unknown", "component", "undefined"]);
Geocoder.init("GOOGLE_MAPS_APIKEY");

export default class Map extends Component {
  state = {
    region: null,
    destination: null,
    duration: null,
    location: null
  };
  getLocation = () => {
    Geolocation.getCurrentPosition(
      position => {
        this.setState({
          region: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            latitudeDelta: 0.0143,
            longitudeDelta: 0.0134
          }
        });
      },
      err => {
        console.log("error");
        console.log(err);
      },
      { enableHighAccuracy: true, timeout: 2000, maximumAge: 1000 }
    );
  };
  componentDidMount() {
    this.getLocation();
  }

  handleLocationSelected = (data, { geometry }) => {
    const {
      location: { lat: latitude, lng: longitude }
    } = geometry;
    this.setState({
      destination: {
        latitude,
        longitude,
        title: data.structured_formatting.main_text
      }
    });
  };

  handleBack = () => {
    this.setState({ destination: null });
  };

  render() {
    const { region, destination, duration, location } = this.state;
    return (
      <View style={{ flex: 1 }}>
        <MapView
          style={{ flex: 1 }}
          region={region}
          showsUserLocation
          loadingEnabled
          ref={el => (this.mapView = el)}
        >
          {destination && (
            <Fragment>
              <Directions
                origin={region}
                destination={destination}
                onReady={result => {
                  this.setState({ duration: Math.floor(result.duration) });

                  this.mapView.fitToCoordinates(result.coordinates, {
                    edgePadding: {
                      right: getPixelSize(50),
                      left: getPixelSize(50),
                      top: getPixelSize(50),
                      bottom: getPixelSize(350)
                    }
                  });
                }}
              />

              <Marker
                coordinate={destination}
                anchor={{ x: 0, y: 0 }}
                image={markerImage}
              >
                <LocationBox>
                  <LocationText>{destination.title}</LocationText>
                </LocationBox>
              </Marker>

              <Marker coordinate={region} anchor={{ x: 0, y: 0 }}>
                <LocationBox>
                  <LocationTimeBox>
                    <LocationTimeText>{duration}</LocationTimeText>
                    <LocationTimeTextSmall>MIN</LocationTimeTextSmall>
                  </LocationTimeBox>
                  <LocationText>{location}</LocationText>
                </LocationBox>
              </Marker>
            </Fragment>
          )}
        </MapView>

        {destination ? (
          <Fragment>
            <Back onPress={this.handleBack}>
              <Image source={backImage} />
            </Back>
            <Details />
          </Fragment>
        ) : (
          <Search onLocationSelected={this.handleLocationSelected} />
        )}
      </View>
    );
  }
}
