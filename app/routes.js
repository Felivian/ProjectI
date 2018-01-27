module.exports = function(app, passport, session, mongoose, q, io) {
	var Session            	= require('../app/models/session');
	var cookieParser 		= require('cookie-parser');
    var request             = require('request');
    var configAuth          = require('../config/auth.js');
    var Game = require('./models/game');
    var Queue = require('./models/queue');//
    var Log = require('./models/log');//
    var User = require('./models/user');//
    var _    = require('underscore');
    var push2q  = require('./push2q');
    var mf              = require('./main_functions');//
	//cookie toucher
	/*var cookieToucher = function (req, res, next) {
		req.session.touch();
		//console.log('touched');
		next();
	}
	app.use(cookieToucher);*/
	
    app.get('/messenger-login', function(req, res) {
        req.session.redirect_uri = req.query.redirect_uri;
        req.session.account_linking_token = req.query.account_linking_token;
    	if (req.isAuthenticated()) {
            res.redirect(req.session.redirect_uri+'&authorization_code=200');
        } else {
            res.render('messenger-login.ejs');
        }
    });


    
        

    app.get('/', function(req, res) {
        Game.find({}, function(err, game) {
            if (req.user) {
                res.render('home.ejs', { user: req.user.facebook.name, url: req.url, games:game });
            } else {
                res.render('home.ejs', {user: null, url: req.url, games: game});
            }
        });
    });

    app.get('/about', function(req, res) {
        if (req.user) {
            res.render('about.ejs', { user: req.user.facebook.name, url: req.url });
        } else {
            res.render('about.ejs', {user: null, url: req.url});
        }  
    });

    app.get('/settings', function(req, res) {
        if (req.user) {
            res.render('settings.ejs', { user: req.user.facebook.name, url: req.url });
        } else {
            res.render('settings.ejs', {user: null, url: req.url});
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
            req.session.redirect_uri = undefined;
            request('https://graph.facebook.com/v2.6/me?access_token='+configAuth.messengerAuth.access_token+'&fields=recipient&account_linking_token='+req.session.account_linking_token
            ,function(er, response, body) {
                req.session.account_linking_token = undefined;
                var obj = JSON.parse(body);
                var user            = req.user;
                user.messenger.id   = obj.recipient;
                user.save(function(err) {
                    //res.redirect('/profile');
                });
            });
            res.redirect(r_uri+'&authorization_code=200');
        } else {
            res.render('profile.ejs', { user: req.user.facebook.name, url: req.url });
        }
    });

    app.get('/logout', function(req, res) {
        req.logout();
        req.session.destroy();
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

    /*app.post('/login-test', function(req, res, next) {
        passport.authenticate('local-login', function(err, user, info) {
            if (err) { return next(err); }
            if (!user) { return res.sendStatus(404); }

            req.logIn(user, function(err) {
                if (err) { return next(err); }
                return res.json(user);
            });
        })(req, res, next);
    });*/

	
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
    app.get('/connect/local', isLoggedIn, function(req, res) {
        res.render('connect-local.ejs', { message: req.flash('loginMessage') });
    });
    app.post('/connect/local', passport.authenticate('local-signup', {
        successRedirect : '/settings', // redirect to the secure profile section
        failureRedirect : '/connect/local', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));

    // facebook -------------------------------

    // send to facebook to do the authentication
    app.get('/connect/facebook', isLoggedIn, passport.authorize('facebook', { scope : 'email' }));

    // handle the callback after facebook has authorized the user
    app.get('/connect/facebook/callback',
        passport.authorize('facebook', {
            successRedirect : '/settings',
            failureRedirect : '/'
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

    app.post('/game', function (req, res) {
        Game.findOne({name: req.body.gameName}, function(err, game) {
            res.json(game);
        });
    });


    //return modePlayers for certain mode
    app.post('/queue', function (req, res) {
        Queue.aggregate([
            { $match: { game: req.body.gameName, modeName: req.body.modeName} },
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
        if ('qd_players' in req.body) req.body.qd_players = parseInt(req.body.qd_players);
        req.body.limit = parseInt(req.body.limit);
        req.body.offset = parseInt(req.body.offset);
        if (!req.body.qd_players) req.body.qd_players = 0;
        var maxQdP = players - req.body.qd_players;

        req.body.data.active = true;
        //console.log(req.body.data);
        Log.find({ $and: [req.body.data, {'qd_players': {$lte: maxQdP} }]}).skip(req.body.offset).limit(req.body.limit).sort({updated: -1})
        .exec(function(err, log) {
            if(log.length === 0) {
                res.json({result: false});
            } else {
                res.json({result: true, log: log});
            }
        });
    });

    app.post('/picks', function (req, res) {
        //console.log(req.body.id);
        JSON.stringify(req.body.id);
        Log.find({_id: {$in: req.body.id}}, 'userId userName qd_players active', function(err, log) {
            console.log(log);
            res.json(log);
        });
        //res.sendStatus(200);
    });

    app.post('/match', function (req, res) {
        if (req.isAuthenticated()) {
            JSON.stringify(req.body.id);;
            if (req.body.id.includes(req.session.passport.user)) { //aktualne testy nie beda dzialac teraz == zabezpieczenie przeciw dodaniu samego siebie
                Log.find({_id: {$in: req.body.id}, active:true}, function(err, log) {
                    if (log.length != req.body.id.length) {
                        res.sendStatus(404);
                    } else {
                        
                        var arr = [];
                        log.forEach(function(val){
                            arr.push(val._id);
                        });
                        push2q(q, null, req.session.passport.user, log[0].game, log[0].platform, log[0].region, log[0].modeName, log[0].modePlayers, false, arr);
                        res.sendStatus(200);
                    }
                });
            } else {
                res.sendStatus(406);
            }
        } else {
            res.sendStatus(401);
        }
    });


    app.post('/new-ad', function (req, res) {
        if (req.isAuthenticated()) {
            //console.log(req.body.automatic);
            Log.findOne({userId: req.session.passport.user, active:true}, function(err, otherLog) {
                if(!otherLog) { 
                    var date = new Date();
                    newLog = new Log;
                    newLog.platform = req.body.data.platform;
                    newLog.region = req.body.data.region;
                    newLog.game = req.body.data.game;
                    newLog.modeName = req.body.data.modeName;
                    newLog.modePlayers = req.body.data.modePlayers;
                    newLog.rank_s = req.body.data.rank_s;
                    newLog.qd_players = req.body.data.qd_players;
                    newLog.userId = req.session.passport.user;
                    //newLog.userName =
                    newLog.active = true;
                    newLog.start = date;
                    newLog.updated = date;
                    User.findOne({_id: req.session.passport.user}, function(err, user) {
                        newLog.userName = user.displayName;
                        newLog.save(function(err, log) {
                            console.log(req.body.data.automatic);
                            //push to queue
                            if(req.body.automatic) {
                                push2q(q, log._id, req.session.passport.user, newLog.game, newLog.platform, newLog.region, newLog.modeName, newLog.modePlayers, false, []);
                            } else {
                                io.to(newLog.game.replace(/\s/g, '')).emit('new', newLog);
                            }
                            res.sendStatus(200);
                        });
                    });
                } else {
                    res.sendStatus(406);
                }
            });
        } else {
            res.sendStatus(401);
        }
        //res.sendStatus(200);
    });

};

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





