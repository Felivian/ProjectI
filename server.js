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


var Log             = require('./app/models/log');//

var Qinfo           = require('./config/Qinfo');//
var wG              = require('./app/whatGroups');//

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

for (var i=0; i<Qinfo.queue.length; i=i+3) {
  q[i] = async.queue(function(task, callback) {
    insideQ_OW2(task, callback);
  }, 1);

  q[i+1] = async.queue(function(task, callback) {
    insideQ_OW3(task, callback);
  }, 1);

  q[i+2] = async.queue(function(task, callback) {
    insideQ_OW6(task, callback);
  }, 1);
}

for (var i=0; i<Qinfo.queue.length; i++) {
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


function insideQ_OW2(task, callback) {
  Log.findOne({'_id': task.log_id, 'active':'true'}, function(err, actualLog){
    if (!actualLog) { callback(); } else {
      //var maxSR = actualLog.rank_n + 250;
      //var minSR = actualLog.rank_n - 250;
      Log.find({'_id': {$ne: task.log_id} , 'active':'true', 'game': actualLog.game, 'platform': actualLog.platform, 'region': actualLog.region, 'mode.name': actualLog.mode.name, 'mode.players': actualLog.mode.players, 'maxSR': {$gte: actualLog.rank_n }, 'minSR': {$lte: actualLog.rank_n} }).sort( { 'qd_players': -1 } ).exec( function(err, log){
        //if (!log) throw(err)
        if(log.length >= actualLog.mode.players-1) { //change number
          for(var i=0;i<actualLog.mode.players-1;i++) {
            actualLog.matches.push(log[i]._id);//log_id
            log[i].matches.push(actualLog._id);//
            for(var j=0;j<actualLog.mode.players-1;j++) {
              if (i != j) {
                log[i].matches.push(log[j]._id);//
              }
            }
            log[i].active = false;
            log[i].success = true;
            log[i].save(function(err, updatedLog){
            });
          }
          actualLog.active = false;
          actualLog.success = true;
          actualLog.save(function(err, updatedActualLog){
            callback();
          });
        } else {
          callback();
          //not found
          //serch in user DB
        }
      });
    }
  });
}

function insideQ_OW3(task, callback) {
  Log.findOne({'_id': task.log_id, 'active':true}, function(err, actualLog){
    if (!actualLog) { callback(); } else {
      //var maxSR = actualLog.rank_n + 250;
      //var minSR = actualLog.rank_n - 250;
      Log.aggregate([ 
        { $match: 
          {'_id': {$ne: task.log_id},
          'active':true, 
          'game': actualLog.game, 
          'platform': actualLog.platform,
          'region': actualLog.region,
          'mode.name': actualLog.mode.name,
          'mode.players': actualLog.mode.players,
          'maxSR': {$gte: actualLog.rank_n },
          'minSR': {$lte: actualLog.rank_n} }},
        { $group: {_id: '$qd_players' , count: { $sum: 1 } } },
        { $sort: { qd_players: -1 }}
      ],function(err, log_nb) {
        var wg = wG.whatGroups(log_nb,actualLog.mode.players-1);
        if(wg) {
          var dup = wG.dups(wg);
          var lf = wG.keys_n(dup);
          for(var i=0; i<lf.length; i++) {
            Log.find({
              '_id': {$ne: task.log_id},
              'active':true, 
              'game': actualLog.game, 
              'platform': actualLog.platform,
              'region': actualLog.region,
              'mode.name': actualLog.mode.name,
              'mode.players': actualLog.mode.players,
              'maxSR': {$gte: actualLog.rank_n },
              'minSR': {$lte: actualLog.rank_n},
              'qd_players': lf[i][1]
            })
            .limit(lf[i][0])
            .exec(function(err, log) {
              for (var j=0; j<log.length; j++) {
                console.log(log[j]._id);
                actualLog.matches.push(log[j]._id);
              }
              actualLog.active = false;
              actualLog.success = true;
              actualLog.save(function(err, updatedActualLog){
                
                if (i>=lf.length-1) {
                  //update rest
                  for (var j=0; j<actualLog.matches.length; j++) {
                    for (var k=0; k<actualLog.matches.length; k++) {
                      if (k != j) {
                        Log.update({'_id': actualLog.matches[j]}, {$push: {'matches': actualLog.matches[k]} }, function(err, ulog) {
                          console.log('saved');
                        });
                      }
                      if(k>=actualLog.matches.length-1 && j>=actualLog.matches.length-1 ) {console.log('here'); callback();}
                    }
                    Log.update({'_id': actualLog.matches[j]}, {$push: {'matches': actualLog._id}, $set: {'active':false, 'success':true}}, function(err, ulog) {
                      console.log('saved');
                    });
                  }
                }
              });
            });
          }
        } else {
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