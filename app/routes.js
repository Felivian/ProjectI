module.exports = function(app, passport, session, mongoose, q, io) {
var Session         = require('../app/models/session');
var cookieParser    = require('cookie-parser');
var request         = require('request');
var configAuth      = require('../config/auth.js');
var Game            = require('./models/game');
var Queue           = require('./models/queue');//
var Log             = require('./models/log');//
var User            = require('./models/user');//
var _               = require('underscore');
var push2q          = require('./push2q');
var mf              = require('./moreFunctions');//
var fetch 			= require('node-fetch');

	
	app.get('/messenger-login', function(req, res) {
		if (req.query.redirect_uri) {
			req.session.redirect_uri = req.query.redirect_uri;
			req.session.account_linking_token = req.query.account_linking_token;
			if (req.isAuthenticated()) {
				res.redirect(req.session.redirect_uri+'&authorization_code=200');
			} else {
				res.render('messenger-login.ejs');
			}
		} else {
			res.redirect('/');
		}
		
	});


	
		

	app.get('/', function(req, res) {
		Game.find({}, 'name', function(err, game) {
			if (req.user) {
				res.render('home.ejs', { user: req.user.displayName, url: req.url, games:game });
			} else {
				res.render('home.ejs', {user: null, url: req.url, games: game});
			}
		});
	});

	app.get('/about', function(req, res) {
		if (req.user) {
			res.render('about.ejs', { user: req.user.displayName, url: req.url });
		} else {
			res.render('about.ejs', {user: null, url: req.url});
		}  
	});

	app.get('/settings', function(req, res) {
		if (req.user) {
			if (req.user.facebook.token) {
				res.render('settings.ejs', {  
					user: req.user.displayName,
					//id : req.session.passport.user,
					facebookToken : true,
					facebookName : req.user.facebook.name,
					email : req.user.local.email,
					url: req.url, 
					message: req.flash('signupMessage') 
				});
			} else {
				res.render('settings.ejs', {  
					user: req.user.displayName,
					//id : req.session.passport.user,
					facebookToken : false,
					facebookName : null,
					email : req.user.local.email,
					url: req.url, 
					message: req.flash('signupMessage') 
				});
			}
		}  
	});

	app.get('/signup', isNotLoggedIn, function(req, res) {
		res.render('signup.ejs', { message: req.flash('signupMessage') });
	});

	app.get('/login', isNotLoggedIn,  function(req, res) {
		res.render('login.ejs', { message: req.flash('loginMessage') }); 
	});


	app.get('/profile', isLoggedIn, function(req, res) {
		//messenger login redirect
		if (req.session.redirect_uri) { 
			var r_uri = req.session.redirect_uri;
			var account_linking_token = req.session.account_linking_token;
			req.session.redirect_uri = undefined;
			req.session.account_linking_token = undefined;
			fetch('https://graph.facebook.com/v2.6/me?access_token='+configAuth.messengerAuth.access_token+'&fields=recipient&account_linking_token='+account_linking_token)
		    .then(res => res.json())
		    .then(json => {
		    	var user            = req.user;
				user.messenger.id   = json.recipient;
				user.save(function(err) {
				});
				User.updateMany({'messenger.id': json.recipient, _id: {$ne: req.session.passport.user} }, 
				{$set: {'messenger.id':undefined} },
				function(err, user2) {

				});
				res.redirect(r_uri+'&authorization_code=200'); 
		    });
			// request('https://graph.facebook.com/v2.6/me?access_token='+configAuth.messengerAuth.access_token+'&fields=recipient&account_linking_token='+account_linking_token
			// ,function(er, response, body) {
			// 	var obj = JSON.parse(body);
			// 	var user            = req.user;
			// 	user.messenger.id   = obj.recipient;
			// 	user.save(function(err) {
			// 		//res.redirect('/profile');
			// 	});
			// 	User.updateMany({'messenger.id': obj.recipient, _id: {$ne: req.session.passport.user} }, 
			// 	{$set: {'messenger.id':undefined} },
			// 	function(err, user2) {

			// 	});
			// 	res.redirect(r_uri+'&authorization_code=200'); 
			// });
		} else {
			//res.render('profile.ejs', { user: req.user.displayName, url: req.url, userId: req.session.passport.user, mineProfile: true });
			res.redirect('/profile/'+req.session.passport.user);
		}
	});
	app.get('/profile/:userId', function(req, res) {
		
		Game.find({}, 'name', function(err, game) {
			User.findOne({_id: req.params.userId}).select({'games': 1, '_id': 0}).sort({'games.name': 1}).exec(function(err, userGames) {
				if (userGames) {
					var userGames =  _.sortBy(userGames.games, 'name');
					if (req.isAuthenticated()) {
						if (req.params.userId == req.session.passport.user) {
							res.render('profile.ejs', { user: req.user.displayName, url: req.url,  mineProfile: true, userGames: userGames, games:game });
						} else {
							res.render('profile.ejs', { user: req.user.displayName, url: req.url,  mineProfile: false, userGames: userGames, games:game });
						}
					} else {
						res.render('profile.ejs', { user: null, url: req.url, mineProfile: false, userGames: userGames, games:game });
					}
				} else {
					res.sendStatus(404);
				}
			});
		});
	});


	app.get('/logout', isLoggedIn, function(req, res) {
		req.logout();
		//req.session.destroy();
		res.redirect('/');
	});



	// =====================================
	// LOCAL ===============================
	// =====================================
	app.post('/signup', passport.authenticate('local-signup', {
		successRedirect : '/profile', // redirect to the secure profile section
		failureRedirect : '/signup', // redirect back to the signup page if there is an error
		failureFlash : true // allow flash messages
	}));

	app.post('/login', passport.authenticate('local-login', {
		successRedirect : '/profile', // redirect to the secure profile section
		failureRedirect : '/login', // redirect back to the signup page if there is an error
		failureFlash : true // allow flash messages
	}));


	// =====================================
	// EXTERNAL ============================
	// =====================================

	// send to facebook to do the authentication
	app.get('/auth/facebook', passport.authenticate('facebook'));

	// handle the callback after facebook has authenticated the user
	app.get('/auth/facebook/callback',
		passport.authenticate('facebook', {
			successRedirect : '/profile',
			failureRedirect : '/'
		}));

	
	// =============================================================================
	// AUTHORIZE (ALREADY LOGGED IN / CONNECTING OTHER SOCIAL ACCOUNT) =============
	// =============================================================================
	// locally --------------------------------
	app.post('/connect/local', passport.authenticate('local-signup', {
		successRedirect : '/settings', // redirect to the secure profile section
		failureRedirect : '/settings', // redirect back to the signup page if there is an error
		failureFlash : true // allow flash messages
	}));

	// facebook -------------------------------

	// send to facebook to do the authentication
	app.get('/connect/facebook', isLoggedIn, passport.authorize('facebook'));

	// handle the callback after facebook has authorized the user
	app.get('/connect/facebook/callback',
		passport.authorize('facebook', {
			successRedirect : '/settings',
			failureRedirect : '/settings'
		}));


	// =============================================================================
	// UNLINK ACCOUNTS =============================================================
	// =============================================================================
	// local -----------------------------------
	app.get('/unlink/local', isLoggedIn, function(req, res) {
		var user            = req.user;
		user.local.email    = undefined;
		user.local.password = undefined;
		user.save(function(err) {
			res.redirect('/settings');
		});
	});

	// facebook -------------------------------
	app.get('/unlink/facebook', isLoggedIn, function(req, res) {
		var user            = req.user;
		user.facebook.token = undefined;
		user.save(function(err) {
			res.redirect('/settings');
		});
	});

	// =====================================
	// ajax data ===========================
	// =====================================

	app.get('/game/:gameName', function (req, res) {
		Game.findOne({name: req.params.gameName}, function(err, game) {
			res.json(game);
		});	
	});


	//return modePlayers for certain mode
	app.get('/queue/:gameName/:modeName', function (req, res) {
		Queue.aggregate([
			{ $match: { game: req.params.gameName, modeName: req.params.modeName} },
			{ $group : {
				_id : "$modeName",
				players: {$addToSet : "$modePlayers" }
				}
			}         
		], function(err, queue) {
			res.json({modePlayers: queue[0].players});
		})
	});



	app.post('/logs', function (req, res) {    
		var players;
		if (typeof req.body.data !== 'undefined') {
			if ('modePlayers' in req.body.data) req.body.data.modePlayers = parseInt(req.body.data.modePlayers);
			if (typeof req.body.data.modePlayers === 'undefined') {
				players = 99;  
			} else {
				players = req.body.data.modePlayers;
			}
		} else {
			req.body.data = {};
			players = 99;
		}
		if ('qdPlayers' in req.body) req.body.qdPlayers = parseInt(req.body.qdPlayers);
		req.body.limit = parseInt(req.body.limit);
		req.body.offset = parseInt(req.body.offset);
		if (!req.body.qdPlayers) req.body.qdPlayers = 0;
		var maxQdP = players - req.body.qdPlayers;

		req.body.data.active = true;
		Log.find({ $and: [req.body.data, {'qdPlayers': {$lte: maxQdP} }]}).skip(req.body.offset).limit(req.body.limit).sort({start: -1})
		.exec(function(err, log) {
			if(log.length === 0) {
				res.json({result: false});
			} else {
				res.json({result: true, log: log});
			}
		});
	});

	app.post('/picks', function (req, res) {
		JSON.stringify(req.body.id);
		Log.find({_id: {$in: req.body.id}}, 'userId userName qdPlayers active', function(err, log) {
			res.json(log);
		});
		//res.sendStatus(200);
	});

	app.post('/match', function (req, res) {
		if (req.isAuthenticated()) {
			JSON.stringify(req.body.id);
			Log.findOne({userId: req.session.passport.user, active:true}, function(err, otherLog) {
				if(!otherLog) { //testy nie beda dzialac
			//if (req.body.id.includes(req.session.passport.user)) { //aktualne testy nie beda dzialac teraz == zabezpieczenie przeciw dodaniu samego siebie
				Log.find({_id: {$in: req.body.id}, active:true}, function(err, log) {
					if (log.length != req.body.id.length) {
						res.sendStatus(404);
					} else {
						
						var arr = [];
						log.forEach(function(val){
							arr.push(val._id);
						});
						mf.changeChance(req.session.passport.user, 1);
						push2q(q, null, req.session.passport.user, log[0].game, log[0].platform, log[0].region, log[0].modeName, log[0].modePlayers, false, arr);
						res.sendStatus(200);
					}
				});
				} else {
				    res.sendStatus(406);
				}
			});
			// } else {
			//     res.sendStatus(406);
			// }
		} else {
			res.sendStatus(401);
		}
	});


	app.post('/new-ad', function (req, res) {
		console.log('automatic: '+req.body.automatic);
		if (req.isAuthenticated()) {
			Log.findOne({userId: req.session.passport.user, active:true}, function(err, otherLog) {
				// if(!otherLog) { //testy nie beda dzialac
					var date = new Date();
					newLog = new Log;
					newLog.platform = req.body.data.platform;
					newLog.region = req.body.data.region;
					newLog.game = req.body.data.game;
					newLog.modeName = req.body.data.modeName;
					newLog.modePlayers = req.body.data.modePlayers;
					newLog.rankS = req.body.data.rankS;
					newLog.qdPlayers = req.body.data.qdPlayers;
					newLog.userId = req.session.passport.user;
					newLog.active = true;
					newLog.start = date;
					//newLog.updated = date;
					newLog.automatic=req.body.automatic;
					User.aggregate([
					{$match: {_id:newLog.userId}},
					{$project: {games:1, displayName:1,_id:0}},
					{$unwind: '$games'},
					{$match: {'games.name':req.body.data.game,'games.platform':req.body.data.platform,'games.region':req.body.data.region } },
					{$project: {'games.account':1, displayName:1} }
					], function(err, user) {
						if (user.length != 0) {
							if (user[0].displayName != null) {
								newLog.userName = user[0].displayName;
							} else {
								newLog.userName = user[0].games.account;
							}
							newLog.save(function(err, log) {
								mf.changeChance(req.session.passport.user, 1);
								//push to queue
								if(req.body.automatic) {
									push2q(q, log._id, req.session.passport.user, newLog.game, newLog.platform, newLog.region, newLog.modeName, newLog.modePlayers, false, []);
								} else {
									io.to(newLog.game.replace(/\s/g, '')).emit('new', newLog);
								}
								res.sendStatus(200);
							});
						} else {
							res.sendStatus(400);
						}
					});
				// } else {
				//     res.sendStatus(406);
				// }
			});
		} else {
			res.sendStatus(401);
		}
	});

	app.get('/profile-logs/:userId/:offset', function(req, res) {
		req.params.offset = parseInt(req.params.offset);
		Log.find({userId: req.params.userId}).sort({start: -1}).skip(req.params.offset).limit(10).exec(function(err, userLogs) {
			if (req.isAuthenticated()) {
				if (req.params.userId == req.session.passport.user) {
					res.json({mineProfile: true, userLogs: userLogs });
				} else {
					res.json({ mineProfile: false, userLogs: userLogs });
				}
			} else {
				res.json({ mineProfile: false,  userLogs: userLogs });
			}

		});
	});

	app.get('/specific-log/:logId', function(req, res) {
		Log.findOne({_id: req.params.logId}).exec(function(err, userLog) {
			if (req.isAuthenticated()) {
				if (req.params.userId == req.session.passport.user) {
					res.json({ userLog: userLog });
				} else {
					res.json({ userLog: userLog });
				}
			} else {
				res.json({ userLog: userLog });
			}
		});
	});

	app.post('/cancel-ad', function(req, res) {
		Log.findOne({_id: req.body.logId}, function(err, userLog) {
			if (userLog.active) {
				userLog.end = new Date();
				userLog.active = false;
				userLog.success = false;
				var json = {};
				json.id = [userLog._id];
				json.userId = [userLog.userId];
				userLog.save(function(err, uLog) {
					io.to(userLog.game.replace(/\s/g, '')).emit('delete', json);
					res.sendStatus(200); 
				}); 
			} else {
				res.sendStatus(406);
			}
			
		});
	});

	app.post('/add-game', function(req, res) {
		User.findOneAndUpdate({_id: req.body.userId}, 
		{ $push: { games: {name: req.body.game, account: req.body.nick, platform: req.body.platform, region: req.body.region} } },
		function(err, user) {
			if (err) res.sendStatus(500); 
			res.sendStatus(200); 
		});
	});

	app.post('/game-remove', function(req, res) {
		User.findOneAndUpdate({_id: req.body.userId}, 
		{ $pull: { games: {name: req.body.userGame[0], account: req.body.userGame[1], platform: req.body.userGame[2], region: req.body.userGame[3]} } },
		function(err, user) {
			if (err) res.sendStatus(500); 
			res.sendStatus(200); 
		});
	});

	app.post('/changename', function(req, res) {
		if (req.body.displayName != null && req.body.displayName.length > 6 ) {

			User.findOneAndUpdate({_id: req.session.passport.user}, 
			{ $set: { displayName: req.body.displayName } },
			function(err, user) {
				if (err) res.sendStatus(500); 
				res.sendStatus(200); 
			});
		} else {
			res.sendStatus(406); 
		}
	});

	app.get('/chart1/:userId', function(req, res) {
		newLog = new Log;
		newLog.userId = req.params.userId;
		Log.aggregate([
		{$match: {userId: newLog.userId, active:false} },
		{$group: {_id: '$success', count: { $sum: 1 }} }
		], function(err, log) {
			if (err) res.sendStatus(500); 
			res.json(log); 
		});
	});

	app.get('/chart2/:userId', function(req, res) {
		newLog = new Log;
		newLog.userId = req.params.userId;
		Log.aggregate([
		{$match: {userId: newLog.userId, active:false} },
		{$group: {_id: '$game', count: { $sum: 1 }} }
		], function(err, log) {
			if (err) res.sendStatus(500); 
			res.json(log); 
		});
	});
}

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {
	
	// if user is authenticated in the session, carry on 
	if (req.isAuthenticated())
		return next();

	// if they aren't redirect them to the home page
	res.redirect('/');
}

function isNotLoggedIn(req, res, next) {
	if (req.isAuthenticated()) {
		res.redirect('/'); 
	} else {
		return next();    
	}
}





