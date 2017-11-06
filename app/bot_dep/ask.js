var sh 		= require("shorthash");
var User 	= require('../models/user');

module.exports = /*function(bot, mongoose, q) */{

	//greeting convo
	askAccount : (convo) => {
		convo.ask({text: 'Do you have an account?', quickReplies: ['Yes', 'No']}, (payload, convo) => {
			convo.set('account_anw',payload.message.text)
			if (payload.message.text == 'No') {
				convo.say('We\'ll create it. It might take a sec.').then(() => module.exports.noAccount(convo));
			} else if (payload.message.text == 'Yes') {
				convo.say('Need code').then(() => module.exports.endAccount(convo));
			}
		});
	},
	noAccount : (convo) => {
		convo.getUserProfile().then((user) => {
			User.findOne({'messenger.id': user.id}, function (err, userInDb) {
				if (!userInDb) {
					var newUser = new User();
		            newUser.messenger.id = user.id;
		            newUser.messenger.first_name = user.first_name;
		            newUser.messenger.last_name = user.last_name;
		            newUser.messenger.profile_pic = user.profile_pic;
		            newUser.save(function(err) {
		    	        if (err) convo.say('error', { typing: true });
		    	        else convo.say(`OK, ${user.first_name}, we created Your account`, { typing: true }).then(() => module.exports.endAccount(convo));
		            });
		        } else {
		        	convo.say(`Hi ${user.first_name}`, { typing: true }).then(() => module.exports.endAccount(convo));
		        }
	        });
		});
	},
	endAccount : (convo) => {
		convo.say('type \'profile\' to insert your profile information or insert them on our website', { typing: true })
		.then(function() {
			convo.say('http://localhost:8080');
		});
		convo.end();
	},

	//profile convo
	askProfile : (convo) => {
		convo.ask({text: 'Which information would You like to insert?', quickReplies: ['Battletag', 'Skill Rank', 'Playable heroes', 'Active hours']}, (payload, convo) => {
			if (payload.message.text == 'Battletag') {
				convo.sendAction('mark_seen').then(() => module.exports.askBattletag(convo));
			} else if (payload.message.text == 'Skill Rank') {
				convo.sendAction('mark_seen').then(() => module.exports.askSR(convo));
			} else if (payload.message.text == 'Playable heroes') {
				convo.sendAction('mark_seen').then(() => module.exports.askHeroes(convo));
			} else if (payload.message.text == 'Active hours') {
				convo.sendAction('mark_seen').then(() => module.exports.askHours(convo));
			}

		});
	},


	//battletag convo
	askBattletag : (convo) => {
		convo.ask('Write your battletag like in example name#1234', (payload, convo) => {
			convo.set('battletag',payload.message.text.match(/[^\s\!\@\#\$\%\^\&\*\(\)\_\+\-\=\[\{\]\}\;\:\'\"\|\\\,\<\.\>\/\?\`\~]{3,12}#[0-9]+/gi));
			console.log(convo.get('battletag'));
			if (convo.get('battletag') != null ) {
				if (convo.get('battletag')[0].match(/^[^0-9]/) != null ) {
					convo.sendAction('mark_seen').then(() => module.exports.askBattletagConfirm(convo));
				} else {
					convo.say('That\'s not the battletag we were looking for').then(() => module.exports.askBattletag(convo));
				}
			} else {
				convo.say('That\'s not the battletag we were looking for').then(() => module.exports.askBattletag(convo));
			}
		});
	},

	askBattletagConfirm : (convo) => {
		convo.ask({text: `Is ${convo.get('battletag')[0]} Your battletag?`, quickReplies: ['Yes', 'No']}, (payload, convo) => {
			if (payload.message.text == 'No') {
				convo.sendAction('mark_seen').then(() => module.exports.askBattletag(convo));
			} else if (payload.message.text == 'Yes') {
				convo.getUserProfile().then((m_user) => {
					User.findOneAndUpdate({'messenger.id': m_user.id}, {$set:{'battletag': convo.get('battletag')[0]}}, function (err, user) {
	 					if (err) convo.say('Sorry, error').then(() => module.exports.askBattletag(convo));
	 					convo.say('Neat.').then(() => module.exports.askEnd(convo));
	 				});
				});
				
			}	
		});
	},

	//SR convo
	askSR : (convo) => {
		convo.ask('Write your skill rank like in example: 2475', (payload, convo) => {
			var sr = parseInt(payload.message.text.match(/[0-9]{3,4}/));
			console.log(sr);
			if (isNaN(sr) || sr>5000 || sr<500) {
				convo.say('That\'s not the SR we were looking for').then(() => module.exports.askSR(convo));
			} else {
				convo.getUserProfile().then((m_user) => {
					User.findOneAndUpdate({'messenger.id': m_user.id}, {$set:{'ow_sr': convo.get('battletag')[0]}}, function (err, user) {
	 					if (err) convo.say('Sorry, error').then(() => module.exports.askBattletag(convo));
	 					convo.say('K, m8.').then(() => module.exports.askEnd(convo));
	 				});
				});	
			}
		});
	},


	askHeroes : (convo) => {
		convo.ask('Write all heroes you can play with', (payload, convo) => {
			var heroes =[];
			if (payload.message.text.match(/(reinhardt|rein|rain|wilhelm)/gi)) heroes.push('reinhardt');
			if (payload.message.text.match(/(roadhog|hog|road|mako|rutledge)/gi)) heroes.push('roadhog');
			if (payload.message.text.match(/(dva|d.va|hana|song)/gi)) heroes.push('dva');
			if (payload.message.text.match(/(winston|monkey|gorilla|scientist)/gi)) heroes.push('winston');
			if (payload.message.text.match(/(orisa|ori|anchora)/gi)) heroes.push('orisa');
			if (payload.message.text.match(/(zarya|aleksandra|zaryanova)/gi))  heroes.push('zarya');
			if (payload.message.text.match(/(zenyatta|zen)/gi)) heroes.push('zenyatta');
			if (payload.message.text.match(/(ana|nana|anna)/gi)) heroes.push('ana');
			if (payload.message.text.match(/(mercy|angela|ziegler)/gi)) heroes.push('mercy');
			if (payload.message.text.match(/(lucio|frog|lúcio|correia|santos)/gi)) heroes.push('lucio');
			if (payload.message.text.match(/(symmetra|symm|sym|satya|vaswani)/gi)) heroes.push('symmetra');
			if (payload.message.text.match(/(genji|gengu)/gi)) heroes.push('genji');
			if (payload.message.text.match(/(soldier|76|jack|morrison|dad|69)/gi)) heroes.push('soldier');
			if (payload.message.text.match(/(sombra|arg)/gi)) heroes.push('sombra');
			if (payload.message.text.match(/(mccree|mcree|mccre|mcre|jesse)/gi)) heroes.push('mccree');
			if (payload.message.text.match(/(reaper|gabriel|reyes)/gi)) heroes.push('reaper');
			if (payload.message.text.match(/(tracer|lena|oxton)/gi)) heroes.push('tracer');
			if (payload.message.text.match(/(pharah|fareeha)/gi)) heroes.push('pharah');
			if (payload.message.text.match(/(doomfist|doom|fist|df|akande|ogundimu)/gi)) heroes.push('doomfist');
			if (payload.message.text.match(/(widowmaker|widow|amélie|amelie|lacroix)/gi)) heroes.push('widowmaker');
			if (payload.message.text.match(/(hanzo)/gi)) heroes.push('hanzo');
			if (payload.message.text.match(/(torbjörn|torbjorn|torb|lindholm)/gi)) heroes.push('torbjorn');
			if (payload.message.text.match(/(bastion|e54)/gi))  heroes.push('bastion');
			if (payload.message.text.match(/(junkrat|junk|rat|jamison|fawkes)/gi)) heroes.push('junkrat');
			if (payload.message.text.match(/(mei|ling|zhou)/gi)) heroes.push('mei');
			console.log(heroes);
			if (heroes.length <= 0) {
				convo.say('C\'mon You must be good on some heroes!').then(() => module.exports.askHeroes(convo));
			} else {
				convo.getUserProfile().then((m_user) => {
					User.findOneAndUpdate({'messenger.id': m_user.id}, {$set:{'heroes': heroes}}, function (err, user) {
	 					if (err) convo.say('Sorry, error').then(() => module.exports.askHeroes(convo));
	 					convo.say('Got you fam.').then(() => module.exports.askEnd(convo));
	 				});
				});	
			}
		});
	},

	askEnd : (convo) => {
		convo.sendAction('mark_seen').then(function() {convo.end();});
	},
}