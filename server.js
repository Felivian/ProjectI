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
var Qinfo           = require('./config/Qinfo');

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

var q = [];

for (var i=0; i<Qinfo.queue.length; i++) {
  q[i] = async.queue(function(task, callback) {
    if (task.mode_players == 6) {
      insideQ_OW6(task, callback);
    } else {
      insideQ_OW(task, callback);
    }
    console.log('here 10');
    //callback();
  }, 1);


  q[i].drain = function() {
      console.log('all items have been processed');
  };
}


// schedules ======================================================================
require('./app/schedules.js')(app, mongoose, schedule, q);

// routes ======================================================================
require('./app/routes.js')(app, passport, session, mongoose/*,q2*/); // load our routes and pass in our app and fully configured passport

// socket.io ======================================================================
//require('./app/socketio.js')(app, io, mongoose);

// BootBot ======================================================================
require('./app/bot.js')(app, bot, mongoose, q);

// launch ======================================================================
bot.start();
server.listen(port);
console.log('The magic happens on port ' + port);


function insideQ_OW(task, callback) {
  Log.findOne({'_id': task.log_id, 'active':'true'}, function(err, actualLog){
    if (!actualLog) { callback(); } else {
      //console.log('here 1');
      //console.log(task.log_id);
      var maxSR = actualLog.rank_n + 250;
      var minSR = actualLog.rank_n - 250;
      Log.find({'_id': {$ne: task.log_id} , 'active':'true', 'game': actualLog.game, 'platform': actualLog.platform, 'region': actualLog.region, 'mode.name': actualLog.mode.name, 'mode.players': actualLog.mode.players, $or: [ { 'rank_n': {$lte: maxSR} }, { 'rank_n': {$gte: minSR} } ]}, function(err, log){
        //console.log('here 2');
        //if (!log) throw(err)
        console.log('log length: '+ log.length);
        if(log.length >= actualLog.mode.players-1) { //change number
          //console.log('here 3');
          //match();
          for(var i=0;i<actualLog.mode.players-1;i++) {
            //console.log('here 4');
            actualLog.matches.push(log[i]._id);//user
            log[i].matches.push(actualLog._id);//
            for(var j=0;j<actualLog.mode.players-1;j++) {
              //console.log('here 5');
              if (i != j) {
                //console.log('here 6');
                log[i].matches.push(log[j]._id);//
              }
            }
            //console.log('here 7');
            log[i].active = false;
            log[i].success = true;
            log[i].save(function(err, updatedLog){
              //console.log('log[i] saved!');
            });
          }
          //console.log('here 8');
          actualLog.active = false;
          actualLog.success = true;
          actualLog.save(function(err, updatedActualLog){
            //console.log('ActualLog saved!');
            callback();
          });
        } else {
          //console.log('here 9');
          callback();
          //not found
          //serch in user DB
        }
      });
    }
  });
}

function insideQ_OW6(task, callback) {
}