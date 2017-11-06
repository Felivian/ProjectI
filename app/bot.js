module.exports = function(app, bot, mongoose, q) {
	var sh 		= require("shorthash");
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
	});


	bot.hear('ow', (payload, chat) => {
		
		q.push({name: 'foo'}, function(err) {
		    console.log('finished processing foo');
		});
		chat.say('Got it', { typing: true });
	});


	bot.hear('code', (payload, chat) => {
		chat.getUserProfile().then((user) => {
			console.log(sh.unique(user.id));
			chat.say(sh.unique(user.id), { typing: true });
		});
	});
};