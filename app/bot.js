module.exports = function(app, bot, mongoose, q, io) {
	var sh 		= require('shorthash');
	var User 	= require('../app/models/user');
	var Log 	= require('../app/models/log');
	var Session 	= require('../app/models/session');
	var Ask 	= require('../app/bot_dep/ask')/*(bot, mongoose, q,io)*/;
	var wG 		= require('../app/whatGroups');
	//var Qinfo 	= require('../config/Qinfo');
	var _ 		= require('underscore');
	var configAuth = require('../config/auth');
	var configExtras = require('../config/extras');
	var GIPHY_URL 	= 'http://api.giphy.com/v1/gifs/random?api_key='+configAuth.giphyApiKey+'&tag=';
	var fetch 		= require('node-fetch');
	//bot.say(1493247637377838, 'test');

	bot.hear('login', (payload, chat) => {
		chat.sendGenericTemplate([{ 
			title: 'Welcome to ProjectI', 
			buttons: [{ 
				type: 'account_link',
            	url: configExtras.websiteURL+'/messenger-login' 
            	//url: 'https://jzn2ya88cl1agl16zyc2.localtunnel.me' 
            }] 
        }]);
	});
	
	bot.hear('logout', (payload, chat) => {
		chat.sendGenericTemplate([{ 
			title: 'Logout', 
			buttons: [{ 
				type: 'account_unlink',
            }] 
        }]);
	});

	bot.setPersistentMenu([
		{
			type: 'web_url',
			title: 'Go to Website',
			url: configExtras.websiteURL
		},
	]);
	
	bot.hear('hello', (payload, chat) => {
		chat.conversation((convo) => {
			Ask.askAccount(convo);
		});
	});

	bot.hear(['add','ad'], (payload, chat) => {
		chat.conversation((convo) => {
			Ask.askAdd(convo, io);
		});
	});

	bot.hear('profile', (payload, chat) => {
		chat.conversation((convo) => {
			// convo is available here...
			Ask.askProfile(convo);
		});
	});

	bot.hear(['delete'], (payload, chat) => {
		chat.getUserProfile().then((mUser) => {
			User.findOne({'messenger.id': mUser.id}, function(err, user) {
				Log.findOne({userId: user,active:true}, function(err, userLog) {
		            if (userLog) {
		                userLog.end = new Date();
		                userLog.active = false;
		                userLog.success = false;
		                var json = {};
		                json.id = [userLog._id];
		                json.userId = [userLog.userId];
		                userLog.save(function(err, uLog) {
		                    io.to(userLog.game.replace(/\s/g, '')).emit('delete', json);
		                    chat.say('Your ad was deleted', { typing: true });
		                }); 
		            } else {
		                chat.say('You don\'t have active ad.', { typing: true });
		            }
		            
		        });
		    });
		});
	});
	

	//zmenic pozniej na pierwsza wiadomosc
	bot.hear('help', (payload, chat) => {
		chat.say({
			text: 'How can I help You?',
			quickReplies: ['Commends', 'About']
		}, { typing: true })
	});


	bot.hear('about', (payload, chat) => {
		chat.say('ProjectI bot', { typing: true });
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
				chat.say('Got it.', {typing: true});
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
					Log.updateOne({ userId: user._id, active: true},{ $set: {updated: datetime}}, function(err, log) {
						if (log) {
							chat.say('Your ad was renewed for another hour.', {typing: true});
						}
					});
				}
			});
		});
	});
	bot.hear('terminate', (payload, chat) => {
		chat.getUserProfile().then((mUser) => {
			console.log(mUser.id);
			User.findOne({'messenger.id': mUser.id}, function(err, user) {
				var datetime = new Date;
				Log.updateOne({ userId: user._id, active: true}, { $set: {end: datetime, active: false, success: false} }, function(err, log) {
					if (log) {
						chat.say('Your ad was terminated.', {typing: true});
					}
				});
			});
		});
	});
	


	// bot.hear('code', (payload, chat) => {
	// 	chat.getUserProfile().then((user) => {
	// 		console.log(sh.unique(user.id));
	// 		chat.say(sh.unique(user.id), { typing: true });
	// 	});
	// });


};