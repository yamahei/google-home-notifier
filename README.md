# google-home-notifier
Send notifications to Google Home.
Enhanced the correspondence of multiple devices.

#### Installation
```sh
$ npm install google-home-notifier
```

#### Usage
```javascript
const googlehome = require('./google-home-notifier');
const WAIT_MSEC =  6 * 1000;//wait for search devices

setTimeout(function(){
  // After search and cache devices...
  googlehome.getDevices().forEach(
    function(device){
      var pattern = new RegExp(device.fn);// Means multiple devices can be called
      var message = "I am " + device.fn;// or MP3 URL
      googlehome.notify(// googlehome.play, if MP3
        pattern, message, 
        function(res) { console.log(res); }
      );
    }
  );
}, WAIT_MSEC);
```

#### Listener

TODO: fix to 'server.js'

If you want to run a listener, take a look at the example.js file. You can run this from a Raspberry Pi, pc or mac. 
The example uses ngrok so the server can be reached from outside your network. 
I tested with ifttt.com Maker channel and it worked like a charm.

```sh
$ git clone https://github.com/noelportugal/google-home-notifier
$ cd google-home-notifier
$ npm install
$ node example.js
Endpoints:
    http://192.168.1.20:8091/google-home-notifier
    https://xxxxx.ngrok.io/google-home-notifier
GET example:
curl -X GET https://xxxxx.ngrok.io/google-home-notifier?text=Hello+Google+Home  - to play given text
curl -X GET https://xxxxx.ngrok.io/google-home-notifier?text=http%3A%2F%2Fdomain%2Ffile.mp3 - to play from given url
POST example:
curl -X POST -d "text=Hello Google Home" https://xxxxx.ngrok.io/google-home-notifier - to play given text
curl -X POST -d "http://domain/file.mp3" https://xxxxx.ngrok.io/google-home-notifier - to play from given url

```
#### Raspberry Pi
If you are running from Raspberry Pi make sure you have the following before nunning "npm install":
Use the latest nodejs dist.
```sh
curl -sL https://deb.nodesource.com/setup_7.x | sudo -E bash -
sudo apt-get install nodejs
```
Also install these packages:
```sh
sudo apt-get install git-core libnss-mdns libavahi-compat-libdnssd-dev
```

## IMPORTANT: After "npm install"

1: Modify the following file "node_modules/mdns/lib/browser.js"
```sh
vi node_modules/mdns/lib/browser.js
```
Find this line:
```javascript
Browser.defaultResolverSequence = [
  rst.DNSServiceResolve(), 'DNSServiceGetAddrInfo' in dns_sd ? rst.DNSServiceGetAddrInfo() : rst.getaddrinfo()
, rst.makeAddressesUnique()
];
```
And change to:
```javascript
Browser.defaultResolverSequence = [
  rst.DNSServiceResolve(), 'DNSServiceGetAddrInfo' in dns_sd ? rst.DNSServiceGetAddrInfo() : rst.getaddrinfo({families:[4]})
, rst.makeAddressesUnique()
];
```

2: Modify the following file "node_modules/google-tts-api/lib/key.js"

Find this line:
```javascript
eval(html.match(/TKK=eval\(\'\(.*\)\'\);/g)[0]);
```
And change to:
```javascript
eval(html.match(/TKK='[0-9]+.[0-9]+'/g)[0]);
```

see: https://qiita.com/k_keisuke/items/2974ddaf2bf24a3ea32e