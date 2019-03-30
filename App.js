/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, {Component} from 'react';
import {Platform, StyleSheet, Text, View, TouchableOpacity} from 'react-native';
import { RNCamera } from 'react-native-camera';
import RNTextDetector from "react-native-text-detector";


const instructions = Platform.select({
  ios: 'Press Cmd+R to reload,\n' + 'Cmd+D or shake for dev menu',
  android:
    'Double tap R on your keyboard to reload,\n' +
    'Shake or press menu button for dev menu',
});

export default class App extends Component {

  state = {

    textBlocks: [],
  };
  render() {
    return (
      <RNCamera
        ref={ref => {
          this.camera = ref;
        }}
        style={{flex: 1}}
        type={RNCamera.Constants.Type.back}
        flashMode={RNCamera.Constants.FlashMode.off}
        permissionDialogTitle={'Permission to use camera'}
        permissionDialogMessage={'We need your permission to use your camera phone'}
        onTextRecognized={this.textRecognized}>

        {this.renderTextBlocks}
      </RNCamera>
    );
  }

  renderTextBlocks = () => (
    <View style={styles.facesContainer} pointerEvents="none">
      {this.state.textBlocks.map(this.renderTextBlock)}
    </View>
  );

  renderTextBlock = ({ bounds, value }) => (
    <React.Fragment key={value + bounds.origin.x + bounds.origin.y}>
     <Text style={[styles.textBlock, { left: bounds.origin.x, top: bounds.origin.y }]}>
        {(value.replace(/[^0-9]/g,'').length === 7 || value.replace(/[^0-9]/g,'').length === 8) ? value.replace(/[^0-9]/g,'') : ''}
      </Text>
      {(value.replace(/[^0-9]/g,'').length === 7 || value.replace(/[^0-9]/g,'').length === 8) && <View
        style={[
          styles.text,
          {
            ...bounds.size,
            left: bounds.origin.x,
            top: bounds.origin.y,
          },
        ]}
      />}
    </React.Fragment>
  );

  textRecognized = object => {
    const textBlocks = object.textBlocks
    this.setState({ textBlocks: textBlocks.map(this.extractNumbers)})
  };

  extractNumbers = (item) => {
    const v = item.value.replace(/[^0-9]/g,'')
     if(v.length === 7 || v.length === 8) {
       console.log(v);
     }
     return item
    //}
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 10,
    backgroundColor: '#000',
  },
  face: {
    padding: 10,
    borderWidth: 2,
    borderRadius: 2,
    position: 'absolute',
    borderColor: '#FFD700',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  text: {
    padding: 10,
    borderWidth: 2,
    borderRadius: 2,
    position: 'absolute',
    borderColor: '#fff',
    justifyContent: 'center',
  },
  textBlock: {
    color: '#fff',
    position: 'absolute',
    textAlign: 'center',
    backgroundColor: 'transparent',
  },
  facesContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    left: 0,
    top: 0,
  },
});
