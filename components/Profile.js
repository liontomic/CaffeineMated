/*
  Filename: Profile.js
  Version: 0.1.0
  Description: This page contains UI elements for the profiles page, as well as
  functions to parse/update user data.
*/
import React, {Component} from 'react';
import {
  Container,
  Header,
  Title,
  Left,
  List,
  Body,
  Right,
  Footer,
  FooterTab,
  Button,
  Icon,
  Segment,
  Content,
  Text,
  Item,
  Input,
  Form,
  Label,
  View,
  ListItem,
  Thumbnail,
  Spinner
} from 'native-base';
import {styles} from '../CSS/Profile.js';
import {getProfileById, changeUserName, getCurrentUserUID, setPhoneNum, resetPassword,
  getCurrentUserEmail} from './../database.js';


export class Profile extends Component {

  static navigationOptions = {
    header: null
  }

  constructor(props) {
    super(props);
    this.state = {
      placeName:'',
      name: '',
      placePhone: '',
      phone: '',
      email: '',
      password: '••••••',
      profilePic: "../resources/batman.jpg",
      profileData: [],
      photo: '',
      rating: 0,
      user_id: '',
      loaded: false,
    };

    this.updateProfile = this.updateProfile.bind(this);

  }

  //get profile data
  async getProfile() {
    this.setState({user_id: await getCurrentUserUID()});
    this.setState({profileData: await getProfileById(this.state.user_id)});
    this.setState({email: await getCurrentUserEmail()})
    this.setState({
      placeName: this.state.profileData["username"],
      placePhone: this.state.profileData["phone"],
      rating: Math.round(this.state.profileData["rate"]*2)/2,
      photo: this.state.profileData["photo"],
      loaded: true,
    })

  }

  async componentWillMount() {
    await this.getProfile();
  }

  //update profile logic check
  async updateProfile() {
    var changed = false;
    if (this.state.name != '' || this.state.phone != '') {
      changed = true;
    }

    if (this.state.name != '') {
      var result = await changeUserName(this.state.user_id, this.state.name);
      this.setState({
        placeName: this.state.name,
        name: '',
      })
    }

    if (this.state.phone != '') {
      await setPhoneNum(this.state.phone);
      this.setState({
        placePhone: this.state.phone,
        phone: '',
      })
    }

    if(changed == true) {
      alert ('Update Successful!')
    } else {
      alert('You cannot update empty fields!');
    }
  }

  //reset password
  async updatePassword() {
    await resetPassword();
  }

  render() {

    let rateStars = [];

    {/* Initialize rating stars for profile*/}
    let curr = this.state.rating;
    for (var i = 1; i <= 5; i++) {

      let iosStar = 'ios-star';
      let androidStar = 'md-star';

      if (curr - 1 >= 0) {
        iosStar = 'ios-star';
        androidStar = 'md-star';
        curr = curr - 1;
      } else if ( curr - 0.5 == 0) {
        iosStar = 'ios-star-half';
        androidStar = 'md-star-half';
        curr = curr - 0.5;
      } else {
        iosStar = 'ios-star-outline';
        androidStar = 'md-star-outline';
      }

			// Push the icon tag in the stars array
			rateStars.push((<Icon key={i} ios={iosStar} android={androidStar} style={styles.icon}/>));

		}

    return (
      <Container style={styles.color_theme}>
        <Header hasSegment="hasSegment">
          <Left>
            <Button transparent onPress={() => this.props.navigation.navigate('main', {
               update: false,
          })}>
              <Icon name='arrow-back' style={styles.icon}/>
            </Button>
          </Left>
          <Body>

            <Title>Profile</Title>

          </Body>
          <Right></Right>
        </Header>

          {this.state.loaded &&
            <Container style={styles.container}>
              <Container style={styles.profileSection}>
                <Thumbnail large source={{uri: this.state.photo}} />
                <Container style={styles.starSection}>
                  {rateStars}
                </Container>
              </Container>

              {/*Section Containing profile details*/}
              <Form style={styles.detailSection}>
                <Item stackedLabel>
                  <Label>Name</Label>
                  <Input value={this.state.name}
                  onChangeText={(text) => this.setState({name: text})}
                  placeholder={this.state.placeName}/>
                </Item>
                <Item stackedLabel>
                  <Label>Phone Number</Label>
                  <Input placeholder={this.state.phone}
                  onChangeText={(text) => this.setState({phone: text})}
                  placeholder={this.state.placePhone}/>
                </Item>
                <Item stackedLabel>
                  <Label>Email</Label>
                  <Input disabled placeholder={this.state.email}
                  keyboardType='email-address'
                  />
                </Item>
                <Item stackedLabel last>
                <Button
                  style={{marginTop: 10, backgroundColor: "#FF9052"}}
                  onPress={() => this.updatePassword()}
                >
                  <Text>Change Password</Text>
                </Button>
                </Item>
              </Form>
            </Container>
          }

          {/*spinner during loading*/}
          {!this.state.loaded &&
            <Container>
              <Spinner color="#FF9052" />
            </Container>

          }

          {/*Signout button*/}
          <Footer>
            <FooterTab>
              <Button full style={styles.signOut}
                onPress={() => this.updateProfile()}>
                <Text style={styles.signOutText}>Update Profile</Text>
              </Button>
            </FooterTab>
          </Footer>

      </Container>
    );
  }
}
export default Profile;
