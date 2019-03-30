import React, {Component} from 'react';
import {Text, View, BackHandler, Clipboard, ToastAndroid} from 'react-native';
import {RNCamera} from 'react-native-camera';
import BarcodeMask from 'react-native-barcode-mask';
import DialogInput from 'react-native-dialog-input';
import styles from './style';
import AwesomeAlert from 'react-native-awesome-alerts';


const regExp = /[^0-9]/g;
const beforeId = 'המספר שזוהה: ';
const afterId = '. האם המספר מתאים?';

export default class Main extends Component {


  state = {

    textBlocks: [],
    hasDetected: false,
    isDialogVisible: false,
    showAlert: false,
    hasCanceled: false,
    value: null,
  };
  ss
  showAlert = () => {
    this.setState({
      showAlert: true
    });
  };

  hideAlert = () => {
    this.setState({
      showAlert: false
    });
  };

  render() {

    const {showAlert} = this.state;

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
        <BarcodeMask width={330} height={200} showAnimatedLine={false} edgeBorderWidth={0.7}/>
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
                       this.setState({value: null});
                     }}>
        </DialogInput>
        <AwesomeAlert
          show={showAlert}
          showProgress
          title="זוהתה לוחית רישוי"
          message={beforeId + this.state.value + afterId}
          closeOnTouchOutside={false}
          closeOnHardwareBackPress={true}
          showCancelButton={true}
          showConfirmButton={true}
          cancelText="לא, אני רוצה לשנות"
          confirmText="כן, העתק ללוח"
          confirmButtonColor="#03A9F4"
          progressColor="#03A9F4"
          onCancelPressed={() => {
            this.hideAlert();
            this.setState({hasCanceled: true});
            this.setState({isDialogVisible: true});
          }}
          onConfirmPressed={() => {
            this.hideAlert();
            this.exitAfterScan();
          }}
          onDismiss={() => {
            if(!this.state.hasCanceled) {
              this.hideAlert();
              this.setState({isDialogVisible: false});
              this.camera.resumePreview();
              this.setState({hasDetected: false}, () => {
                this.setState({value: null});
                this.setState({hasCanceled: false});
              });
            }
          }}
        />
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

  exitAfterScan = () => {
    this.copyToClipboard(this.state.value);
    const completeMessage = 'לוחית הרישוי הועתקה ללוח בהצלחה';
    ToastAndroid.show(completeMessage, ToastAndroid.LONG);
    this.setState({hasDetected: false});
    this.sleep(2000);
    this.camera.resumePreview();
    this.setState({value: null});
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
    this.setState({ value });
    this.camera.pausePreview();
    this.showAlert();
    // const beforeId = 'המספר שזוהה: ';
    // const afterId = '. האם המספר מתאים?';
    /*Alert.alert(
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
    );*/
  }
}
