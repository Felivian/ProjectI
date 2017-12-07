// set up ======================================================================
// get all the tools we need
var express         = require('express');
var app             = express();
var port            = process.env.PORT || 8080;
var mongoose        = require('mongoose');
mongoose.Promise    = require('bluebird');
var passport        = require('passport');
var flash           = require('connect-flash');

var morgan          = require('morgan');
var cookieParser    = require('cookie-parser');
var bodyParser      = require('body-parser');

var BootBot 		    = require('bootbot');
var eventEmitter 	  = require('events').EventEmitter;

var server          = require('http').createServer(app);
var io              = require('socket.io').listen(server);

var session         = require('express-session');
var schedule        = require('node-schedule');
var sh              = require('shorthash');

var configDB        = require('./config/database.js');
var configAuth      = require('./config/auth.js');

var async           = require('async');
var push2q          = require('./app/push2q');
var Qinfo           = require('./config/Qinfo');


// configuration ===============================================================
//mongoose.connect(configDB.url); // connect to our database
mongoose.connection.openUri(configDB.url, { /* options */ });

require('./config/passport')(passport); // pass passport for configuration

// set up our express application
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
// get information from html forms
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

app.set('view engine', 'ejs'); // set up ejs for templating

// required for passport

app.use(session({
	secret: 'keyboard cat', 
	saveUninitialized: true, 
	resave: true,
	//cookie: { maxAge: 3600000 },
	store: new (require('express-sessions'))({
        storage: 'mongodb',
        instance: mongoose, // optional 
        host: 'localhost', // optional 
        port: 27017, // optional 
        db: 'test', // optional 
        collection: 'sessions', // optional 
        //expire: 86400 // optional 
    }),
	unset: 'destroy'
}));



app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session
app.use('/static', express.static('public'))


var bot = new BootBot({
  accessToken	: configAuth.messengerAuth.access_token,
  verifyToken	: configAuth.messengerAuth.verify_token,
  appSecret		: configAuth.messengerAuth.app_secret
});

var q = [];
global.isDrained = [];
global.wasInserted = [];
global.count = [];

require('./config/Qconfig')(async, q);
var Log     = require('./app/models/log');

setInterval(function() {
  for (var i=0; i<Qinfo.queue.length; i++) {     
    if (global.isDrained[i] == true && global.wasInserted[i] == true) {
      global.isDrained[i] = false;
      global.wasInserted[i] = false;

      var json = Qinfo.queue.slice()[i];

      Log.find({ active: true, game: json.game, platform: json.platform, region: json.region, 'mode.name': json.mode.name, 'mode.players': json.mode.players }, function(err, log) {
        for(var j=0; j<log.length; j++) { 
          push2q(q, log[j]._id, log[j].user_id, log[j].game, log[j].platform, log[j].region, log[j].mode.name, log[j].mode.players);
        }
      });
    }
  }
},10000);

var mf = require('./app/main_functions');
require('./tests/testsRouter.js')(app, mongoose, q);
//mf.changeChance(1,2);

// schedules ======================================================================
require('./app/schedules.js')(app, mongoose, schedule, q);

// routes ======================================================================
require('./app/routes.js')(app, passport, session, mongoose/**/,q); // load our routes and pass in our app and fully configured passport

// socket.io ======================================================================
//require('./app/socketio.js')(app, io, mongoose);

// BootBot ======================================================================
require('./app/bot.js')(app, bot, mongoose, q);

// launch ======================================================================
bot.start();
server.listen(port);
console.log('The magic happens on port ' + port);



