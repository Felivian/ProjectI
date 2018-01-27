//var _    = require('underscore');
var User     = require('./models/user');
var Queue    = require('./models/queue');
var Session  = require('./models/session');
var async    = require('async');
var fetch = require('node-fetch');
var GIPHY_URL = `http://api.giphy.com/v1/gifs/random?api_key=30lORG6s0LhJAz4EZW09N5ifmvYgnlYN&tag=`;
module.exports = {
	changeChance: function(to_user, by) {
		to_user = '5a11d3786496960a50b33e50';
		var days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
		var d = new Date();
		var dayName = days[d.getDay()];
		var hour = d.getHours();

		User.updateOne({_id: to_user, [`active.${dayName}`]: {$elemMatch: {hour: hour}} },
		{ $inc: { [`active.${dayName}.$.chance`] : by }}, function(err, user) {
			if (user.nModified === 0) {
				User.updateOne({_id: to_user },
				{ $push: { [`active.${dayName}`] : {hour: hour, chance: by} }}, function(err, user) {

				});
			}
		});
	},
	sendInfo: function(io, bot, matchesId) {
		User.find({_id: {$in: matchesId}}, function(err, user) {
			async.each(user, function(user_i, callback) {
				console.log(user_i.messenger.id);
				//bot.say(user_i.messenger.id, 'Found match!');
				const query = 'happy';
				fetch(GIPHY_URL + query)
			    .then(res => res.json())
			    .then(json => {
			    	bot.say(user_i.messenger.id, {
			      //chat.say({
				        attachment: 'image',
				        url: json.data.image_url
					}, {
				        typing: true
					}).then(() => {
						bot.sendGenericTemplate(user_i.messenger.id, [{ 
							title: 'Found match!', 
							buttons: [{ 
								type: 'web_url',
								url: 'localhost:8080/profile',
	  							title: 'See Your match!',
				            }]
			        	}]);
					});
			    });
				callback();
			});
		});
		Session.find({'data.passport.user': {$in: matchesId}}, function(err, session) {
			async.each(session, function(session_i, callback2) {
				io.to(session_i.socketId).emit('match', '');
				console.log(matchesId);
				callback2();  
			}, function(err) {
				console.log(matchesId);
			});
		});	
	},

	sendError: function(io, bot, userId) {
		User.findOne({_id: userId}, function(err, user) {
			const query = 'sad';
			fetch(GIPHY_URL + query)
		    .then(res => res.json())
		    .then(json => {
		    	bot.say(user.messenger.id, {
		      //chat.say({
			        attachment: 'image',
			        url: json.data.image_url
				}, {
			        typing: true
				}).then(() => {
					// bot.say(user.messenger.id, 'Sorry, some ad is no longer active')
					// .then(() => {
					bot.sendGenericTemplate(user.messenger.id, [{ 
						title: 'Sorry, some ad is no longer active', 
						buttons: [{ 
							type: 'web_url',
							url: 'localhost:8080',
  							title: 'Go to website!',
			            }]
		        	}]);	
					// });
				});
			});
		});
		Session.find({'data.passport.user': userId}, function(err, session) {
			if(session) {
				io.to(session.socketId).emit('notactive', '');
				//console.log(matchesId);
			}
		});	
	}
}