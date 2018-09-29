const googlehome = require('./google-home-notifier');
const WAIT_MSEC =  6 * 1000;//wait for search devices

setTimeout(function(){
    googlehome.getDevices().forEach(
        function(device){
            var pattern = new RegExp(device.fn);
            var message = "I am " + device.fn;
            googlehome.notify(
                pattern, message, 
                function(res) { console.log(res); }
            );
        }
    );
}, WAIT_MSEC);
