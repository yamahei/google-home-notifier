var Client = require('castv2-client').Client;
var DefaultMediaReceiver = require('castv2-client').DefaultMediaReceiver;
var mdns = require('mdns');
//var mdns = require('mdns-js');
var browser = mdns.createBrowser(mdns.tcp('googlecast'));
var deviceAddress;
var language;

var device = function(name, lang = 'en') {
    device = name;
    language = lang;
    return this;
};

var ip = function(ip, lang = 'en') {
  deviceAddress = ip;
  language = lang;
  return this;
}

var googletts = require('google-tts-api');
var googlettsaccent = 'us';
var accent = function(accent) {
  googlettsaccent = accent;
  return this;
}

var notify = function(message, callback) {
  if (!deviceAddress){
    browser.start();
    browser.on('serviceUp', function(service) {
      console.log('Device "%s" at %s:%d', service.name, service.addresses[0], service.port);
      console.log(JSON.stringify({
          name: service.name,
          address: service.addresses[0],
          port: service.port,
          fn: service.txtRecord.fn,
      }));
      /*
      service = {
        "interfaceIndex":2,
        "type":{
            "name":"googlecast","protocol":"tcp","subtypes":[],"fullyQualified":true},
        "replyDomain":"local.",
        "flags":2,
        "name":"Google-Home-Mini-7ab9edb8fbd867f7eb76bf253a94e423",
        "networkInterface":"enp2s0",
        "fullname":"Google-Home-Mini-7ab9edb8fbd867f7eb76bf253a94e423._googlecast._tcp.local.",
        "host":"7ab9edb8-fbd8-67f7-eb76-bf253a94e423.local.",
        "port":8009,
        "rawTxtRecord":{
            "type":"Buffer",
            "data":[3,114,115,61,4,110,102,6...52,101,52,50,51]
        },
        "txtRecord":{"rs":"","nf":"1","bs":"FA8FCA6F4104","st":"0","ca":"2052","fn":"ベッドルーム","ic":"/setup/icon.png","md":"Google Home Mini","ve":"05","rm":"95FDEFFAC7D34ABD","cd":"55FCA9BD8DEA293B19F0EDA067B5B103","id":"7ab9edb8fbd867f7eb76bf253a94e423"},
        "addresses":["192.168.1.7"]
      }
       */
      if (service.name.includes(device.replace(' ', '-'))){
        deviceAddress = service.addresses[0];
        getSpeechUrl(message, deviceAddress, function(res) {
          callback(res);
        });
      }
      browser.stop();
    });
  }else {
    getSpeechUrl(message, deviceAddress, function(res) {
      callback(res);
    });
  }
};

var play = function(mp3_url, callback) {
  if (!deviceAddress){
    browser.start();
    browser.on('serviceUp', function(service) {
      console.log('Device "%s" at %s:%d', service.name, service.addresses[0], service.port);
      if (service.name.includes(device.replace(' ', '-'))){
        deviceAddress = service.addresses[0];
        getPlayUrl(mp3_url, deviceAddress, function(res) {
          callback(res);
        });
      }
      browser.stop();
    });
  }else {
    getPlayUrl(mp3_url, deviceAddress, function(res) {
      callback(res);
    });
  }
};

var getSpeechUrl = function(text, host, callback) {
  googletts(text, language, 1, 1000, googlettsaccent).then(function (url) {
    onDeviceUp(host, url, function(res){
      callback(res)
    });
  }).catch(function (err) {
    console.error(err.stack);
  });
};

var getPlayUrl = function(url, host, callback) {
    onDeviceUp(host, url, function(res){
      callback(res)
    });
};

var onDeviceUp = function(host, url, callback) {
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
        callback('Device notified');
      });
    });
  });

  client.on('error', function(err) {
    console.log('Error: %s', err.message);
    client.close();
    callback('error');
  });
};

exports.ip = ip;
exports.device = device;
exports.accent = accent;
exports.notify = notify;
exports.play = play;
