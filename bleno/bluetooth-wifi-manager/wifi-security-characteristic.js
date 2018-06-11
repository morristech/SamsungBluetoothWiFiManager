/**
 * Created by nherriot on 06/06/18.
 */


var util = require('util');
var bleno = require('bleno');
var BlenoCharacteristic = bleno.Characteristic;

const constants = require('./constants');


var WiFiSecurityCharacteristic = function() {
  WiFiSecurityCharacteristic.super_.call(this, {
    uuid: constants.WIFI_SECURITY_UUID,
    properties: ['read'],
    descriptors: [
      new bleno.Descriptor({
        uuid: '2901',
        value: 'This is a list of encryption settings you can set for your WiFi network. e.g. WEP, LEAP, WPA 128bit....'
      })
    ],
    value: null
  });

  //this._value = new Buffer(0);
  var myEnc = JSON.stringify(constants.WiFiEncryptionValues.security);
  //console.log("Encryption is: " + myEnc);
  //this._value = new Buffer.from(myEnc);
  this._value = '["NONE","WEP 128b ASCii","WEP 128b Pasephrase","LEAP","WEP","WPA2 Personal","WPA2 Enterprise"]';
  console.log("Encryption is :  " + this._value);
  this._updateValueCallback = null;
};

util.inherits(WiFiSecurityCharacteristic, BlenoCharacteristic);


WiFiSecurityCharacteristic.prototype.onReadRequest = function(offset, callback) {
  //console.log('WiFi Encryption Characteristic - onReadRequest: HEX value = ' + this._value.toString('hex'));
  //console.log('WiFi Encryption Characteristic - onReadRequest: value = ' + this._value);
  console.log('offset is : ' + offset);
  var data = new Buffer('0123456789 1123456789 2123456789 3123456789 4123456789 5123456789 6123456789 7123456789 81234567890 9123456789 0123456789', 'utf-8');
  console.log('data length is: ' + data.length);

  if (offset > data.length) {
    callback(this.RESULT_INVALID_OFFSET, null);
  } else {

  //var data = new Buffer('["NONE","WEP 128b ASCii","WEP 128b Pasephrase","LEAP","WEP","WPA2 Personal","WPA2 Enterprise"]', 'utf-8')
  //var mystrsize = this._value.length;
  //var data2 = new Buffer(mystrsize);
    data = data.slice(offset);

    callback(this.RESULT_SUCCESS, data);
  }
};


WiFiSecurityCharacteristic.prototype.onWriteRequest = function(data, offset, withoutResponse, callback) {
  this._value = data;

  console.log('WiFi Encryption Characteristic - onWriteRequest: value = ' + this._value);

  if (this._updateValueCallback) {
    console.log('WiFi Encryption Characteristic - onWriteRequest: notifying');

    this._updateValueCallback(this._value);
  }

  callback(this.RESULT_SUCCESS);
};


WiFiSecurityCharacteristic.prototype.onSubscribe = function(maxValueSize, updateValueCallback) {
  console.log('WiFi Encryption Characteristic - onSubscribe');

  this._updateValueCallback = updateValueCallback;
};

WiFiSecurityCharacteristic.prototype.onUnsubscribe = function() {
  console.log('WiFi Encryption Characteristic - onUnsubscribe');

  this._updateValueCallback = null;
};


module.exports = WiFiSecurityCharacteristic;
