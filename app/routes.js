module.exports = function(app, passport, session, mongoose/**/,q) {
	var Session            	= require('../app/models/session');
	var cookieParser 		= require('cookie-parser');
    var request             = require('request');
    var configAuth          = require('../config/auth.js');
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
        //console.log('TUTAJ!!! '+req.query.redirect_uri);
        req.session.redirect_uri = req.query.redirect_uri;
        req.session.account_linking_token = req.query.account_linking_token;
    	if (req.isAuthenticated()) {
            res.redirect('/profile');
        } else {
            res.render('index.ejs');
        }
    });

    app.get('/signup', isNotLoggedIn, function(req, res) {
        res.render('signup.ejs', { message: req.flash('signupMessage') });
    });

    app.get('/login', isNotLoggedIn,  function(req, res) {
        res.render('login.ejs', { message: req.flash('loginMessage') }); 
    });

    /*app.get('/profile', isLoggedIn, function(req, res) {
        //res.render('profile.ejs', { user: req.user });
        res.json(req.user);
    });*/

    app.get('/profile', isLoggedIn, function(req, res) {
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
            res.render('profile.ejs', { user: req.user });
        }
        //res.json(req.user);
    });

    app.get('/logout', function(req, res) {
        req.logout();
        req.session.destroy();
        res.redirect('/');
    });


    /*app.get('/login-test', function(req, res) {
        res.render('login-json.ejs', { message: req.flash('loginMessage') }); 
    });*/

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

    /*app.get('/auth/facebook/callback', function(req, res) {
        console.log('test1');
        if (!req.session.redirect_uri) {
            console.log('test2');
            passport.authenticate('facebook', {
                successRedirect : '/profile',
                failureRedirect : '/'
            }); 
        } else {
            passport.authenticate('facebook', {
                successRedirect : req.session.redirect_uri,
                failureRedirect : '/'
            }); 
        }
        //console.log('HERE!!!!! '+req.session.redirect_uri);
    });*/
        

	
	// =============================================================================
    // AUTHORIZE (ALREADY LOGGED IN / CONNECTING OTHER SOCIAL ACCOUNT) =============
    // =============================================================================
	// locally --------------------------------
    app.get('/connect/local', isLoggedIn, function(req, res) {
        res.render('connect-local.ejs', { message: req.flash('loginMessage') });
    });
    app.post('/connect/local', passport.authenticate('local-signup', {
        successRedirect : '/profile', // redirect to the secure profile section
        failureRedirect : '/connect/local', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));

    // facebook -------------------------------

    // send to facebook to do the authentication
    app.get('/connect/facebook', isLoggedIn, passport.authorize('facebook', { scope : 'email' }));

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
    app.get('/unlink/local', isLoggedIn, function(req, res) {
        var user            = req.user;
        user.local.email    = undefined;
        user.local.password = undefined;
        user.save(function(err) {
            res.redirect('/profile');
        });
    });

    // facebook -------------------------------
    app.get('/unlink/facebook', isLoggedIn, function(req, res) {
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

function isNotLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        res.redirect('/'); 
    } else {
        return next();    
    }
}





