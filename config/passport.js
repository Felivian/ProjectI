var LocalStrategy    = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var TwitterStrategy  = require('passport-twitter').Strategy;
var GoogleStrategy   = require('passport-google-oauth').OAuth2Strategy;

var User       = require('../app/models/user');

var configAuth = require('./auth');

module.exports = function(passport) {

	passport.serializeUser(function(user, done) {
		done(null, user.id);
	});

	passport.deserializeUser(function(id, done) {
		User.findById(id, function(err, user) {
			done(err, user);
		});
	});

	passport.use('local-login', new LocalStrategy({
		usernameField : 'email',
		passwordField : 'password',
		passReqToCallback : true
	},
	function(req, email, password, done) {
		process.nextTick(function() {
			User.findOne({ 'local.email' :  email }, function(err, user) {
				if (err)
					return done(err);
				if (!user)
					return done(null, false, req.flash('loginMessage', 'No user found.'));

				if (!user.validPassword(password))
					return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.'));

				else
					return done(null, user);
			});
		});

	}));

	passport.use('local-signup', new LocalStrategy({
		usernameField : 'email',
		passwordField : 'password',
		passReqToCallback : true 
	},
	function(req, email, password, done) {
		process.nextTick(function() {
			User.findOne({'local.email': email}, function(err, existingUser) {
				if (err)
					return done(err);

				if (existingUser) 
					return done(null, false, req.flash('signupMessage', 'That email is already taken.'));

				if(req.user) {
					var user            = req.user;
					user.local.email    = email;
					user.local.password = user.generateHash(password);
					user.save(function(err) {
						if (err)
							throw err;
						return done(null, user);
					});
				} 
				else {
					var newUser            = new User();
					newUser.local.email    = email;
					newUser.local.password = newUser.generateHash(password);
					newUser.displayName    = email;
					newUser.lastActive     = new Date();
					newUser.save(function(err) {
						if (err)
							throw err;

						return done(null, newUser);
					});
				}

			});
		});

	}));

	passport.use(new FacebookStrategy({

		clientID		: configAuth.facebookAuth.clientID,
		clientSecret	: configAuth.facebookAuth.clientSecret,
		callbackURL		: configAuth.facebookAuth.callbackURL,
		passReqToCallback : true 

	},
	function(req, token, refreshToken, profile, done) {
		process.nextTick(function() {
			if (!req.user) {

				User.findOne({ 'facebook.id' : profile.id }, function(err, user) {
					if (err)
						return done(err);

					if (user) {
						if (!user.facebook.token) {
							user.facebook.token = token;
							user.facebook.name  = profile.displayName;
							user.save(function(err) {
								if (err)
									throw err;
								return done(null, user);
							});
						}

						return done(null, user);
					} else {
						var newUser            = new User();
						newUser.facebook.id    = profile.id;
						newUser.facebook.token = token;
						newUser.facebook.name  = profile.displayName;
						user.displayName = profile.displayName;
						newUser.lastActive     = new Date();
						newUser.save(function(err) {
							if (err)
								throw err;
							return done(null, newUser);
						});         
					}
				});

			} else {
				User.findOne({ 'facebook.id' : profile.id }, function(err, user) {
					if (err)
						return done(err);

					if (!user || (user != null && user.facebook.id == profile.id) ) {
						var user            = req.user;
						user.facebook.id    = profile.id;
						user.facebook.token = token;
						user.facebook.name  = profile.displayName;

						user.save(function(err) {
							if (err)
								throw err;
							return done(null, user);
						});
					} else {
						return done(err);
					}
				});

			}
		});

	}));

};
