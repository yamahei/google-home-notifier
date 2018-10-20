var express = require('express');
var googlehome = require('./google-home-notifier');
var ngrok = require('ngrok');
var bodyParser = require('body-parser');
var app = express();
const serverPort = 8091; // default port
const NGROK_TOKEN="YOUR_NGROK_TOKEN_OR_EMPTY"

var ngrok_url = null;
var urlencodedParser = bodyParser.urlencoded({ extended: false });

app.post('/google-home-notifier', urlencodedParser, function (req, res) {
  
  if (!req.body) return res.sendStatus(400)
  console.log(req.body);
  
  var text = req.body.text;//ATTENTION: message or mp3-url
  var names = req.body.names;//ATTENTION: regexp pattern
  
  if (text && names){
    try {
      if (text.startsWith('http')){
        var mp3_url = text;
        googlehome.play(names, mp3_url, function(notifyRes) {
          console.log(notifyRes);
          res.send(names + ' will play sound from url: ' + mp3_url + '\n');
        });
      } else {
        googlehome.notify(names, text, function(notifyRes) {
          console.log(notifyRes);
          res.send(names + ' will say: ' + text + '\n');
        });
      }
    } catch(err) {
      console.log(err);
      res.sendStatus(500);
      res.send(err);
    }
  }else{
    res.send('Please GET "text=Hello Google Home&names=HOGE|FUGA"');
  }
})

app.get('/google-home-devices', function (req, res) {

  var devices = googlehome.getDevices();
  console.log(devices);
  res.send(JSON.stringify(devices));

})

app.get('/google-home-outerurl', function (req, res) {

  res.send(ngrok_url);

})

app.listen(serverPort, function () {
  var param = { addr: serverPort };
  if(NGROK_TOKEN){ param.authtoken = NGROK_TOKEN };
  ngrok.connect(param, function (err, url) {
    ngrok_url = url;
    console.log('local access:');
    console.log('    http://localhost:' + serverPort.toString());
    console.log('GET example:');
    console.log('    curl -X GET ' + url + '/google-home-devices');
    console.log('    curl -X GET ' + url + '/google-home-outerurl');
	  console.log('POST example:');
	  console.log('    curl -X POST -d "text=Hello Google Home" -d "names=.*" ' + url + '/google-home-notifier');
  });
})
//curl -X POST -d "text=Hello Google" -d "names=.*" https://ea5ff8c3.ngrok.io/google-home-notifier?text=hello&names=.*
