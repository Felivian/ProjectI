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
        if (req.user) {
            res.render('home.ejs', { user: req.user.facebook.name, url: 'home' });
        } else {
            res.render('home.ejs', {user: null, url: 'home'});
        }  
    });

    app.get('/about', function(req, res) {
        if (req.user) {
            res.render('about.ejs', { user: req.user.facebook.name, url: 'about' });
        } else {
            res.render('about.ejs', {user: null, url: 'about'});
        }  
    });

    app.get('/settings', function(req, res) {
        if (req.user) {
            res.render('settings.ejs', { user: req.user.facebook.name, url: 'settings' });
        } else {
            res.render('settings.ejs', {user: null, url: 'settings'});
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
            res.render('profile.ejs', { user: req.user.facebook.name, url: 'profile' });
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





