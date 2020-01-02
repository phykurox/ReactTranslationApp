import React, { Component } from 'react';
//import * as Permissions from 'expo-permissions';
import { View, Text, Button, Picker, TouchableHighlight, StyleSheet, Image, FlatList, Platform, ActivityIndicator, Dimensions, AppRegistry } from 'react-native';
import Voice from 'react-native-voice';
import getEnvVars from '../env';
import { PowerTranslator, ProviderTypes, TranslatorConfiguration, TranslatorFactory } from 'react-native-power-translator';
import Tts from 'react-native-tts';
import _ from 'lodash'; 



const { AZURE_KEY } = getEnvVars();

class MainScreen extends Component {
    constructor(props) {
        super(props)
        this.state = {
           recognized: '',
           started: '',
           results: [],
           end: '',
           partialResults: [],
           top: 'en-US',
           translateLang: 'en-US',
           pResult: '',
           selectedVoice: null,
           voices: [],
       };
            
        Voice.onSpeechStart = this.onSpeechStart.bind(this)
        Voice.onSpeechPartialResults = this.onSpeechPartialResults;
        Voice.onSpeechEnd = this.onSpeechEnd; 
        Tts.getInitStatus().then(this.initTts);
    }

     /*  Utility functions for Speech to Text:  */
    
     // To check for recording specch 
    onSpeechStart(e) {
        this.setState({
        started: '√',
        });
    }
    
    // To check for end of speech
    onSpeechEnd = e => {
      // eslint-disable-next-line
      console.log('onSpeechEnd: ', e);
      this.setState({
        end: '√',
      });
    };

    // Returns a string of result from specch
    onSpeechPartialResults = e => {
      // eslint-disable-next-line
      console.log('onSpeechPartialResults: ', e.value.toString());
      this.setState({
        partialResults: e.value,
        pResult: e.value.toString()
      });
    };

    // Check for start of recording speech
    _startRecognizing = async () => {
      this.setState({
        recognized: '',
        started: '',
        results: [],
        partialResults: [],
        end: '',
      });
      try {
        await Voice.start(`${this.state.top}`);
      } catch (e) {
        console.error(e);
      }
    }

    // Check for ending of recording speech
    _stopRecognizing = async () => {
      this.setState({
        end: '√',
      });
      try {
        await Voice.stop();
      } catch (e) {
        //eslint-disable-next-line
        console.error(e);
      }
    };
    
    // For selection of Languages
    updateLang = (top) => {
        this.setState({ top: top })
    }

    updateLangtwo = (btm) => {
      this.setState({ translateLang: btm })
      this.initTts()
  }

    /*Utility Functions for Translation and TTS*/
    // Gets translated text for TTS
    handleTranslate = () => {
      const translator = TranslatorFactory.createTranslator();
      translator.translate(this.state.pResult).then(translated => {
          Tts.getInitStatus().then(() => {
              Tts.speak(translated);
              console.log(this.state.pResult)
          });
          Tts.stop();
      }, (err) => {
        if (err.code === 'no_engine') {
          Tts.requestInstallEngine();
        }});
    }

    // List available TTS voices based on selected language
    initTts = async () => {
      const voices = await Tts.voices();
      const availableVoices = voices
        .filter(v => !v.networkConnectionRequired && !v.notInstalled)
        .map(v => {
          return { id: v.id, name: v.name, language: v.language };
        });
      const listAllLang = _.mapValues(_.groupBy(availableVoices, 'language'))
      const listLang = listAllLang[`${this.state.translateLang}`]
      let selectedVoice = null;
      if (listLang && listLang.length > 0) {
        selectedVoice = listLang[0].id;
        try {
          await Tts.setDefaultLanguage(listLang[0].language);
        } catch (err) {
          //Samsung S9 has always this error: "Language is not supported"
          console.log(`setDefaultLanguage error `, err);
        }
        await Tts.setDefaultVoice(listLang[0].id);
        this.setState({
          voices: listLang,
          selectedVoice,
        });
      }
    };

    //Sets the voice upon selecting
    onVoicePress = async voice => {
      try {
        await Tts.setDefaultLanguage(voice.language);
      } catch (err) {
        // My Samsung S9 has always this error: "Language is not supported"
        console.log(`setDefaultLanguage error `, err);
      }
      await Tts.setDefaultVoice(voice.id);
      this.setState({ selectedVoice: voice.id });
    };
   
    //Create buttons for TTS voices
    renderVoiceItem = ({ item }) => {
      return (
        <Button
          title={`${item.language} - ${item.name || item.id}`}
          color={this.state.selectedVoice === item.id ? undefined : '#969696'}
          onPress={() => this.onVoicePress(item)}
        />
      );
    };


    render () {
      TranslatorConfiguration.setConfig(ProviderTypes.Microsoft, AZURE_KEY, this.state.translateLang);
        return (
          <View>
            <Text style={styles.stat}>{`Started: ${this.state.started}`}</Text>
            <Text style={styles.stat}>{`End: ${this.state.end}`}</Text>
            <View style={styles.toprow}>
              <View style={styles.row}>
                <Picker style={styles.button} selectedValue = {this.state.top} onValueChange = {this.updateLang}>
                  <Picker.Item label = "English" value = "en-US" />
                  <Picker.Item label = "Chinese Simplified" value = "zh_CN" />
                  <Picker.Item label = "Japanese" value = "ja-JP" />
                  <Picker.Item label = "Thai" value = "th-TH" />
                  <Picker.Item label = "Korean" value = "ko-KR" />
                  <Picker.Item label = "Malay" value = "ms-MY" />
                </Picker>
              </View>
              <View style={styles.row}>
              <TouchableHighlight onPress={this._startRecognizing.bind(this)} >
                <Image style={styles.rec} source={require('../img/button.png')} />
              </TouchableHighlight>
              </View>
              <View style={styles.row}>
              <TouchableHighlight onPress={this._stopRecognizing.bind(this)} >
                <Image style={styles.rec} source={require('../img/stop.png')} />
              </TouchableHighlight>
              </View>
            </View>
            <View style={styles.topcontainer}>
            {this.state.partialResults.map((result, index) => {
              return (
                <Text style={styles.transcript} key={index}>{result}</Text>
              )})}
            </View>
            <View style={styles.secrow}>
              <View style={styles.toprow}>
                <View style={styles.row}>
                  <Text>Translate to: </Text>
                  <Picker style={styles.button} selectedValue = {this.state.translateLang} onValueChange = {this.updateLangtwo}>
                    <Picker.Item label = "English" value = "en-US" />
                    <Picker.Item label = "Chinese Simplified" value = "zh-CN" />
                    <Picker.Item label = "Japanese" value = "ja-JP" />
                    <Picker.Item label = "Thai" value = "th-TH" />
                    <Picker.Item label = "Korean" value = "ko-KR" />
                  </Picker>
                </View>
                <View style={styles.row}>
                  <Button style={styles.button}
                  onPress={this.handleTranslate}
                  title="Speak">
                  </Button>
                </View>
              </View>
            </View>
            <View style={styles.btmcontainer}>
            <PowerTranslator style={styles.transcript} text={this.state.pResult} />
            </View>
            <View>
            <Text style={styles.stat}>Select your preferred voice:</Text>
              <FlatList
                style={{ width: '100%', marginTop: 5 }}
                keyExtractor={item => item.id}
                renderItem={this.renderVoiceItem}
                extraData={this.state.selectedVoice}
                data={this.state.voices}
              />
            </View>
          </View>
          
        );
    }
}

const styles = StyleSheet.create({
  topcontainer: {
    alignItems: 'center',
    marginTop: 45,
    padding: 20,
    borderWidth: 0.5,
    borderRadius: 10
  },
  btmcontainer: {
    alignItems: 'center',
    marginTop: 55,
    padding: 20,
    borderWidth: 0.5,
    borderRadius: 10
  },
  transcript: {
    textAlign: 'center',
    color: '#B0171F',
    marginBottom: 1,
    },
  row: {
    width: '40%',
    height: 40
  },
  button: {
    padding: 20,
    width: '100%',
    height: 40
  },
  rec: {
    marginTop: -5,
    width: 50,
    height: 50,
  },
  toprow: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    marginTop: 20
  },
  stat: {
    color: '#B0171F',
    marginBottom: 1,
  },
  });

AppRegistry.registerComponent('VoiceNative', () => VoiceNative);

export default MainScreen