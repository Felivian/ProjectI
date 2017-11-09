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
		}
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
				//console.log(newLog);
				newLog.save(function(err) {
                	if (err) throw err;
                });
			}).then(function() {
				//console.log(newLog);
				/*Log.find({ 'active':'true', 'start': {"$lte" : newLog.start}  } , function(err, log){
					for(var i=0;i<log.length;i++) {
						q.push({log_id: log._id, user_id: log.user_id}, function(err) {
							//console.log('finished processing '+x);
						});
					}
				});*/
				q.push({log_id: newLog._id, user_id: newLog.user_id}, function(err) {
		    		console.log('finished processing '+newLog._id);
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

};