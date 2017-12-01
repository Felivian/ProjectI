module.exports = function(app, passport, session, mongoose/**/,q) {
	var Session            	= require('../app/models/session');
	var cookieParser 		= require('cookie-parser');
	//cookie toucher
	/*var cookieToucher = function (req, res, next) {
		req.session.touch();
		//console.log('touched');
		next();
	}
	app.use(cookieToucher);*/
	
	
    app.get('/', function(req, res) {
    	if (req.isAuthenticated()) res.redirect('/profile');
        res.render('index.ejs');
    });

    app.get('/signup', function(req, res) {
        res.render('signup.ejs', { message: req.flash('signupMessage') });
    });

    app.get('/login', function(req, res) {
        res.render('login.ejs', { message: req.flash('loginMessage') }); 
    });

    /*app.get('/profile', isLoggedIn, function(req, res) {
        //res.render('profile.ejs', { user: req.user });
        res.json(req.user);
    });*/

    app.get('/profile', isLoggedIn, function(req, res) {
        res.render('profile.ejs', { user: req.user });
        //res.json(req.user);
    });

    app.get('/logout', function(req, res) {
        req.logout();
        req.session.destroy();
        res.redirect('/');
    });

    var Qinfo   = require('../config/Qinfo');

    app.get('/test1', function(req, res) {
        res.json(Qinfo.queue.length);
    });



    function someAction(x, y, someCallback) {
        return someCallback(x, y);
    }

    function calcProduct(x, y) {
        return x * y;
    }

    function calcSum(x, y) {
        return x + y;
    }
    // alerts 75, the product of 5 and 15
    console.log(someAction(5, 15, calcProduct));
    // alerts 20, the sum of 5 and 15
    console.log(someAction(5, 15, calcSum));

    var Qinfo   = require('../config/Qinfo');
    var _       = require('underscore');
    var Log     = require('../app/models/log');
    var wG      = require('./whatGroups');//
    app.get('/test4', function(req, res) {
        res.sendStatus(200);
        for (var asd=0; asd<500; asd++) {
            
            var test = require('../tests/generate_random')();
            //console.log(test);
            var u_qd_players = test.qd;
            var u_mode_players = test.mode;
            var u_mode_name = 'comp_'+u_mode_players;
            var u_rank_arr = test.rank;

            var min = u_rank_arr.sort(wG.sortNumber)[0];
            var max = u_rank_arr.sort(wG.sortNumber).reverse()[0];
            var u_rank_n = Math.floor((max+min)/2);

            //data from user


            var newLog = new Log();
            newLog.start = new Date();
            newLog.active = true;

            //game specific
            newLog.game = 'overwatch';
            newLog.platform = test.platform;
            newLog.region = test.region;
            newLog.rank = test.rank;

            //change later
            if (max-min == 500) {
                newLog.minSR = min;
                newLog.maxSR = max;
            } else {
                newLog.minSR = min - (500 - Math.floor((max - min)/2));
                newLog.maxSR = max + (500 - Math.floor((max - min)/2));
            }
            newLog.mode.name = u_mode_name;
            newLog.mode.players = u_mode_players;
            newLog.rank_n = u_rank_n;
            newLog.qd_players = u_qd_players;

            newLog.save(function(err) {
                if (err) throw err;
                //console.log(global.inserted);
                global.inserted=true;
                /*Log.find({active: true}, function(err, log) {
                    for(var i=0; i<log.length; i++) { 
                        push2q(log[i]._id, log[i].user_id, newLog.game, newLog.platform, newLog.region, newLog.mode.name, newLog.mode.players);
                    }
                });*/
            });
        }
    });

    setInterval(function() {
        if (global.inserted == true && global.drained == true) {
            global.inserted = false;
            global.drained = false;
            Log.find({active: true}, function(err, log) {
                for(var i=0; i<log.length; i++) { 
                    push2q(log[i]._id, log[i].user_id, log[i].game, log[i].platform, log[i].region, log[i].mode.name, log[i].mode.players);
                }
            });
        }
    },10000);

    function push2q(x,y, game, platform, region, mode_name, mode_players) {
        //do przerobienia... match json?
        var json = {
            'game'          : game,
            'platform'      : platform, 
            'region'        : region,
            'mode'          : {
                'name'      : mode_name,
                'players'   : mode_players
            } 
        };
        var i=0;
        var Qfound = false;
        do {
            if ( _.isEqual(Qinfo.queue[i], json) ) {
                q[i].push({log_id: x, user_id: y, mode_players: mode_players, i: i}, function(err) {
                    console.log('finished processing '+x);
                });
                Qfound = true;
            }
            i++
        } while( !Qfound && i<Qinfo.queue.length );
    }

    /*app.get('/test3', function(req, res) {
        console.log(req.session.id);
        q2.push({'sid': req.session.id}, function(err) {
            console.log('finished processing '+req.session.id);
        });
    });*/


    app.get('/login-test', function(req, res) {
        res.render('login-json.ejs', { message: req.flash('loginMessage') }); 
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

    app.post('/login-test', function(req, res, next) {
        passport.authenticate('local-login', function(err, user, info) {
            if (err) { return next(err); }
            if (!user) { return res.sendStatus(404); }

            req.logIn(user, function(err) {
                if (err) { return next(err); }
                return res.json(user);
            });
        })(req, res, next);
    });

	
    // =====================================
    // EXTERNAL ============================
    // =====================================

    // send to facebook to do the authentication
    app.get('/auth/facebook', passport.authenticate('facebook', { scope : 'email' }));

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
    app.get('/connect/local', function(req, res) {
        res.render('connect-local.ejs', { message: req.flash('loginMessage') });
    });
    app.post('/connect/local', passport.authenticate('local-signup', {
        successRedirect : '/profile', // redirect to the secure profile section
        failureRedirect : '/connect/local', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));

    // facebook -------------------------------

    // send to facebook to do the authentication
    app.get('/connect/facebook', passport.authorize('facebook', { scope : 'email' }));

    // handle the callback after facebook has authorized the user
    app.get('/connect/facebook/callback',
        passport.authorize('facebook', {
            successRedirect : '/profile',
            failureRedirect : '/'
        }));

    // messenger -------------------------------

    // send to facebook to do the authentication
    //app.get('/connect/messenger', passport.authorize('facebook', { scope : 'email' }));

    // handle the callback after facebook has authorized the user
    /*app.get('/connect/messenger/callback',
        passport.authorize('facebook', {
            successRedirect : '/profile',
            failureRedirect : '/'
    }));*/


    // =============================================================================
    // UNLINK ACCOUNTS =============================================================
    // =============================================================================
    // local -----------------------------------
    app.get('/unlink/local', function(req, res) {
        var user            = req.user;
        user.local.email    = undefined;
        user.local.password = undefined;
        user.save(function(err) {
            res.redirect('/profile');
        });
    });

    // facebook -------------------------------
    app.get('/unlink/facebook', function(req, res) {
        var user            = req.user;
        user.facebook.token = undefined;
        user.save(function(err) {
            res.redirect('/profile');
        });
    });

    // =====================================
    // SMTH ================================
    // =====================================


};

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {
	
    // if user is authenticated in the session, carry on 
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/');
}





