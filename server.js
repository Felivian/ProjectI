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

var Log             = require('./app/models/log');

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



var q = async.queue(function(task, callback) {
    //console.log('hello ' + task.log_id);
    //console.log(task.log_id);
    Log.findOne({'_id': task.log_id, 'active':'true'}, function(err, actualLog){
      Log.find({'_id': {$ne: task.log_id} , 'active':'true'}, function(err, log){
        //if (!log) throw(err)
        if(log.length >= 2) { //change number
          //match();
          for(var i=0;i<2;i++) {
            actualLog.matches.push(log[i].user_id);
            log[i].matches.push(actualLog.user_id);
            for(var j=0;j<2;j++) {
              if (log[i]._id != log[j]._id) {
                log[i].matches.push(log[j].user_id);
              }
            }
            log[i].active = false;
            log[i].success = true;
            console.log(log[i]);
            log[i].save(function(err, updatedLog){
              console.log('log['+i+'] saved!');
            });
          }
          actualLog.active = false;
          actualLog.success = true;
          actualLog.save(function(err, updatedActualLog){
            console.log('ActualLog saved!');
          });
        } else {
          //not found
          //serch in user DB
        }
      });
    });

    callback();
}, 1);

q.drain = function() {
    console.log('all items have been processed');
};



// schedules ======================================================================
require('./app/schedules.js')(app, mongoose, schedule, q);

// routes ======================================================================
require('./app/routes.js')(app, passport, session, mongoose); // load our routes and pass in our app and fully configured passport

// socket.io ======================================================================
//require('./app/socketio.js')(app, io, mongoose);

// BootBot ======================================================================
require('./app/bot.js')(app, bot, mongoose, q);

// launch ======================================================================
bot.start();
server.listen(port);
console.log('The magic happens on port ' + port);
