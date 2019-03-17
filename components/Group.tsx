import * as React from 'react';
import { View, StyleSheet, TouchableHighlight, Text, ScrollView } from "react-native";
import t from 'tcomb-form-native'; // 0.6.9
import axios from "axios";
import { Card, ThemeProvider, Button, ListItem, Icon, Image} from "react-native-elements";
import { Google, Constants } from 'expo';
import { cpus } from 'os';
const {API_HOST} = Constants.manifest.extra;

const list = [
  {
    name: "Brian Miller",
    avatar_url:
      "https://avatars3.githubusercontent.com/u/39815179?s=400&u=a69fa34fedf78b44cdfcb30cd276b6d519c4cad5&v=4",
    icon: 'chat'
  },
  {
    name: "Akin Pounds",
    avatar_url: "https://avatars2.githubusercontent.com/u/42776703?s=460&v=4",
    icon: 'chat'
  },
  {
    name: "Michael LeMaire",
    avatar_url: "https://avatars0.githubusercontent.com/u/29212401?s=400&v=4",
    icon: 'chat'
  },
];


export default class GroupView extends React.Component{
  constructor(props: object) {
    super(props);
    this.onUserPress = this.onUserPress.bind(this);
  }
  
  onPressPanic = () => {
    // Do whatever you need here to switch to Joining a group View
    console.log('Panic Button Pressed');
  }

  onUserPress = (objects) => {
    console.log(objects.nativeEvent.changedTouches);
    let position = objects.nativeEvent.changedTouches[0].pageY;
    let isChat = false;
    if (objects.nativeEvent.changedTouches[0].pageX >= 310) {
      isChat = true;
    }
    if(position <= 417) {
      console.log('Brian: User 1', 'Chat: ', isChat);
    } else if(position < 489) {
      console.log('Akin: User 2', 'Chat: ', isChat);
    } else {
      console.log('Michael: User 3', 'Chat: ', isChat);
    }
    isChat = false;
  }
  

  render() {
    return (
      <View style={styles.container}>
        {list.map((l, i) => (
          <ListItem
            style={styles.user}
            color="#0078ef"
            key={i}
            leftAvatar={{ source: { uri: l.avatar_url } }}
            title={l.name}
            rightIcon={{name: l.icon}}
            onPress={this.onUserPress}
          />
        ))}
        <TouchableHighlight
          style={styles.button}
          onPress={this.onPressPanic}
          // underlayColor="#99d9f4"
        >
          <Text style={styles.buttonText}>Panic</Text>
        </TouchableHighlight>
      </View>
    );
  }
}
const scroll = StyleSheet.create({
  contentContainer: {
    paddingVertical: 20
  }
});

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    width: 400,
    marginTop: 0,
    padding: 30,
    borderRadius: 8,
    backgroundColor: "#0078ef"
  },
  buttonText: {
    fontSize: 20,
    color: "white",
    alignSelf: "center"
  },
  button: {
    height: 50,
    backgroundColor: "#800000",
    borderColor: "#800000",
    borderWidth: 1,
    borderRadius: 8,
    marginTop: 20,
    marginBottom: 10,
    alignSelf: "stretch",
    justifyContent: "center"
  },
  user: {
    backgroundColor: "#0078ef",
    padding: 2,
    alignSelf: "stretch"
  },
  name: {
    fontSize: 14,
    color: "white",
    alignSelf: "stretch"
  },
  image: {
    width: 80,
    height: 80
  }
});