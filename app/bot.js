module.exports = function(app, bot, mongoose, io) {
	var sh 				= require('shorthash');
	var User 			= require('../app/models/user');
	var Log 			= require('../app/models/log');
	var Session 		= require('../app/models/session');
	var Ask 			= require('./convoAsk');
	var wG 				= require('../app/whatGroups');
	var _ 				= require('underscore');
	var configAuth 		= require('../config/auth');
	var configExtras 	= require('../config/extras');
	var GIPHY_URL 		= 'http://api.giphy.com/v1/gifs/random?api_key='+configAuth.giphyApiKey+'&tag=';
	var fetch 			= require('node-fetch');
	var mf              = require('./moreFunctions');//
	//bot.say(1493247637377838, 'test');
	bot.setGreetingText('Welcome to ProjectI author: Mateusz Hekert');

	bot.setGetStartedButton((payload, chat) => {
		chat.say({
			text: 'Choose what you want to know more about.',
			buttons: [
				{ type: 'postback', title: 'Renew / Terminate', payload: 'renewterminate' },
				{ type: 'postback', title: 'ad | add', payload: 'add' },
				{ type: 'postback', title: 'Login', payload: 'login' },
			]
		});
	});


	// bot.say(1493247637377838,{ 
	// 	text: 'Choose what you want to know more about.',
	// 	buttons: [
	// 		{ type: 'postback', title: 'Renew / Terminate', payload: 'renewterminate' },
	// 		{ type: 'postback', title: 'ad | add', payload: 'add' },
	// 		{ type: 'postback', title: 'Login', payload: 'login' },
	// 	]
 //    });


	bot.hear('login', (payload, chat) => {
		chat.sendGenericTemplate([{ 
			title: 'Welcome to ProjectI', 
			buttons: [{ 
				type: 'account_link',
            	url: configExtras.websiteURL+'/messenger-login' 
            }] 
        }]);
	});
	
	// bot.hear('logout', (payload, chat) => {
	// 	chat.sendGenericTemplate([{ 
	// 		title: 'Logout', 
	// 		buttons: [{ 
	// 			type: 'account_unlink',
 //            }] 
 //        }]);
	// });

	bot.setPersistentMenu([
		{
			type: 'web_url',
			title: 'Go to Website',
			url: configExtras.websiteURL
		},
		{ 
			type: 'postback',
			title: 'Commends',
			payload: 'commends' 
		}
	]);



	bot.hear(['add','ad'], (payload, chat) => {
		if(isConnected(chat)) {
			chat.conversation((convo) => {
				Ask.askAdd(convo, io);
			});
		} else {
			chat.say('You need to login to preform this action.', { typing: true });
		}
	});


	bot.on('postback:commends', (payload, chat) => {
		chat.say({
			text: 'Choose what you want to know more about.',
			buttons: [
				{ type: 'postback', title: 'Renew / Terminate', payload: 'renewterminate' },
				{ type: 'postback', title: 'ad | add', payload: 'add' },
				{ type: 'postback', title: 'Login', payload: 'login' },
			]
		});
	});
	bot.hear(['commends','help'], (payload, chat) => {
		chat.say({
			text: 'Choose what you want to know more about.',
			buttons: [
				{ type: 'postback', title: 'Renew/Terminate', payload: 'renewterminate' },
				{ type: 'postback', title: 'ad / add', payload: 'add' },
				{ type: 'postback', title: 'Login', payload: 'login' },
			]
		});
	});



	bot.hear(['author','about'], (payload, chat) => {
		chat.say('ProjectI bot', { typing: true }).then(() => {
			chat.say('Mateusz Hekert', { typing: true });
		});
	});


	bot.on('postback:renewterminate', (payload, chat) => {
		chat.say('Add new ad with same parameters as last or terminate active one.', { typing: true });
	});
	bot.on('postback:add', (payload, chat) => {
		chat.say('Answer on multiple questions to add an ad.', { typing: true });
	});
	bot.on('postback:login', (payload, chat) => {
		chat.say('You need to login to use this app.', { typing: true });
	});

	bot.hear('sure', (payload, chat) => {
		const query = 'noice';
		fetch(GIPHY_URL + query)
	    .then(res => res.json())
	    .then(json => {
	      	chat.say({
		        attachment: 'image',
		        url: json.data.image_url
			}, {
		        typing: true
			}).then(() => {
				chat.sendGenericTemplate( [{ 
					title: 'Noice!', 
					buttons: [{ 
						type: 'web_url',
						url: configExtras.websiteURL,
						title: 'C\'mon, lets find some friends!',
		            }]
	        	}]);
			});
	    });	
	});


	bot.hear('maybe later', (payload, chat) => {
		const query = 'ok';
		fetch(GIPHY_URL + query)
	    .then(res => res.json())
	    .then(json => {
	        chat.say({
		        attachment: 'image',
		        url: json.data.image_url
			}, {
		        typing: true
			}).then(() => {
				chat.say('Got it.', {typing: true});
			});
	    });	
	});

	bot.hear('No way!', (payload, chat) => {
		const query = 'sad';
		fetch(GIPHY_URL + query)
	    .then(res => res.json())
	    .then(json => {
	        chat.say({
		        attachment: 'image',
		        url: json.data.image_url
			}, {
		        typing: true
			}).then(() => {
				chat.say('Right in the feels...', {typing: true});
				chat.getUserProfile().then((mUser) => {
					User.findOne({'messenger.id': mUser.id}, function(err, user) {
						if (user) {
							mf.changeChance(user._id, -1);
						}
					});
				});
			});
	    });	
	});

	bot.hear('renew', (payload, chat) => {
		chat.getUserProfile().then((mUser) => {
			console.log(mUser.id);
			User.findOne({'messenger.id': mUser.id}, function(err, user) {
				if (user) {
					var datetime = new Date;
					console.log(user._id);
					Log.find({userId: user._id}).sort({start: -1}).limit(1).exec(function(err, userLogs) {
						if (!userLogs[0].active) {
							newLog = new Log;
							newLog.userId = userLogs[0].userId;
							newLog.userName = userLogs[0].userName;
							newLog.qdPlayers = userLogs[0].qdPlayers;
							newLog.rankS = userLogs[0].rankS;
							newLog.modePlayers = userLogs[0].modePlayers;
							newLog.modeName = userLogs[0].modeName;
							newLog.game = userLogs[0].game;
							newLog.region = userLogs[0].region;
							newLog.platform = userLogs[0].platform;
							newLog.active = true;
							newLog.start = datetime;
							//newLog.updated = datetime;
							newLog.save(function(err, log) {
								if (log) {
									chat.say('Your ad was renewed for another hour.', {typing: true});
								}
							});
						} else {
							chat.say('Can\'t add another ad while one is active.', {typing: true});
						}
					});
				} else {
					chat.say('You need to login to preform this action.', { typing: true });
				}
			});
		});
	});
	bot.hear('terminate', (payload, chat) => {
		chat.getUserProfile().then((mUser) => {
			console.log(mUser.id);
			User.findOne({'messenger.id': mUser.id}, function(err, user) {
				var datetime = new Date;
				if (user) {
					Log.updateOne({ userId: user._id, active: true}, { $set: {end: datetime, active: false, success: false} }, function(err, log) {
						if (log) {
							chat.say('Your ad was terminated.', {typing: true});
						}
					});
				} else {
					chat.say('You need to login to preform this action.', { typing: true });
				}
			});
		});
	});

	function isConnected(chat) {
		chat.getUserProfile().then((mUser) => {
			User.findOne({'messenger.id': mUser.id}, function(err, user) {
				if (user) {
					return true;
				} else {

					return false;
				}
			});
		})
	}
};