var express = require('express');
var googlehome = require('./google-home-notifier');
var ngrok = require('ngrok');
var bodyParser = require('body-parser');
var app = express();
const serverPort = 8091; // default port
const NGROK_TOKEN="";//your ngrok token or empty

var ngrok_url = null;
var urlencodedParser = bodyParser.urlencoded({ extended: false });

app.post('/google-home-notifier', urlencodedParser, function (req, res) {
    
    if (!req.body) {
        res.sendStatus(405);
        res.send("[ERROR]request body is empty!");
    }else{
        var text = req.body.text;//ATTENTION: message or mp3-url
        var names = req.body.names || ".*";//ATTENTION: regexp pattern

        if (!text){
            res.sendStatus(405);
            res.send('[ERROR]Please GET "text=Hello Google Home&names=HOGE|FUGA"');
        } else {
            var method = text.startsWith('http') ? "play" : "notify";
            console.log(method + "[text=%s, names=%s]", text, names);
            try {
                googlehome[method](names, text, function(notifyRes) {
                    console.log(notifyRes);
                });
                res.sendStatus(200);
            } catch(err) {
                console.log(err);
                res.sendStatus(500);
                res.send("[ERROR]" + JSON.stringify(err));
            }
        }
    }
});

app.get('/google-home-devices', function (req, res) {
    var devices = googlehome.getDevices();
    console.log(devices);
    res.send(JSON.stringify(devices));
});

app.get('/google-home-outerurl', function (req, res) {
    console.log(ngrok_url);
    res.send(ngrok_url);
});

app.listen(serverPort, function () {
    var param = { addr: serverPort };
    if(NGROK_TOKEN){ param.authtoken = NGROK_TOKEN };
    ngrok.connect(param, function (err, url) {
        if(!url){
            console.log(param);
            throw new Error(err);
        }
        ngrok_url = url;
        console.log('=========================== Google home notifier started =========================');
        console.log('local access:');
        console.log('    http://localhost:%d', serverPort);
        console.log('GET example:');
        console.log('    curl -X GET http://localhost:%d/google-home-devices', serverPort);
        console.log('    curl -X GET http://localhost:%d/google-home-outerurl', serverPort);
        console.log('POST example:');
        console.log('    curl -X POST -d "text=Hello Google Home" -d "names=.*" %s/google-home-notifier', url);
    });
});
