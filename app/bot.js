module.exports = function(app, bot, mongoose, q) {
	var sh 		= require('shorthash');
	var User 	= require('../app/models/user');
	var Log 	= require('../app/models/log');
	var Ask 	= require('../app/bot_dep/ask')/*(bot, mongoose, q)*/;
	var wG 	= require('../app/whatGroups');
	var Qinfo 	= require('../config/Qinfo');
	var _ 		= require('underscore');

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

		//data from user
		var u_qd_players = 1;
		var u_mode_players = 3;
		var u_mode_name = 'comp_'+u_mode_players;
		var u_rank_arr = [2500,2100,2600];
		var min = u_rank_arr.sort()[0];
		var max = u_rank_arr.sort().reverse()[0];
		var u_rank_n = Math.floor((max+min)/2);

		var u_roles = [['d','h','t'],['d','h','t'],['d','h','t']];
		//data from user


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
				if (newLog.mode.players == 6) {
					newLog.roles = wG.getRoles(u_roles);
				}
				//change later

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




	function push2q(x,y, game, platform, region, mode_name, mode_players) {
		//do przerobienia... match json?
		var json = {
            'game'      	: game,
            'platform'  	: platform, 
            'region'    	: region,
            'mode'      	: {
            	'name'		: mode_name,
            	'players' 	: mode_players
            } 
        };
        var i=0;
        var Qfound = false;
        do {
        	if ( _.isEqual(Qinfo.queue[i], json) ) {
        		console.log('test '+i);
        		q[i].push({log_id: x, user_id: y, mode_players: mode_players}, function(err) {
					console.log('finished processing '+x);
				});
				Qfound = true;
        	}
        	i++
		} while( !Qfound && i<Qinfo.queue.length );
	}

};