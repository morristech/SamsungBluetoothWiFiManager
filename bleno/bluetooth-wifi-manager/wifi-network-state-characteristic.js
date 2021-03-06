/**
 * Created by nherriot on 05/06/18.
 */

var util = require('util');
var bleno = require('bleno');
const wifi = require('./wifi-controller');
var BlenoCharacteristic = bleno.Characteristic;

const constants = require('./config/constants');


var ActiveNetworkStateCharacteristic = function() {
  ActiveNetworkStateCharacteristic.super_.call(this, {
    uuid: constants.WIFI_NETWOKR_STATE_UUID,
    properties: ['read', 'notify'],
    descriptors: [
      new bleno.Descriptor({
        uuid: '2901',
        value: 'The current network state: e.g. CONNECTED, IP Address, DNS Name'
      })
    ],
    value: null
  });

  // we need to load our wifi SSID from the wifiService object when creating our bluetooth characteristic
  console.log('ActiveNetworkStateCharacteristic states are: ' + wifi.wifiService.wpaStatus + " and the IP: " + wifi.wifiService.ip );
  if (typeof wifi.wifiService.ip !=='undefined' && wifi.wifiService.ip !== null) {	  
	  this._value2 = new Buffer.from(wifi.wifiService.ip);
  } else {
	 this._value2 = new Buffer.from('127.0.0.1');
	 console.log('ActiveNetworkStateCharacteristic wifiIP is being set to "127.0.0.1". There is no IP at the moment.'); 
  }	
  
  this._value = new Buffer.from(wifi.wifiService.wpaStatus);
  this._value3 = new Buffer.from('loclahost.local');
  this._updateValueCallback = null;
};


util.inherits(ActiveNetworkStateCharacteristic, BlenoCharacteristic);


ActiveNetworkStateCharacteristic.prototype.onReadRequest = function(offset, callback) {
  var result = this.RESULT_SUCCESS;
  // TODO - maybe refactor this to have the BLE functions check directly the wifi state rather than have a wifi manager do it.
  // Before we send values over bluetooth - check there are no changes since last time with the wifi manager. This is a fudge that has
  // been added to get round the issues when WiFi and Network components settle after changes.
  if (typeof wifi.wifiService.ip !=='undefined' && wifi.wifiService.ip !== null) {
    if (this._value != wifi.wifiService.wpaStatus) {
      console.log('WARNING! ActiveNetworkStateCharacteristic state is: ' + this._value + ' but the wifi manager has it as: ' + wifi.wifiService.wpaStatus + ' updating BLE values');
      this._value = wifi.wifiService.wpaStatus;
    }
    if (this._value2 != wifi.wifiService.ip) {
      console.log('WARNING! ActiveNetworkStateCharacteristic state is: ' + this._value2 + ' but the wifi manager has it as: ' + wifi.wifiService.ip + ' updating BLE values');
      this._value2 = wifi.wifiService.ip;
    }

  } else {
    this._value2 = new Buffer.from('127.0.0.1');
	  console.log('ActiveNetworkStateCharacteristic wifiIP is being set to "127.0.0.1". There is no IP at the moment.');
  }

  console.log('Active Network State Characteristic - onReadRequest: value = ' + this._value + ' and value2 = ' + this._value2);

  // Take our objects local variable _value and _value2 and pass into a buffer to be used by the bluetooth stack.
  // _value should be our network state and _value2 should be our IP address.
  let networkState = this._value + ',' + this._value2;
  let data = new Buffer(networkState, 'utf-8');
  // currently the bluetooth stack ingests about 22 octets at a time. if we have not ingested all our octets we should
  // return success and take 22 away from the start of our buffer. The 'offset' value is the amount of octets we have
  // already sent.
  if (offset > data.length) {
    result = this.RESULT_INVALID_OFFSET;
  }  else {
    data = data.slice(offset);
  }

  callback(result, data);
};


ActiveNetworkStateCharacteristic.prototype.onWriteRequest = function(data, offset, withoutResponse, callback) {
  let result = this.RESULT_SUCCESS;

  console.log('onWriteRequest Network State data -> ' + data);
  console.log('Nothing to be done....');

  if (this._updateValueCallback) {
    console.log('Active Network State Characteristic - onWriteRequest: notifying');
    this._updateValueCallback(this._value);
  }
  callback(result);
};


ActiveNetworkStateCharacteristic.prototype.onSubscribe = function(maxValueSize, updateValueCallback) {
  console.log('Active Network State Characteristic - onSubscribe');
  this._updateValueCallback = updateValueCallback;
};


ActiveNetworkStateCharacteristic.prototype.onUnsubscribe = function() {
  console.log('Active Network State Characteristic - onUnsubscribe');
  this._updateValueCallback = null;
};


module.exports = ActiveNetworkStateCharacteristic;
