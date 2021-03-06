/*
  Filename: PlaceChoose.js
  Version: 0.1.0
  Description: This page contains UI elements for the place choose component supported by
  Google places API
*/
import React, {Component} from 'react';
import { TouchableOpacity, Image, RefreshControl, ListView } from 'react-native';
import DateTimePicker from 'react-native-modal-datetime-picker';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { Container, Header, Left, Body, Right, Button, Icon, Segment, Content, Text, Item, Input, Form, Label, View, List, ListItem, Spinner, Thumbnail,Card, CardItem, Toast, Footer, FooterTab } from 'native-base';
import {checkPlace, viewPendingOrders, viewOrderDetailById, acceptOrder, updateOrderStatus, completeOrder, cancelByCarrier, getProfileDetailById, createOrder} from './../database.js';
import {styles} from '../CSS/Main.js';
import SubmitOrder from './SubmitOrder.js';
import IconVector from 'react-native-vector-icons/Entypo';

// Place choose component used by the main page
export class PlaceChoose extends Component {

    static navigationOptions = {
      header: null
    }
    
    constructor(props){
      super(props);
      this.changewhereLogan = this.changewhereLogan.bind(this);
    }

    async changewhereLogan(location){

      var check = await checkPlace(location);
      if( check == true){
          // change the state.whereLogan in buyerMain
          this.props.placeChange(this.props.main, location);
          // change the popup state in buyerMain
          this.props.placeChange(this.props.main, location);
      }else{
          alert("Please choose another location on UCSD");
      }
    }
  
    // Renders the component to the screen
    render(){
        return(
            <Container style={styles.color_theme}>
              <Container style={styles.placeAutocomplete}>
              <GooglePlacesAutocomplete
                placeholder= {this.props.get(this.props.main)}
                minLength={1} // minimum length of text to search
                autoFocus={false}
                returnKeyType={'search'} // Can be left out for default return key https://facebook.github.io/react-native/docs/textinput.html#returnkeytype
                listViewDisplayed='auto'    // true/false/undefined
                fetchDetails={true}
                renderDescription={(row) => row.description} // custom description render
                onPress={(data, details = null) => { // 'details' is provided when fetchDetails = true
                  // Get useful piece from data.description
                  var location = data.description.toString().substring(0, data.description.toString().indexOf(','));
                  // Keep track of the current place chosen
                  this.changewhereLogan(location);
                }}
                getDefaultValue={() => {
                  return ''; // text input default value
                }}
                query={{
                  // available options: https://developers.google.com/places/web-service/autocomplete
                  key: 'AIzaSyAfpH-uU6uH9r8pN4ye4jeunIDMavcxolo',
                  language: 'en', // language of the results
                  //types: '(cities)' // default: 'geocode'
                }}
                // styles for the place choose page
                styles={{
                  textInputContainer: {
                    width: '100%'
                  },
                  description: {
                    fontWeight: 'bold'
                  },
                  predefinedPlacesDescription: {
                    color: '#1faadb'
                  },
                  listView: {
                    backgroundColor: '#FFFFFF',
                  }
                }}
                currentLocation={false} // Will add a 'Current location' button at the top of the predefined places list
                currentLocationLabel="Current location"
                nearbyPlacesAPI='GooglePlacesSearch' // Which API to use: GoogleReverseGeocoding or GooglePlacesSearch
                GoogleReverseGeocodingQuery={{
                  // available options for GoogleReverseGeocoding API : https://developers.google.com/maps/documentation/geocoding/intro
                }}
                GooglePlacesSearchQuery={{
                  // available options for GooglePlacesSearch API : https://developers.google.com/places/web-service/search
                  rankby: 'distance',
                  types: 'food'
                }}
                filterReverseGeocodingByTypes={['locality', 'administrative_area_level_3']} // filter the reverse geocoding results by types - ['locality', 'administrative_area_level_3'] if you want to display only cities
              />
              </Container>
              {/* Cancel button for place choose that will return back to the main page */}
              <Footer>
                <FooterTab>
                  <Button style={styles.placeCancelButton} onPress={() => this.props.placeChange(this.props.main, 'Specify a place')}>
                    <Text style={styles.placeCancelText}>Cancel</Text>
                  </Button>
                </FooterTab>
              </Footer>
            </Container>

        );
    }

}

export default PlaceChoose;