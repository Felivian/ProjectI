var express         = require('express');
var app             = express();
var port            = process.env.PORT || 8080;
var mongoose        = require('mongoose');
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



// configuration ===============================================================
mongoose.connection.openUri(configDB.url, {});

require('./config/passport')(passport);

app.use(morgan('dev'));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: true
}));

app.set('view engine', 'ejs');

app.use(session({
	secret: 'keyboard cat', 
	saveUninitialized: true, 
	resave: true,
	store: new (require('express-sessions'))({
				storage: 'mongodb',
				instance: mongoose,
				host: 'localhost',
				port: 27017,
				db: 'test',
				collection: 'sessions',
				expire: 4 //*1000s~1h
		}),
	unset: 'destroy'
}));



app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(express.static(__dirname + '/public'));


var bot = new BootBot({
	accessToken	: configAuth.messengerAuth.access_token,
	verifyToken	: configAuth.messengerAuth.verify_token,
	appSecret	: configAuth.messengerAuth.app_secret
});
q = [];


require('./tests/testsRouter.js')(app, mongoose, q);

// socket.io ======================================================================
require('./app/socketio.js')(app, io, mongoose);

// routes ======================================================================
require('./app/routes.js')(app, passport, session, mongoose, q, io); 

// BootBot ======================================================================
require('./app/bot.js')(app, bot, mongoose, io);

// Init Queues ====================================================================
require('./config/qConfig')(async, q, io, bot);

// schedules ======================================================================
require('./app/schedules.js')(app, mongoose, schedule, q, io, bot);

// launch ======================================================================
bot.start();
server.listen(port);
console.log('The magic happens on port ' + port);



