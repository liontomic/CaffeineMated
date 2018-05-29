import React, {Component} from 'react';
import { TouchableOpacity, Image, RefreshControl, ListView } from 'react-native';
import DateTimePicker from 'react-native-modal-datetime-picker';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { Container, Header, Left, Body, Right, Button, Icon, Segment, Content, Text, Item, Input, Form, Label, View, List, ListItem, Spinner, Thumbnail,Card, CardItem, Toast } from 'native-base';
import {sortOrdersByRequestTime,viewPendingOrders, viewOrderDetailById, acceptOrder, updateOrderStatus, completeOrder, cancelByCarrier, getProfileDetailById, createOrder} from './../database.js';
import {styles} from '../CSS/Main.js';
import SubmitOrder from './SubmitOrder.js';
import IconVector from 'react-native-vector-icons/Entypo';

export class CarrierMain extends Component {
    
    static navigationOptions = {
        header: null
    }
    
    constructor(props) {
        super(props);
        this.state={
            isDateTimePickerVisible:false,
            loading:false
        }
        this.createStars = this.createStars.bind(this);
        this.changeStates = this.changeStates.bind(this);
        
    }
    
    _showDateTimePicker = () => this.setState({ isDateTimePickerVisible: true });
    _hideDateTimePicker = () => this.setState({ isDateTimePickerVisible: false });
    
    _handleDatePicked = (date) => {
        console.log('A date has been picked: ', date.toString());
        // Extract the hr:min part
        var time = date.toString().substring(16, 21);
        this.props.change("carrier_whenLogan", time);
        this._hideDateTimePicker();
    };
    
    
    navigatePlace(lc){
        this.setState({location: lc});
    }

    accept = () => {
        date = new Date();
        this.changeStates(["accepted", "carrier_accept_hour","carrier_accept_minute", "carrier_accept_second"], [true,date.getHours(),date.getMinutes(),date.getSeconds()]);
        acceptOrder(this.state.selected_order, "01");
        //console.log(this.state.accepted);
      }


      update = () => {
        //console.log(this.state.selected_order);
        updateOrderStatus(this.state.selected_order);
        this.props.change("delivering", true);
      }
    
      complete = () => {
        completeOrder(this.state.selected_order, "01");
        this.changeStates(["request_selected", "accepted", "delivering","order_selecting","selecting_order","selected_order"],[false, false, false, undefined,false,-1]);
    
        this.componentWillMount();
      }

    
    createStars = (num) => {
        let stars = []
        for (var i = 0; i <= 4; i++) {
            
            let iosStar = 'ios-star';
            let androidStar = 'md-star';
            
            if (num - 1 > 0) {
                iosStar = 'ios-star';
                androidStar = 'md-star';
            } else if ( num - 0.5 >= 0) {
                iosStar = 'ios-star-half';
                androidStar = 'md-star-half';
            } else {
                iosStar = 'ios-star-outline';
                androidStar = 'md-star-outline';
            }
            
            num -= 1
            stars.push((<Icon key={i} ios={iosStar} android={androidStar} style={styles.icon}/>));
        }
        return stars
    }

    _onRefresh() {
        this.setState({refreshing: true});
        this.fetchData().then(() => {
          this.setState({refreshing: false});
        });
      }
    
    changeStates(ids, values){
        for( var i = 0; i < ids.length; i++){
            this.props.change(ids[i], values[i]);
        }
    }

    async fetchData() {
        await this.saveRequestIds();
        await this.saveRequestDetails();
    }

    async saveRequestIds() {
        this.props.change("ids", await viewPendingOrders());
        //console.log(this.state.ids);
      }
    
      async saveRequestDetails() {
        var received = [];
        for (let id of this.state.ids) {
          order = await viewOrderDetailById(id);
          order["id"] = id;
          profile = await getProfileDetailById(order.buyer_id)
          console.log(profile)
          if (profile.username) {
            order["buyer_name"] = profile.username;
          }
          else {
            order["buyer_name"] = "Username";
          }
          if (profile.photo) {
            order["avatar"] = profile.photo;
          }
          else {
            order["avatar"] = undefined;
          }
          received.push(order);
          if (this.order_selected[id] == undefined) {
            this.order_selected[id] =  false;
          }
        }
        this.setState({request_data: received});
        //const d = this.state.ids.map(async id => {await viewOrderDetailById(id)});
        //console.log(d)
        //this.setState({data: async this.state.ids.map((id) => {await viewOrderDetailById(id))}});
        //console.log(this.state.request_data);
    }
    
    
    
    
    render(){
        const loading = this.props.get('loadFinished');
        if(this.props.get('selecting_order')){
            
            return (
                <Content scrollEnabled={false}>
                <Card>
                <CardItem header>
                
                <Button transparent onPress={() => this.props.change('selecting_order', false)}>
                <Icon name="arrow-back" style={styles.icon}/>
                </Button>
                
                </CardItem>
                
                <View style={styles.cardLine}/>
                <CardItem>
                <Left>
                {!this.props.get('order_selecting.avatar') &&
                <Thumbnail large source={require('../resources/avatar.png')}/>
            }
            {this.props.get('order_selecting.avatar') &&
            <Thumbnail large source={{uri: this.props.get('order_selecting.avatar')}}/>
        }
        
        <Body>
        <CardItem>
        <Text style={styles.cardBuyerName}>
        {this.props.get('order_selecting.buyer_name')}
        </Text>
        </CardItem>
        <CardItem>
        {
            this.createStars(this.props.get('order_selecting.buyer_rate'))
        }
        </CardItem>
        </Body>
        </Left>
        </CardItem>
        <View style={styles.cardLine}/>
        <CardItem>
        <Text style={styles.card_title}>
        Location:
        </Text>
        <Text>
        {this.props.get('order_selecting.location')}
        </Text>
        </CardItem>
        <CardItem style={styles.row_card_item}>
        <Text style={styles.card_title}>
        Time:
        </Text>
        <Text>
        {this.props.get('order_selecting.request_time')}
        </Text>
        </CardItem>
        {Object.values(this.props.get('order_selecting.items')).map((item,key)=>
        (
            
            <CardItem key= {key}>
            <Body>
            <Text style={styles.card_title}>
            {item.item_name}
            </Text>
            
            <Text>
            {item.size}
            </Text>
            
            <Text>
            {item.customization}
            </Text>
            </Body>
            </CardItem>
        ))
    }
    <CardItem footer>
    <Body>
    <Button
    style={styles.buttons_confirm}
    color="#ffffff"
    >
    <Text style={styles.menuText}
    onPress={() => this.changeStates(["selected_order","selecting_order", "request_selected"], [this.props.get("order_selecting_id"), false,true])}>
    Confirm
    </Text>
    </Button>
    </Body>
    </CardItem>
    
    </Card>
    </Content>
);
}else if(!this.props.get('accepted')){
    return(
    <Container style = {styles.Container}>
    <View style= {styles.banner}>
    
    <Item regular style={styles.textInput}>
    <Button iconLeft style={styles.Whenbutton} onPress={this._showDateTimePicker}>
    <Icon style={styles.Whenwheretext} name='alarm' />
    <Text style={styles.Whenwheretext}>{this.props.get('carrier_whenLogan')}</Text>
    </Button>
    <DateTimePicker
    isVisible={this.state.isDateTimePickerVisible}
    onConfirm={this._handleDatePicked}
    onCancel={this._hideDateTimePicker}
    mode='time'
    titleIOS='Pick a time'
    is24Hour={true}
    timeZoneOffsetInMinutes={-7 * 60}
    />
    </Item>
    <Item regular style={styles.textInput}>
    <Button iconRight style={styles.Wherebutton} onPress={()=>{this.props.change('carrier_choosePlaces', true)}}>
    <Text style={styles.Whenwheretext}>{this.props.get('carrier_whereLogan')}</Text>
    <Icon style={styles.Whenwheretext} name='navigate' />
    </Button>
    </Item>
    
    {/* ---------------------------------- Request List ---------------------------------- */}
    <View regular style={styles.requestTitleItem}>
    <Label style = {styles.orderTitle}>
    Requests
    </Label>
    </View>
    
    
    <View scrollEnabled={false} style={styles.requestView}>
    {loading &&
        <Content refreshControl={
            <RefreshControl
            refreshing={this.props.get("carrier_refreshing")}
            onRefresh={this._onRefresh.bind(this)}
            />
        }>
        <List
        scrollEnabled={false}
        dataArray={this.props.get("request_data")}
        style= {styles.requestList}
        
        
        renderRow={data =>
            <ListItem
            onPress={() => this.changeStates(["order_selecting","selecting_order"], [data, true])}
            selected = {data.id == this.props.get("selected_order")}>
            <Left style={styles.list_left_container}>
            { !data.avatar &&
                <Thumbnail  source={require('../resources/avatar.png')}/>
            }
            { data.avatar &&
                <Thumbnail  source={{uri: data.avatar}}/>
            }
            <Text numberOfLines={1} style={{flex: 1, fontSize: 12}}>
            {data.buyer_name}
            </Text>
            </Left>
            <Body style={styles.list_body_container}>
            {Object.values(data.items).map((item,key)=>
                <Text style={styles.list_text} key={key}>
                {item.item_name}
                </Text>)
            }
            <Text numberOfLines={1} style={styles.list_text}>
            {data.location}
            </Text>
            <Text style={styles.list_text}>
            {data.request_time}
            </Text>
            </Body>
            
            
            </ListItem>}
            >
            </List>
            </Content>
        }
        {
            !loading && <Content>
            <Spinner color='#FF9052' />
            </Content>
        }
        </View>
        
        
        {/* ---------------------------------- Accept Button ---------------------------------- */}
        
        <View style={styles.acceptButtonItem}>
        <Button
        disabled = {!this.props.get('request_selected')}
        style={styles.buttons_accept}
        color="#ffffff"
        onPress={() => this.accept() }
        >
        <Text style={this.props.get('request_selected')? styles.menuText: styles.menuText_disabled}>
        Accept
        </Text>
        </Button>
        </View>
        
        
        </View>
        </Container>
     );
    }else if(this.props.get("accepted")){
        return (
            <Container>
                <View style= {styles.banner}>
        
        
                <Item regular style={styles.DiliverTitleItem}>
                <Label style = {styles.orderTitle}>
                  {!this.props.get('delivering') ? 'Way To Shop': 'Delivering'}
                </Label>
                </Item>
        
                <Item regular style={styles.DiliverItem}>
                <View >
                  <View style={styles.deliverProfile}>
                    {!this.props.get('order_selecting.avatar') &&
                      <Thumbnail large source={require('../resources/avatar.png')}/>
                    }
                    {this.props.get('order_selecting.avatar') &&
                      <Thumbnail large source={{uri: this.props.get('order_selecting.avatar')}}/>
                    }
                    <View>
                      <Label style={styles.DeliverProfileText}>
                        {this.props.get('order_selecting.buyer_name')}
                      </Label>
                      <View style={styles.DeliverStarts}>
                        {this.createStars(this.props.get('order_selecting.buyer_rate'))}
                      </View>
                    </View>
                  </View>
                  <View style={styles.deliverItems}>
                  {Object.values(this.props.get('order_selecting.items')).map((item,key)=>
                    (
        
                    <View key= {key} style={styles.deliverItem}>
                    <Text style={styles.card_title}>
                      {item.item_name}
                    </Text>
                    <Text>
                      {item.size}
                    </Text>
                    <Text>
                      {item.customization}
                    </Text>
                    </View>
                    ))
                  }
                  </View>
                </View>
                </Item>
        
        
                <Item regular style={styles.DiliverProcess}>
                  <View style={styles.deliverLocation}>
                    <View style={styles.process}>
                      <Text>
                        {this.GetTime()}
                      </Text>
                      <Text>
                        {this.props.get('order_selecting.location')}
                      </Text> 
                      <Text>
                        {this.props.get('order_selecting.request_time')}
                      </Text>
                    </View>
                    <View style={styles.process}>
                      {this.props.get('delivering')? this.createProcess(3):this.createProcess(2)}
                    </View>
                  </View>
                </Item>
        
        
                <View style={styles.updateButtonItem}>
                {!this.props.get('delivering') &&
                  <Button
                    style={styles.buttons_accept}
                    color="#ffffff"
                    onPress={() => this.update() }
                  >
                    <Text style={styles.menuText}>
                      Update
                    </Text>
                  </Button>
                }
                {!this.props.get('delivering') &&
                  <Button
                    style={styles.buttons_cancel}
                    color="#ffffff"
                    onPress={() => this.cancelCarrier() }
                  >
                    <Text style={styles.cancelText}>
                      Cancel
                    </Text>
                  </Button>
                }
                {this.props.get('delivering') &&
                  <Button
                    style={styles.buttons_accept}
                    color="#ffffff"
                    onPress={() => this.complete() }
                  >
                    <Text style={styles.menuText}>
                      Complete
                    </Text>
                  </Button>
                }
                </View>
              </View>
            }
        
            </Container>
        );
    }
    }
}


export default CarrierMain;