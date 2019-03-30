import React, {Component} from 'react';
import {Platform, StyleSheet, Text, View, Alert, BackHandler, Clipboard} from 'react-native';
import {RNCamera} from 'react-native-camera';
import BarcodeMask from 'react-native-barcode-mask';
import DialogInput from 'react-native-dialog-input';
import styles from './style';

const regExp = /[^0-9]/g;

export default class Main extends Component {

  state = {

    textBlocks: [],
    hasDetected: false,
    isDialogVisible: false,
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
        <BarcodeMask width={300} height={100} showAnimatedLine={false} edgeBorderWidth={0.7}/>
        <DialogInput isDialogVisible={this.state.isDialogVisible}
                     title={"תקן אותי"}
                     message={"הזן מספר לוחית רישוי"}
                     hintInput={"למשל: 01234567"}
                     textInputProps={{autoCorrect: false}}
                     submitInput={(inputText) => {
                       this.setState({isDialogVisible: false});
                       this.exitAfterScan(inputText);
                     }}
                     cancelText={"בטל"}
                     submitText={"העתק ללוח"}
                     closeDialog={() => {
                       this.setState({isDialogVisible: false});
                       this.camera.resumePreview();
                       this.setState({hasDetected: false});
                     }}>
        </DialogInput>
      </RNCamera>
    );
  }

  renderTextBlocks = () => (
    <View style={styles.facesContainer} pointerEvents="none">
      {this.state.textBlocks.map(this.renderTextBlock)}
    </View>
  );

  renderTextBlock = ({bounds, value}) => (
    <React.Fragment key={value + bounds.origin.x + bounds.origin.y}>
      <Text style={[styles.textBlock, {left: bounds.origin.x, top: bounds.origin.y}]}>
        {(value.replace(regExp, '').length === 7 || value.replace(regExp, '').length === 8) ? value.replace(regExp, '') : ''}
      </Text>
      {(value.replace(regExp, '').length === 7 || value.replace(regExp, '').length === 8) && <View
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
    this.setState({textBlocks: textBlocks.map(this.extractNumbers)})
  };

  exitAfterScan = (value) => {
    this.copyToClipboard(value);
    const thanksMessage = 'תודה. לוחית הרישוי הועתקה ללוח בהצלחה.';
    alert(thanksMessage);
    this.sleep(2000);
    this.setState({hasDetected: false});
    this.camera.resumePreview();
    BackHandler.exitApp();
  }
  extractNumbers = (item) => {
    const v = item.value.replace(regExp, '')
    if ((v.length === 7 || v.length === 8) && !this.state.hasDetected) {
      this.setState({hasDetected: true}, () => {
        this.licensePlateDetected(v);
      });
    }
    return item
    //}
  }

  sleep(milliseconds) {
    let start = new Date().getTime();
    for (let i = 0; i < 1e7; i++) {
      if ((new Date().getTime() - start) > milliseconds) {
        break;
      }
    }
  }

  copyToClipboard = (value) => {

    Clipboard.setString(value);
  }

  licensePlateDetected = (value) => {

    console.log(value);
    this.camera.pausePreview();
    const beforeId = 'המספר שזוהה: ';
    const afterId = '. האם המספר מתאים?'
    Alert.alert(
      'לוחית רישוי זוהתה',
      beforeId + value + afterId,
      [
        {
          text: 'לא, אני רוצה לשנות',
          onPress: () => {
            this.setState({isDialogVisible: true})
          },
          style: 'cancel',
        },
        {
          text: 'כן, העתק ללוח',
          onPress: () => {
            this.exitAfterScan(value.toString());
          },
          style: 'cancel',
        },

      ],
      {cancelable: false},
    );
  }
}
