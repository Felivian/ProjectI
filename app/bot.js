module.exports = function(app, bot, mongoose, q) {
	var sh 		= require('shorthash');
	var User 	= require('../app/models/user');
	var Log 	= require('../app/models/log');
	var Ask 	= require('../app/bot_dep/ask')/*(bot, mongoose, q)*/;
	//bot.say(1493247637377838, 'test');

	bot.setPersistentMenu([
		{
			type: 'web_url',
			title: 'Go to Website',
			url: 'http://localhost:8080'
		},
	]);
	
	bot.hear('hello', (payload, chat) => {
		chat.conversation((convo) => {
			// convo is available here...
			Ask.askAccount(convo);
		});
	});

	bot.hear('profile', (payload, chat) => {
		chat.conversation((convo) => {
			// convo is available here...
			Ask.askProfile(convo);
		});
	});

	bot.hear('battletag', (payload, chat) => {
		chat.conversation((convo) => {
			// convo is available here...
			Ask.askBattletag(convo);
		});
	});

	bot.hear('sr', (payload, chat) => {
		chat.conversation((convo) => {
			// convo is available here...
			Ask.askSR(convo);
		});
	});

	//zmenic pozniej na pierwsza wiadomosc
	bot.hear('help', (payload, chat) => {
		chat.say({
			text: 'How can I help You?',
			quickReplies: ['Commends', 'About']
		}, { typing: 2000 })
	});

	bot.hear('about', (payload, chat) => {
		chat.say('ProjectI bot', { typing: true });
		/*chat.getUserProfile().then((muser) => {
			console.log(muser);
		})*/
	});


	bot.hear('ow', (payload, chat) => {
		//if user exists or smth
		chat.say('Got it', { typing: true });

		var newLog = new Log();
		chat.getUserProfile().then((muser) => {
			User.findOne({'messenger.id': muser.id}, function (err, user) {
				newLog.user_id = user._id;
				newLog.start = new Date();
				newLog.active = true;

				//game specific
				newLog.game = 'overwatch';
				newLog.platform = user.overwatch.platform;
				newLog.region = user.overwatch.region;
				newLog.rank_n = user.overwatch.SR;
				newLog.mode.name = 'comp';
				newLog.mode.players = 3;
				//game specific

				//console.log(newLog);
				newLog.save(function(err) {
                	if (err) throw err;
					Log.find({active: true}, function(err, log) {
						for(var i=0; i<log.length; i++) { 
							push2q(log[i]._id, log[i].user_id, newLog.game, newLog.platform, newLog.region, newLog.mode.name, newLog.mode.players);
						}
					});
                });
			});
		});
		
	});


	bot.hear('code', (payload, chat) => {
		chat.getUserProfile().then((user) => {
			console.log(sh.unique(user.id));
			chat.say(sh.unique(user.id), { typing: true });
		});
	});




	function push2q(x,y, game, platform, region, mode_name,mode_players) {
		//do przerobienia... match json?
		if (game == 'overwatch') {
			if (platform == 'pc') {
				if (region == 'eu') {
					q[0].push({log_id: x, user_id: y}, function(err) {
						console.log('finished processing '+x);
					});
				} else if (region == 'na') {
					//q push
				} else if (region == 'asia') {
					//q push
				}
			} else if (platform == 'psn') {
				if (region == 'eu') {
					//q push
				} else if (region == 'na') {
					//q push
				} else if (region == 'asia') {
					//q push
				}
			} else if (platform == "xbl") {
				if (region == 'eu') {
					//q push
				} else if (region == 'na') {
					//q push
				} else if (region == 'asia') {
					//q push
				}
			}
		}

		//other games
	}

};