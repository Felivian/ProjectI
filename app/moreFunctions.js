var User 		= require('./models/user');
var Queue 		= require('./models/queue');
var Session		= require('./models/session');
var Log 		= require('./models/log');
var async 		= require('async');
var fetch 		= require('node-fetch');
var configAuth 	= require('../config/auth');
var configExtras = require('../config/extras');

var GIPHY_URL 	= 'http://api.giphy.com/v1/gifs/random?api_key='+configAuth.giphyApiKey+'&tag=';
module.exports = {
	sendReminder: function(bot) {
		var days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
		var d = new Date();
		var dayName = days[d.getDay()];
		var hour = d.getHours();

		var datetime = new Date().toISOString();
		datetime = Date.parse(datetime) - (8*24*60*60*1000);//8days
		datetime = new Date(datetime).toISOString();
		User.find({lastActive: {$lte: new Date(datetime)}, [`active.${dayName}`]: {$elemMatch: {hour: hour, chance: {$gte: 5}  } } }, function(err, user) {
			async.each(user, function(user_i, callback) {
				user_i.lastActive = d;
				user_i.save(function(err, sUser) {
					console.log(user_i);
					bot.say(user_i.messenger.id, {
				        text: 'Long time no see. Maybe you\'ll visit me?',
						quickReplies: ['Sure', 'Maybe later', 'No way!']
					}, {
				        typing: true
					});
					callback(); 
				}); 
			}, function(err) {
			});
		});
	},

	changeChance: function(to_user, by) {
		//to_user = '5a11d3786496960a50b33e50';
		var days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
		var d = new Date();
		var dayName = days[d.getDay()];
		var hour = d.getHours();
		var month = d.getMonth();
		var year = d.getYear();

		User.findOne({_id: to_user}, function(err, user) {
			console.log(user);
			console.log(dayName);
			var lastDayName = days[user.lastActive.getDay()];
			var lastHour = user.lastActive.getHours();
			var lastMonth = user.lastActive.getMonth();
			var lastYear = user.lastActive.getYear();
			console.log([`user.active.$(dayName)`]);
			if (by > 0) {
				if (lastYear != year || lastMonth != month || lastDayName != dayName || lastHour != hour) {
				
					User.updateOne({_id: to_user },
					{ $set: {lastActive: d} }, 
					function(err, user2) {
						if (user2.nModified === 0) {
							User.updateOne({_id: to_user, [`active.${dayName}`]: {$elemMatch: {hour: hour, chance: {$lt: 10} } } },
							{ $inc: { [`active.${dayName}.$.chance`] : by }, $set: {lastActive: d} }, 
							function(err, user3) {

							});
						} else {
							User.updateOne({_id: to_user },
							{ $push: { [`active.${dayName}`] : {hour: hour, chance: 1} }, $set: {lastActive: d} }, 
							function(err, user3) {

							});
						}
					});
				


				// User.updateOne({_id: to_user, [`active.${dayName}`]: {$elemMatch: {hour: hour, chance: {$lt: 10} } } },
				// { $inc: { [`active.${dayName}.$.chance`] : by }, $set: {lastActive: d} }, 
				// function(err, user2) {
				// 	if (user2.nModified === 0) {
				// 		User.updateOne({_id: to_user },
				// 		{ $push: { [`active.${dayName}`] : {hour: hour, chance: 1} }, $set: {lastActive: d} }, 
				// 		function(err, user3) {

				// 		});
				// 	}
				// });
				}
			} else {
				User.findOne({_id: to_user, [`active.${dayName}`]: {$elemMatch: {hour: hour } } },
				function(err, user2) {
					if (user2) {
						User.updateOne({_id: to_user, [`active.${dayName}`]: {$elemMatch: {hour: hour, chance: {$gt: 1} } } },
						{ $inc: { [`active.${dayName}.$.chance`] : by } }, 
						function(err, user3) {

						});
					} 
				});
			}
		});

		// User.updateOne({_id: to_user, [`active.${dayName}`]: {$elemMatch: {hour: hour}} },
		// { $inc: { [`active.${dayName}.$.chance`] : by }}, function(err, user) {
		// 	if (user.nModified === 0) {
		// 		User.updateOne({_id: to_user },
		// 		{ $push: { [`active.${dayName}`] : {hour: hour, chance: by} }}, function(err, user) {

		// 		});
		// 	}
		// });
	},
	sendInfo: function(io, bot, matchesId) {
		User.find({_id: {$in: matchesId}}, function(err, user) {
			async.each(user, function(user_i, callback) {
				console.log(user_i.messenger.id);
				if (user_i.messenger.id) {
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
									url: configExtras.websiteURL+'/profile',
		  							title: 'See Your match!',
					            }]
				        	}]);
						});
				    });
				}
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
							url: configExtras.websiteURL,
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
	},
	sendInactive: function(io, bot, userId) {
		console.log(userId);
		User.findOne({_id: userId}, function(err, user) {
	    	bot.say(user.messenger.id, {
		        text: 'Your ad reached end of it\'s lifespan. What do You want to do?',
				quickReplies: ['Renew', 'Terminate']
			}, {
		        typing: true
			});
	    });
		
		Session.find({'data.passport.user': userId}, function(err, session) {
			if(session) {
				io.to(session.socketId).emit('inactive', '');
				//console.log(matchesId);
			}
		});	
	}
}