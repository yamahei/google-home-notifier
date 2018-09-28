const googlehome = require('./google-home-notifier');
const device = 'Google-Home';
const language = 'ja';


googlehome.device(device, language); 
//googlehome.ip('10.0.1.8'); 
googlehome.accent('ja');
googlehome.notify('人の上に人を作らず、人の下に人を作らず', function(res) {
   console.log(res);
});