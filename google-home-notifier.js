var Client = require('castv2-client').Client;
var DefaultMediaReceiver = require('castv2-client').DefaultMediaReceiver;
var mdns = require('mdns-js');
var browser = mdns.createBrowser(mdns.tcp('googlecast'));
var googletts = require('google-tts-api');
var googlettsaccent = 'us';
var accent = function(accent) {// what is this...?
  googlettsaccent = accent;
  return this;
}
var language = 'ja';//TODO: parameter?
const SEARCH_PERIOD_MSEC = 5 * 1000;
var nowSearching = null;
var Device = function(name, ip, port, fn){
  this.name = name;
  this.ip = ip;
  this.port = port;
  this.fn = fn;
  this.toObject = function(){
    return {
      name: this.name,
      ip: this.ip,
      port: this.port,
      fn: this.fn,
    }; 
  }
};
var Devices = [];

var _appendDevice = function(device){//Device => void
  var found = false;
  Devices.forEach(function(d){
    if(d.name === device.name){
      d.ip = device.ip;
      d.port = device.port;
      d.fn = device.fn;
      found = true;
    }
  });
  if(!found){ Devices.push(device); }
};
var _searchDevices = function(fnPattern){// Regexp => [device, ...]
  var devices = Devices.filter(function(device){
    return device.fn.match(fnPattern);
  });
  return devices;
}

var _searchAndCache = function(callback){//[Function] => void

  if(!!nowSearching){ throw new Error("already searching"); }
  
  browser.start();
  browser.on('serviceUp', function(service) {

    if(!service.name.includes("Google-Home")){ return; }

    var device = new Device(
      service.name, 
      service.addresses[0], 
      service.port,
      service.txtRecord.fn
    );
    console.log(
      'Device found:  %s (%s), %s:%d', 
      device.name, device.fn, device.ip, device.port
    );
    _appendDevice(device);
    if(callback){
      callback(device);
    }
  });
  nowSearching = setTimeout(
    function(){
      browser.stop();
      nowSearching = null;
    },
    SEARCH_PERIOD_MSEC
  );  
}

var getDevices = function(){
  return Devices.map(function(d){
    return d.toObject();
  });
}

var notify = function(fnPattern, message, callback) {
  var devices = _searchDevices(fnPattern);
  devices.forEach(function(device){
    _getSpeechUrl(message, device.ip, function(res) {
      console.log(
        'notify sended to device:  %s (%s), %s:%d', 
        device.name, device.fn, device.ip, device.port
      );
      callback(res);
    });
  });
};

var play = function(fnPattern, mp3_url, callback) {
  var devices = _searchDevices(fnPattern);
  devices.forEach(function(device){
    _getPlayUrl(mp3_url, device.ip, function(res) {
      console.log(
        'play-url sended to device:  %s (%s), %s:%d', 
        device.name, device.fn, device.ip, device.port
      );
      callback(res);
    });
  });
};

var _getSpeechUrl = function(text, host, callback) {
  googletts(text, language, 1, 1000, googlettsaccent).then(function (url) {
    _onDeviceUp(host, url, function(res){
      callback(res)
    });
  }).catch(function (err) {
    console.error(err.stack);
  });
};

var _getPlayUrl = function(url, host, callback) {
    _onDeviceUp(host, url, function(res){
      callback(res)
    });
};

var _onDeviceUp = function(host, url, callback) {
  var client = new Client();
  client.connect(host, function() {
    client.launch(DefaultMediaReceiver, function(err, player) {

      var media = {
        contentId: url,
        contentType: 'audio/mp3',
        streamType: 'BUFFERED' // or LIVE
      };
      player.load(media, { autoplay: true }, function(err, status) {
        client.close();
        callback('Device play started.');
      });
    });
  });

  client.on('error', function(err) {
    console.log('Error: %s', err.message);
    client.close();
    callback('error');
  });
};

_searchAndCache();
// setInterval(function(){
//   _searchAndCache();
// }, 15 * 60 * 1000);

exports.accent = accent;
exports.getDevices = getDevices;
exports.notify = notify;
exports.play = play;
