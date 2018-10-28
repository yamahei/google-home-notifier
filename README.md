# google-home-notifier
Send notifications to Google Home.
Enhanced the correspondence of multiple devices.

- Search and cache google home devices on network.
- Send notify to Google Home(s) by name or regex pattern.
- Provide directory to publish static file.

#### Installation
```sh
$ git clone https://github.com/yamahei/google-home-notifier.git
$ npm install
```

#### Usage

see /PATH/TO/google-home-notifier/usage.js
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

If you want to run a listener, take a look at the server.js file. You can run this from a Raspberry Pi, pc or mac. 
The example uses ngrok so the server can be reached from outside your network. 
I tested with ifttt.com Maker channel and it worked like a charm.

```sh
$ git clone https://github.com/yamahei/google-home-notifier.git
$ cd google-home-notifier
$ npm install
$ node server.js
Device found:  Google-Home-Mini-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX (ベッドルーム), 192.168.x.y:8009
Device found:  Google-Home-Mini-YYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYY (ファミリー ルーム), 192.168.x.z:8009
=========================== Google home notifier started =========================
local access:
    http://localhost:8091
GET example:
    curl -X GET http://localhost:8091/google-home-devices
    curl -X GET http://localhost:8091/google-home-outerurl
    curl -X GET http://localhost:8091/static/jinglebell.mp3
POST example:
    curl -X POST -d "text=Hello Google Home" -d "names=.*" https://xxxxxxxx.ngrok.io/google-home-notifier
    curl -X POST -d "text=jinglebell.mp3" -d "names=.*" https://xxxxxxxx.ngrok.io/google-home-notifier
```
#### Raspberry Pi
If you are running from Raspberry Pi make sure you have the following before nunning "npm install":
Use the latest nodejs dist.
```sh
curl -sL https://deb.nodesource.com/setup_9.x | sudo -E bash -
sudo apt-get install nodejs
```
Also install these packages:
```sh
sudo apt-get install git-core libnss-mdns libavahi-compat-libdnssd-dev
```

## IMPORTANT: After "npm install"

### 1: Modify the following file "node_modules/mdns/lib/browser.js"

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

### 2: Modify the following file "node_modules/google-tts-api/lib/key.js"

Find this line:
```javascript
eval(html.match(/TKK=eval\(\'\(.*\)\'\);/g)[0]);
```
And change to:
```javascript
eval(html.match(/TKK='[0-9]+.[0-9]+'/g)[0]);
```

#### Do you want run Jiho and Outer URL?

##### to service "server.js" with forever.

```sh
sudo npm install -g forever
```
```javascript
// server.js
const NGROK_TOKEN="";//your ngrok token or empty
```
```sh
# append this line to /etc/rc.local
sudo -u pi $(which forever) start /PATH/TO/google-home-notifier/server.js
```

##### periodically run "timesignal.rb" with cron

```ruby
GUID = ""# your guid then send outer-url
```
NOTE: Do you want your guid? please call me!
```sh
# crontab
* *  *   *   *     $(which ruby) /PATH/TO/google-home-notifier/timesignal.rb
```
