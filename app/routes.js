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
        /*console.log(req.query.account_linking_token);
        console.log(' ');
        console.log(req.query.redirect_uri);
        console.log(' ');
        res.redirect(req.query.redirect_uri+'&authorization_code=200');*/
    	if (req.isAuthenticated()) {
            res.redirect('/profile');
        } else {
            res.render('index.ejs');
        }
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


















    //TEST START
/*    var Qinfo   = require('../config/Qinfo');

    app.get('/test1', function(req, res) {
        res.json(Qinfo.queue.length);
    });


    var _       = require('underscore');
    var Log     = require('../app/models/log');
    var wG      = require('./whatGroups');//
    var mf      = require('./main_functions');//
    app.get('/test4', function(req, res) {
        res.sendStatus(200);
        for (var asd=0; asd<500; asd++) {
            
            var test = require('../tests/generate_random')();

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


            newLog.save(function(err, log) {
                if (err) throw err;
                
                var qNr = mf.getNrOfQ(log);
                if (qNr) {
                    global.wasInserted[qNr] = true;
                }
            });
        }
    });
    
*/
    //TEST END















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





