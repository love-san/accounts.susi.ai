// Packages
import React, { Component } from 'react';
import RaisedButton from 'material-ui/RaisedButton';
import PropTypes from 'prop-types';
import Cookies from 'universal-cookie';
import $ from 'jquery';

// Components
import TextField from 'material-ui/TextField';
import StaticAppBar from '../StaticAppBar/StaticAppBar';
import Paper from 'material-ui/Paper';
import Footer from '../Footer/Footer.react.js';
import Toggle from 'material-ui/Toggle';
import Dialog from 'material-ui/Dialog';
import Close from 'material-ui/svg-icons/navigation/close';
import SwipeableViews from 'react-swipeable-views';
import TableComplex from '../TableComplex/TableComplex.react';
import RemoveDeviceDialog from '../TableComplex/RemoveDeviceDialog.react';
import { GoogleApiWrapper } from 'google-maps-react';
import MapContainer from '../MapContainer/MapContainer.react';
import TimezonePicker from 'react-timezone';
import DropDownMenu from 'material-ui/DropDownMenu';
import countryData from 'country-data';
import MenuItem from 'material-ui/MenuItem';
import Menu from 'material-ui/Menu';
import ChevronRight from 'material-ui/svg-icons/navigation/chevron-right';
import { RadioButton, RadioButtonGroup } from 'material-ui/RadioButton';
import { Link } from 'react-router-dom';
import ChangePassword from '../Auth/ChangePassword/ChangePassword.react';
import * as Actions from '../../actions/';

// Keys
import { MAP_KEY } from '../../../src/config.js';

// Icons
import ChatIcon from 'material-ui/svg-icons/communication/chat';
import ThemeIcon from 'material-ui/svg-icons/action/invert-colors';
import VoiceIcon from 'material-ui/svg-icons/action/settings-voice';
import SpeechIcon from 'material-ui/svg-icons/action/record-voice-over';
import AccountIcon from 'material-ui/svg-icons/action/account-box';
import LockIcon from 'material-ui/svg-icons/action/lock';
import MyDevices from 'material-ui/svg-icons/device/devices';
import MobileIcon from 'material-ui/svg-icons/hardware/phone-android';

import 'antd/dist/antd.css';
import './Settings.css';
import { urls, isProduction } from '../../Utils';

const cookieDomain = isProduction() ? '.susi.ai' : '';

const cookies = new Cookies();
const token = cookies.get('loggedIn');
const url = `${urls.API_URL}/aaa/listUserSettings.json?access_token=` + token;

class Settings extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dataFetched: false,
      deviceData: false,
      obj: [],
      mapObj: [],
      devicenames: [],
      rooms: [],
      macids: [],
      editIdx: -1,
      removeDevice: -1,
      slideIndex: 0,
      centerLat: 0,
      centerLng: 0,
      showRemoveConfirmation: false,

      selectedSetting: 'Account',
      UserName: '',
      PrefLanguage: 'en-US',
      TimeZone: '',
      countryCode: '',
      CountryDialCode: '',
      PhoneNo: '',
      EnterAsSend: true,
      MicInput: false,
      theme: 'light',
      SpeechOutput: true,
      SpeechOutputAlways: true,
      settingsChanged: false,
      voiceList: [
        {
          lang: 'am-AM',
          name: 'Armenian',
        },
        {
          lang: 'zh-CH',
          name: 'Chinese',
        },
        {
          lang: 'de-DE',
          name: 'Deutsch',
        },
        {
          lang: 'gr-GR',
          name: 'Greek',
        },
        {
          lang: 'hi-IN',
          name: 'Hindi',
        },
        {
          lang: 'pb-IN',
          name: 'Punjabi',
        },
        {
          lang: 'np-NP',
          name: 'Nepali',
        },
        {
          lang: 'ru-RU',
          name: 'Russian',
        },
        {
          lang: 'es-SP',
          name: 'Spanish',
        },
        {
          lang: 'fr-FR',
          name: 'French',
        },
        {
          lang: 'jp-JP',
          name: 'Japanese',
        },
        {
          lang: 'nl-NL',
          name: 'Dutch',
        },
        {
          lang: 'en-US',
          name: 'US English',
        },
      ],
    };
  }

  handleRemove = i => {
    let data = this.state.obj;
    let macid = data[i].macid;

    this.setState({
      obj: data.filter((row, j) => j !== i),
    });

    $.ajax({
      url:
        `${urls.API_URL}/aaa/removeUserDevices.json?macid=` +
        macid +
        '&access_token=' +
        cookies.get('loggedIn'),
      dataType: 'jsonp',
      crossDomain: true,
      timeout: 3000,
      async: false,
      success: function(response) {
        console.log(response);
      },
      error: function(errorThrown) {
        console.log(errorThrown);
      },
      complete: function(jqXHR, textStatus) {
        window.location.reload();
      },
    });
  };

  startEditing = i => {
    this.setState({ editIdx: i });
  };

  stopEditing = i => {
    let data = this.state.obj;
    let macid = data[i].macid;
    let devicename = data[i].devicename;
    let room = data[i].room;
    let latitude = data[i].latitude;
    let longitude = data[i].longitude;
    let devicenames = this.state.devicenames;
    devicenames[i] = devicename;
    let rooms = this.state.rooms;
    rooms[i] = room;
    this.setState({
      editIdx: -1,
      devicenames: devicenames,
      rooms: rooms,
    });

    $.ajax({
      url:
        `${urls.API_URL}/aaa/addNewDevice.json?macid=` +
        macid +
        '&name=' +
        devicename +
        '&room=' +
        room +
        '&latitude=' +
        latitude +
        '&longitude=' +
        longitude +
        '&access_token=' +
        cookies.get('loggedIn'),
      dataType: 'jsonp',
      crossDomain: true,
      timeout: 3000,
      async: false,
      success: function(response) {
        console.log(response);
      },
      error: function(errorThrown) {
        console.log(errorThrown);
      },
    });
  };

  handleChange = (e, name, i) => {
    const value = e.target.value;
    let data = this.state.obj;
    this.setState({
      obj: data.map((row, j) => (j === i ? { ...row, [name]: value } : row)),
    });
  };

  handleTabSlide = value => {
    this.setState({
      slideIndex: value,
    });
  };

  apiCall = () => {
    $.ajax({
      url: url,
      type: 'GET',
      dataType: 'jsonp',
      statusCode: {
        404: function(xhr) {
          if (window.console) {
            console.log(xhr.responseText);
          }
          console.log('Error 404: Resources not found!');
          document.location.reload();
        },
        503: function(xhr) {
          if (window.console) {
            console.log(xhr.responseText);
          }
          console.log('Error 503: Server not responding!');
          document.location.reload();
        },
      },
      crossDomain: true,
      timeout: 3000,
      async: false,
      success: function(response) {
        if (
          response.settings.prefLanguage !== '' &&
          response.settings.prefLanguage !== undefined
        ) {
          this.setState({
            PrefLanguage: response.settings.prefLanguage,
          });
        }
        /* eslint-disable */
        response.settings.enterAsSend =
          response.settings.enterAsSend === 'false' ? false : true;
        response.settings.micInput =
          response.settings.micInput === 'false' ? false : true;
        response.settings.speechOutput =
          response.settings.speechOutput === 'false' ? false : true;
        response.settings.speechOutputAlways =
          response.settings.speechOutputAlways === 'false' ? false : true;
        /* eslint-enable */
        this.setState({
          dataFetched: true,
          UserName: response.settings.userName,
          TimeZone: response.settings.timeZone,
          countryCode: response.settings.countryCode,
          CountryDialCode: response.settings.countryDialCode,
          PhoneNo: response.settings.phoneNo,
          EnterAsSend: response.settings.enterAsSend,
          MicInput: response.settings.micInput,
          theme: response.settings.theme,
          SpeechOutput: response.settings.speechOutput,
          SpeechOutputAlways: response.settings.speechOutputAlways,
        });

        let obj = [];
        let mapObj = [];
        let devicenames = [];
        let rooms = [];
        let macids = [];
        let centerLat = 0;
        let centerLng = 0;
        if (response.devices) {
          let keys = Object.keys(response.devices);
          let devicesNotAvailable = 0;
          keys.forEach(i => {
            let myObj = {
              macid: i,
              devicename: response.devices[i].name,
              room: response.devices[i].room,
              latitude: response.devices[i].geolocation.latitude,
              longitude: response.devices[i].geolocation.longitude,
            };
            let locationData = {
              lat: parseFloat(response.devices[i].geolocation.latitude),
              lng: parseFloat(response.devices[i].geolocation.longitude),
            };
            if (
              myObj.latitude === 'Latitude not available.' ||
              myObj.longitude === 'Longitude not available.'
            ) {
              devicesNotAvailable++;
            } else {
              centerLat += parseFloat(response.devices[i].geolocation.latitude);
              centerLng += parseFloat(
                response.devices[i].geolocation.longitude,
              );
            }

            let location = {
              location: locationData,
            };
            obj.push(myObj);
            mapObj.push(location);
            devicenames.push(response.devices[i].name);
            rooms.push(response.devices[i].room);
            macids.push(i);
            this.setState({
              dataFetched: true,
            });
          });
          centerLat /= mapObj.length - devicesNotAvailable;
          centerLng /= mapObj.length - devicesNotAvailable;
          if (obj.length) {
            this.setState({
              deviceData: true,
              obj: obj,
            });
          }
          if (mapObj.length) {
            this.setState({
              mapObj: mapObj,
              centerLat: centerLat,
              centerLng: centerLng,
              devicesNotAvailable: devicesNotAvailable,
            });
          }
          if (devicenames.length) {
            this.setState({
              devicenames: devicenames,
            });
          }
          if (rooms.length) {
            this.setState({
              rooms: rooms,
            });
          }
          if (macids.length) {
            this.setState({
              macids: macids,
            });
          }
        }
      }.bind(this),
      error: function(errorThrown) {
        console.log(errorThrown);
      },
    });
  };

  populateVoiceList = () => {
    let voices = this.state.voiceList;
    let langCodes = [];
    let voiceMenu = voices.map((voice, index) => {
      langCodes.push(voice.lang);
      return (
        <MenuItem
          value={voice.lang}
          key={index}
          primaryText={voice.name + ' (' + voice.lang + ')'}
        />
      );
    });
    let currLang = this.state.PrefLanguage;
    let voiceOutput = {
      voiceMenu: voiceMenu,
      voiceLang: currLang,
    };
    // `-` and `_` replacement check of lang codes
    if (langCodes.indexOf(currLang) === -1) {
      if (
        currLang.indexOf('-') > -1 &&
        langCodes.indexOf(currLang.replace('-', '_')) > -1
      ) {
        voiceOutput.voiceLang = currLang.replace('-', '_');
      } else if (
        currLang.indexOf('_') > -1 &&
        langCodes.indexOf(currLang.replace('_', '-')) > -1
      ) {
        voiceOutput.voiceLang = currLang.replace('_', '-');
      }
    }
    return voiceOutput;
  };

  handleSave = () => {
    let newEnterAsSend = this.state.EnterAsSend;
    let newMicInput = this.state.MicInput;
    let newSpeechOutput = this.state.SpeechOutput;
    let newSpeechOutputAlways = this.state.SpeechOutputAlways;
    let newUserName = this.state.UserName;
    let newPrefLanguage = this.state.PrefLanguage;
    let newTimeZone = this.state.TimeZone;
    let newCountryCode = this.state.countryCode;
    let newCountryDialCode = this.state.CountryDialCode;
    let newPhoneNo = this.state.PhoneNo;
    let newTheme = this.state.theme;
    let vals = {
      enterAsSend: newEnterAsSend,
      micInput: newMicInput,
      speechOutput: newSpeechOutput,
      speechOutputAlways: newSpeechOutputAlways,
      userName: newUserName,
      prefLanguage: newPrefLanguage,
      timeZone: newTimeZone,
      countryCode: newCountryCode,
      countryDialCode: newCountryDialCode,
      phoneNo: newPhoneNo,
      theme: newTheme,
    };
    // Trigger Actions to save the settings in stores and server
    this.implementSettings(vals);
    let userName = vals.userName;
    cookies.set('username', userName, {
      path: '/',
      domain: cookieDomain,
    });
  };

  // Store the settings in server
  implementSettings = values => {
    Actions.pushSettingsToServer(values);
    this.setState({ settingsChanged: false });
    this.props.history.push('/settings', { showLogin: true });
  };

  // Open Remove Device Confirmation dialog
  handleRemoveConfirmation = i => {
    let data = this.state.obj;
    let devicename = data[i].devicename;
    this.setState({
      showRemoveConfirmation: true,
      showForgotPassword: false,
      showLogin: false,
      showOptions: false,
      removeDevice: i,
      removeDeviceName: devicename,
    });
  };

  handleClose = () => {
    this.setState({
      showRemoveConfirmation: false,
    });
  };

  handleUserName = event => {
    this.setState({
      UserName: event.target.value,
      settingsChanged: true,
    });
  };

  handlePrefLang = (event, index, value) => {
    this.setState({
      PrefLanguage: value,
      settingsChanged: true,
    });
  };

  handleTimeZone = value => {
    this.setState({
      TimeZone: value,
      settingsChanged: true,
    });
  };
  handleEnterAsSend = (event, isInputChecked) => {
    this.setState({
      EnterAsSend: isInputChecked,
      settingsChanged: true,
    });
  };

  handleNewTextToSpeech = settings => {
    this.setState({
      speechRate: settings.speechRate,
      speechPitch: settings.speechPitch,
      ttsLanguage: settings.ttsLanguage,
      settingsChanged: true,
    });
  };

  handleMicInput = (event, isInputChecked) => {
    this.setState({
      MicInput: isInputChecked,
      settingsChanged: true,
    });
  };

  handleSpeechOutput = (event, isInputChecked) => {
    this.setState({
      SpeechOutput: isInputChecked,
      settingsChanged: true,
    });
  };

  handleSpeechOutputAlways = (event, isInputChecked) => {
    this.setState({
      SpeechOutputAlways: isInputChecked,
      settingsChanged: true,
    });
  };

  handleCountryChange = (event, index, value) => {
    this.setState({
      countryCode: value,
      settingsChanged: true,
      countryDialCode:
        countryData.countries[value ? value : 'US'].countryCallingCodes[0],
    });
  };
  handleSelectChange = (event, value) => {
    this.setState({
      theme: value,
      settingsChanged: true,
    });
  };

  handlePhoneNo = event => {
    const re = /^[0-9\b]+$/;
    if (event.target.value === '' || re.test(event.target.value)) {
      this.setState({
        PhoneNo: event.target.value,
        settingsChanged: true,
      });
    }
  };

  loadSettings = (e, value) => {
    this.setState({
      selectedSetting: window.innerWidth > 1112 ? value : e.target.innerText,
    });
  };
  render() {
    countryData.countries.all.sort(function(a, b) {
      if (a.name < b.name) {
        return -1;
      }
      if (a.name > b.name) {
        return 1;
      }
      return 0;
    });
    let countries = countryData.countries.all.map((country, i) => {
      if (countryData.countries.all[i].countryCallingCodes[0]) {
        return (
          <MenuItem
            value={countryData.countries.all[i].alpha2}
            key={i}
            primaryText={
              countryData.countries.all[i].name +
              ' ' +
              countryData.countries.all[i].countryCallingCodes[0]
            }
          />
        );
      }
      return null;
    });

    let voiceOutput = this.populateVoiceList();

    const fieldStyle = {
      height: '35px',
      borderRadius: 4,
      border: '1px solid #ced4da',
      fontSize: 16,
      padding: '0px 12px',
      width: 'auto',
    };

    const radioIconStyle = {
      fill: '#4285f4',
    };

    const menuStyle = {
      width: '250px',
      marginLeft: '-6px',
    };

    const submitButton = {
      marginTop: '20px',
      paddingRight: 10,
    };

    const closingStyle = {
      position: 'absolute',
      zIndex: 1200,
      fill: '#444',
      width: '26px',
      height: '26px',
      right: '10px',
      top: '10px',
      cursor: 'pointer',
    };

    const blueThemeColor = { color: 'rgb(66, 133, 244)' };
    const themeBackgroundColor = '#fff';
    const themeForegroundColor = '#272727';

    const floatingLabelStyle = {
      color: '#9e9e9e',
    };

    const settingsMenuStyle = {
      marginTop: 20,
      textAlign: 'center',
      display: 'inline-block',
      backgroundColor: themeBackgroundColor,
      color: themeForegroundColor,
    };

    let currentSetting;

    if (!this.state.dataFetched && cookies.get('loggedIn')) {
      this.apiCall();
    }
    if (this.state.selectedSetting === 'Account') {
      currentSetting = (
        <div>
          <div className="tabHeading">Account</div>
          <hr className="Divider" style={{ height: '2px' }} />
          <div>
            <div className="label">User Name</div>

            <TextField
              name="userName"
              style={fieldStyle}
              value={this.state.UserName}
              onChange={this.handleUserName}
              placeholder="Enter your User Name"
              underlineStyle={{ display: 'none' }}
            />

            <div className="label">Email</div>

            <TextField
              name="email"
              style={fieldStyle}
              value={cookies.get('emailId')}
              underlineStyle={{ display: 'none' }}
            />

            <div className="label" style={{ marginBottom: '0' }}>
              Select default language
            </div>

            <DropDownMenu
              value={voiceOutput.voiceLang}
              style={{ marginLeft: '-20px' }}
              onChange={this.handlePrefLang}
            >
              {voiceOutput.voiceMenu}
            </DropDownMenu>

            <div className="label" style={{ marginBottom: '0' }}>
              Select TimeZone
            </div>
            <br />
            <TimezonePicker
              value={this.state.TimeZone}
              onChange={timezone => this.handleTimeZone(timezone)}
              inputProps={{
                placeholder: 'Select Timezone...',
                name: 'timezone',
              }}
            />
          </div>
        </div>
      );
    }

    if (this.state.selectedSetting === 'Password') {
      currentSetting = (
        <div>
          <div className="tabHeading" style={{ marginBottom: '10px' }}>
            Password
          </div>
          <hr
            className="Divider"
            style={{ height: '2px', marginBottom: '10px' }}
          />
          <ChangePassword />
        </div>
      );
    }

    if (this.state.selectedSetting === 'Devices') {
      currentSetting = (
        <span style={{ right: '40px' }}>
          <div>
            <span>
              <div
                style={{
                  marginTop: '10px',
                  marginBottom: '10px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                }}
              >
                Devices
              </div>
            </span>
            <hr
              className="Divider"
              style={{ height: '2px', marginBottom: '10px' }}
            />
            {this.state.deviceData ? (
              <div>
                <SwipeableViews>
                  <div>
                    <div style={{ overflowX: 'auto' }}>
                      <div
                        style={{
                          left: '0px',
                          marginTop: '0px',
                          width: '550px',
                        }}
                      >
                        <TableComplex
                          handleRemove={this.handleRemove}
                          handleRemoveConfirmation={
                            this.handleRemoveConfirmation
                          }
                          startEditing={this.startEditing}
                          editIdx={this.state.editIdx}
                          stopEditing={this.stopEditing}
                          handleChange={this.handleChange}
                          tableData={this.state.obj}
                        />
                      </div>
                      <div>
                        <div style={{ maxHeight: '300px', marginTop: '10px' }}>
                          <MapContainer
                            google={this.props.google}
                            mapData={this.state.mapObj}
                            centerLat={this.state.centerLat}
                            centerLng={this.state.centerLng}
                            devicenames={this.state.devicenames}
                            rooms={this.state.rooms}
                            macids={this.state.macids}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </SwipeableViews>
                {this.state.slideIndex && this.state.devicesNotAvailable ? (
                  <div style={{ marginTop: '10px' }}>
                    <b>NOTE: </b>Location info of one or more devices could not
                    be retrieved.
                  </div>
                ) : null}
              </div>
            ) : (
              <div id="subheading">
                You do not have any devices connected yet!
              </div>
            )}
          </div>
        </span>
      );
    }

    if (this.state.selectedSetting === 'ChatApp') {
      currentSetting = (
        <div>
          <div className="tabHeading">Preferences</div>
          <hr className="Divider" style={{ height: '2px' }} />
          <br />
          <div
            style={{
              float: 'left',
              padding: '0px 5px 0px 0px',
            }}
          >
            Send message by pressing ENTER
          </div>
          <Toggle
            className="settings-toggle"
            onToggle={this.handleEnterAsSend}
            labelStyle={{ color: themeForegroundColor }}
            toggled={this.state.EnterAsSend}
          />
          <br />
        </div>
      );
    }

    if (this.state.selectedSetting === 'Microphone') {
      currentSetting = '';
      currentSetting = (
        <div>
          <div>
            <div>
              <div className="tabHeading">Mic Input</div>
              <hr className="Divider" style={{ height: '2px' }} />
              <br />
              <div
                style={{
                  float: 'left',
                  padding: '0px 5px 0px 0px',
                }}
              >
                Enable mic to give voice input
              </div>
              <Toggle
                className="settings-toggle"
                labelStyle={{ color: themeForegroundColor }}
                onToggle={this.handleMicInput}
                toggled={this.state.MicInput}
              />
              <br />
            </div>
          </div>
        </div>
      );
    }

    if (this.state.selectedSetting === 'Theme') {
      currentSetting = '';
      currentSetting = (
        <div>
          <span>
            <div className="tabHeading">Select Theme</div>
            <hr className="Divider" style={{ height: '2px' }} />
          </span>
          <RadioButtonGroup
            style={{ textAlign: 'left', margin: '20px', marginBottom: '43px' }}
            onChange={this.handleSelectChange}
            name="Theme"
            valueSelected={this.state.theme}
          >
            <RadioButton
              style={{ width: '20%', display: 'block' }}
              iconStyle={radioIconStyle}
              labelStyle={{ color: themeForegroundColor }}
              value="light"
              label={<span style={{ fontSize: '16px' }}>Light</span>}
            />
            <RadioButton
              style={{ width: '20%', display: 'block', marginTop: '-1px' }}
              iconStyle={radioIconStyle}
              labelStyle={{ color: themeForegroundColor }}
              value="dark"
              label={<span style={{ fontSize: '16px' }}>Dark</span>}
            />
            <RadioButton
              style={{ width: '20%', display: 'block', marginTop: '-1px' }}
              iconStyle={radioIconStyle}
              labelStyle={{ color: themeForegroundColor }}
              value="custom"
              label={<span style={{ fontSize: '16px' }}>Custom</span>}
            />
          </RadioButtonGroup>
        </div>
      );
    }

    if (this.state.selectedSetting === 'Speech') {
      currentSetting = (
        <div>
          <div>
            <div className="tabHeading">Speech Output</div>
            <hr className="Divider" style={{ height: '2px' }} />
            <br />
            <div
              style={{
                float: 'left',
                padding: '0px 5px 0px 0px',
              }}
            >
              Enable speech output only for speech input
            </div>
            <Toggle
              className="settings-toggle"
              labelStyle={{ color: themeForegroundColor }}
              onToggle={this.handleSpeechOutput}
              toggled={this.state.SpeechOutput}
            />
            <br />
            <br />
          </div>
          <div>
            <div
              style={{
                marginTop: '10px',
                marginBottom: '0px',
                fontSize: '15px',
                fontWeight: 'bold',
              }}
            >
              Speech Output Always ON
            </div>
            <br />
            <div
              style={{
                float: 'left',
                padding: '5px 5px 0px 0px',
              }}
            >
              Enable speech output regardless of input type
            </div>
            <Toggle
              className="settings-toggle"
              labelStyle={{ color: themeForegroundColor }}
              onToggle={this.handleSpeechOutputAlways}
              toggled={this.state.SpeechOutputAlways}
            />
            <br />
            <br />
          </div>
        </div>
      );
    }

    if (this.state.selectedSetting === 'Mobile') {
      currentSetting = (
        <div style={{ marginBottom: '-2px' }}>
          <div className="tabHeading" style={{ marginTop: '8px' }}>
            Mobile
          </div>

          <div
            style={{
              marginBottom: '5px',
              fontSize: '14px',
            }}
          >
            Expand your experience, get closer, and stay current
          </div>
          <hr
            className="Divider"
            style={{ height: '2px', marginBottom: '-2px', marginTop: '8px' }}
          />
          <div>
            <div className="label" style={{ fontSize: '15px' }}>
              Add your phone number
            </div>

            <div
              style={{
                marginTop: '10px',
                fontSize: '14px',
              }}
            >
              In future, we will text a verification code to your number.
              Standard SMS fees may apply.
            </div>
            <div
              style={{
                marginTop: '10px',
                marginBottom: '0px',
                marginLeft: '0px',
                fontSize: '14px',
              }}
            >
              Country/region :
              <span style={menuStyle}>
                <DropDownMenu
                  maxHeight={300}
                  style={{
                    width: '250px',
                    position: 'relative',
                    top: '15px',
                    marginLeft: '10px',
                  }}
                  labelStyle={{ color: themeForegroundColor }}
                  menuStyle={{ backgroundColor: themeBackgroundColor }}
                  menuItemStyle={{ color: themeForegroundColor }}
                  value={this.state.countryCode ? this.state.countryCode : 'US'}
                  onChange={this.handleCountryChange}
                >
                  {countries}
                </DropDownMenu>
              </span>
            </div>
            <div
              style={{
                marginTop: '-10px',
                marginBottom: '0px',
                marginLeft: '0px',
                fontSize: '14px',
              }}
            >
              Phone number :
              <span
                style={{
                  width: '250px',
                  marginLeft: '4px',
                }}
              >
                <TextField
                  name="selectedCountry"
                  disabled={true}
                  inputStyle={{
                    color: '#333',
                  }}
                  floatingLabelStyle={floatingLabelStyle}
                  value={
                    countryData.countries[
                      this.state.countryCode ? this.state.countryCode : 'US'
                    ].countryCallingCodes[0]
                  }
                  style={{ width: '45px', marginLeft: '30px' }}
                />

                <TextField
                  name="phonenumber"
                  style={{ width: '150px', marginLeft: '5px' }}
                  onChange={this.handlePhoneNo}
                  inputStyle={{
                    color: '#333',
                  }}
                  floatingLabelStyle={floatingLabelStyle}
                  value={this.state.PhoneNo}
                  floatingLabelText="Phone number"
                />
              </span>
            </div>
          </div>
        </div>
      );
    }
    return (
      <div
        style={{
          backgroundColor: '#F2F2F2',
          position: 'absolute',
          width: '100%',
        }}
      >
        <Dialog
          className="dialogStyle"
          modal={false}
          open={this.state.showRemoveConfirmation}
          autoScrollBodyContent={true}
          contentStyle={{ width: '35%', minWidth: '300px' }}
          onRequestClose={this.handleClose}
        >
          <RemoveDeviceDialog
            {...this.props}
            deviceIndex={this.state.removeDevice}
            devicename={this.state.removeDeviceName}
            handleRemove={this.handleRemove}
          />
          <Close style={closingStyle} onTouchTap={this.handleClose} />
        </Dialog>
        <div className="app-bar" style={{ backgroundColor: '#F2F2F2' }}>
          <StaticAppBar />
        </div>

        <div className="settings-app" style={{ backgroundColor: '#F2F2F2' }}>
          <div className="navBar">
            <Paper
              className="leftMenu tabStyle"
              zDepth={1}
              style={{
                backgroundColor: '#fff',
                color: '#272727',
              }}
            >
              <div className="settings-list">
                <Menu
                  onChange={this.loadSettings}
                  selectedMenuItemStyle={blueThemeColor}
                  style={{ width: '100%' }}
                  value={this.state.selectedSetting}
                >
                  <MenuItem
                    style={{ color: themeForegroundColor }}
                    value="Account"
                    className="setting-item"
                    leftIcon={<AccountIcon />}
                  >
                    Account
                    <ChevronRight
                      style={{ color: themeForegroundColor }}
                      className="right-chevron"
                    />
                  </MenuItem>
                  <hr className="Divider" />

                  <MenuItem
                    style={{ color: themeForegroundColor }}
                    value="Password"
                    className="setting-item"
                    leftIcon={<LockIcon />}
                  >
                    Password
                    <ChevronRight
                      style={{ color: themeForegroundColor }}
                      className="right-chevron"
                    />
                  </MenuItem>
                  <hr className="Divider" />

                  <MenuItem
                    style={{ color: themeForegroundColor }}
                    value="Mobile"
                    className="setting-item"
                    leftIcon={<MobileIcon />}
                  >
                    Mobile
                    <ChevronRight
                      style={{ color: themeForegroundColor }}
                      className="right-chevron"
                    />
                  </MenuItem>
                  <hr className="Divider" />

                  <MenuItem
                    style={{ color: themeForegroundColor }}
                    value="ChatApp"
                    className="setting-item"
                    leftIcon={<ChatIcon />}
                  >
                    ChatApp
                    <ChevronRight
                      style={{ color: themeForegroundColor }}
                      className="right-chevron"
                    />
                  </MenuItem>
                  <hr className="Divider" />

                  <MenuItem
                    style={{ color: themeForegroundColor }}
                    value="Theme"
                    className="setting-item"
                    leftIcon={<ThemeIcon />}
                  >
                    Theme
                    <ChevronRight
                      style={{ color: themeForegroundColor }}
                      className="right-chevron"
                    />
                  </MenuItem>
                  <hr className="Divider" />

                  <MenuItem
                    style={{ color: themeForegroundColor }}
                    value="Microphone"
                    className="setting-item"
                    leftIcon={<VoiceIcon />}
                  >
                    Microphone
                    <ChevronRight
                      style={{ color: themeForegroundColor }}
                      className="right-chevron"
                    />
                  </MenuItem>
                  <hr className="Divider" />

                  <MenuItem
                    style={{ color: themeForegroundColor }}
                    value="Speech"
                    className="setting-item"
                    leftIcon={<SpeechIcon />}
                  >
                    Speech
                    <ChevronRight
                      style={{ color: themeForegroundColor }}
                      className="right-chevron"
                    />
                  </MenuItem>
                  <hr className="Divider" />

                  <MenuItem
                    style={{ color: themeForegroundColor }}
                    value="Devices"
                    className="setting-item"
                    leftIcon={<MyDevices />}
                  >
                    Devices
                    <ChevronRight
                      style={{ color: themeForegroundColor }}
                      className="right-chevron"
                    />
                  </MenuItem>

                  <MenuItem style={{ display: 'none' }} value="Mobile">
                    Mobile
                  </MenuItem>
                  <MenuItem style={{ display: 'none' }} value="Account">
                    Account
                  </MenuItem>
                  <hr className="Divider" />
                </Menu>
              </div>

              <div className="settings-list-dropdown">
                <DropDownMenu
                  selectedMenuItemStyle={blueThemeColor}
                  onChange={this.loadSettings}
                  value={this.state.selectedSetting}
                  labelStyle={{ color: themeForegroundColor }}
                  menuStyle={{ backgroundColor: themeBackgroundColor }}
                  menuItemStyle={{ color: themeForegroundColor }}
                  style={{ width: '100%' }}
                  autoWidth={false}
                >
                  <MenuItem
                    primaryText="Account"
                    value="Account"
                    className="setting-item"
                  />
                  <MenuItem
                    primaryText="Password"
                    value="Password"
                    className="setting-item"
                  />
                  <MenuItem
                    primaryText="Mobile"
                    value="Mobile"
                    className="setting-item"
                  />
                  <MenuItem
                    primaryText="ChatApp"
                    value="ChatApp"
                    className="setting-item"
                  />
                  <MenuItem
                    primaryText="Theme"
                    value="Theme"
                    className="setting-item"
                  />
                  <MenuItem
                    primaryText="Microphone"
                    value="Microphone"
                    className="setting-item"
                  />
                  <MenuItem
                    primaryText="Speech"
                    value="Speech"
                    className="setting-item"
                  />
                  <MenuItem
                    primaryText="Devices"
                    value="Devices"
                    className="setting-item"
                  />
                </DropDownMenu>
              </div>
            </Paper>
          </div>

          <Paper className="settings" styles={settingsMenuStyle} zDepth={1}>
            <div className="currentSettings">
              {currentSetting}
              <div style={submitButton}>
                {this.state.selectedSetting === 'Password' ||
                this.state.selectedSetting === 'Devices' ? (
                  ''
                ) : (
                  <RaisedButton
                    label="save changes"
                    backgroundColor="#4285F4"
                    labelColor="#fff"
                    disabled={!this.state.settingsChanged}
                    onTouchTap={this.handleSave}
                  />
                )}
              </div>
              {this.state.selectedSetting !== 'Account' ? (
                ''
              ) : (
                <div>
                  <hr
                    className="Divider"
                    style={{ height: '2px', marginTop: '25px' }}
                  />
                  <p
                    style={{
                      textAlign: 'center',
                      marginTop: '20px',
                      display: 'flex',
                      justifyContent: 'center',
                    }}
                  >
                    <span className="Link">
                      <Link to="/delete-account">Deactivate your account</Link>
                    </span>
                  </p>
                </div>
              )}
            </div>
          </Paper>
        </div>
        <Footer />
      </div>
    );
  }
}

Settings.propTypes = {
  history: PropTypes.object,
  location: PropTypes.object,
  google: PropTypes.object,
};

export default GoogleApiWrapper({
  apiKey: MAP_KEY,
})(Settings);
