var User 	= require('./models/user');
var Log 	= require('./models/log');
var Game 	= require('./models/game');
var async 	= require('async');
var mf      = require('./moreFunctions');
var push2q  = require('./push2q');

module.exports = {
	abort: function(convo, text,abort) {
		if (abort) module.exports.end(convo);
		if (text == 'abort' || text == 'cancel') module.exports.end(convo);

	},
	askAdd : (convo, io) => {
		convo.ask('Please name game that for which You want to add an ad', (payload, convo) => {
			var gameName = payload.message.text;
			Game.find({ $text: {$search: gameName}}, function (err, game) {
				if (game.length == 0) module.exports.abort(convo, null,true);
				var gameArr = [];
				async.each(game, function(game_i, callback) {
					gameArr.push(game_i.name);
					callback();  
				}, function(err) {
					convo.ask({text: 'Select game.', quickReplies: gameArr}, (payload, convo) => {
						gameName = payload.message.text;
						convo.set('gameName', gameName);
						module.exports.askMode(convo, io);
					});
				});
				
			});
		});
	},
	askMode : (convo, io) => {
		
		var gameName = convo.get('gameName');
		Game.findOne({ name: gameName}, function (err, game2) {
			convo.set('platform', game2.platform);
			convo.set('region', game2.region);
			convo.set('rank', game2.rank);
			console.log(game2.rank_s);

			var modeArr = [];
			var modePlayersArr = [];
			async.each(game2.mode, function(mode_i, callback2) {
				console.log(mode_i);
				modeArr.push(mode_i.modeName[0]);
				modePlayersArr.push(mode_i.modePlayers);
				callback2();  
			}, function(err) {
				console.log(modeArr);
				convo.ask({text: 'Select mode.', quickReplies: modeArr}, (payload, convo) => {
					var mode = payload.message.text;
					convo.set('modeName', mode);
					var modePlayers = modePlayersArr[modeArr.indexOf(mode)].map(function convertAsString(val) {
						return val.toString();
					});
					convo.ask({text: 'Select number of combined group.', quickReplies: modePlayers}, (payload, convo) => {
						convo.set('modePlayers', payload.message.text);
						module.exports.askYourGroup(convo, io);

					});
				});
			});
		});
	
	},
	askYourGroup : (convo, io) => {
		var modePlayers = convo.get('modePlayers');
		var i = 1;
		var yourGroupArr = [];
		async.whilst(
			function() { return i < modePlayers; },
			function(callback3) {
				yourGroupArr.push(i);
				i++;
				callback3(null, yourGroupArr);
			},
			function (err, n) {
				var yourGroupArrStr = n.map(function convertAsString(val) {
					return val.toString();
				});
				convo.ask({text: 'Select number of players in Your group.', quickReplies: yourGroupArrStr}, (payload, convo) => {
					convo.set('yourGroup', payload.message.text);
					module.exports.askPlatform(convo, io);
				});
			}
		);
	},
	askPlatform : (convo, io) => {
		var platform = convo.get('platform');
		convo.ask({text: 'Select platform.', quickReplies: platform}, (payload, convo) => {
			convo.set('platform', payload.message.text);
			module.exports.askRegion(convo, io);
		});
		
	},
	askRegion : (convo, io) => {
		var region = convo.get('region');
		convo.ask({text: 'Select region.', quickReplies: region}, (payload, convo) => {
			if(module.exports.abort(payload.message.text)){
				module.exports.end(convo);
			} else {		
				convo.set('region', payload.message.text);
				module.exports.askRank(convo, io);
			}
		});

	},
	askRank : (convo, io) => {	
		var rank = convo.get('rank');
		convo.ask({text: 'Select rank.', quickReplies: rank}, (payload, convo) => {
			if(module.exports.abort(payload.message.text)){
				module.exports.end(convo);
			} else {	
				convo.set('rank', payload.message.text);
				module.exports.askAutomatic(convo, io);
			}
		});
	},
	askAutomatic : (convo, io) => {
		var rank = convo.get('rank');
		convo.ask({text: 'Automatic search?', quickReplies: ['Yes','No']}, (payload, convo) => {
			if(module.exports.abort(payload.message.text)){
				module.exports.end(convo);
			} else {	
				if (payload.message.text == 'Yes') {
					convo.set('automatic', true);
				} else {
					convo.set('automatic', false);
				}
				module.exports.askConfirm(convo, io);
			}
		});
	},
	askConfirm : (convo, io) => {
			var rank = convo.get('rank');
			var region = convo.get('region');
			var platform = convo.get('platform');
			var yourGroup = convo.get('yourGroup');
			var modePlayers = convo.get('modePlayers');
			var modeName = convo.get('modeName');
			var gameName = convo.get('gameName');
			var automatic = convo.get('automatic');
			convo.say('Game: '+gameName+', Mode: '+modeName+', Final group: '+modePlayers+', Your group: '+yourGroup+', platform: '+platform+', region: '+region+', automatic: '+automatic)

			.then(() =>  module.exports.askConfirm2(convo, io));
	},
	askConfirm2 : (convo, io) => {
		convo.ask({text: 'Is this what you wanted?', quickReplies: ['Yes','No']}, (payload, convo) => {
			if(module.exports.abort(payload.message.text)){
				module.exports.end(convo);
			} else {	
				if (payload.message.text == 'Yes') {
					module.exports.askSave(convo, io);
				} else {
					module.exports.end(convo);
				}
			}
		});
	},
	askSave : (convo, io) => {
		var rank = convo.get('rank');
		var region = convo.get('region');
		var platform = convo.get('platform');
		var yourGroup = convo.get('yourGroup');
		var modePlayers = convo.get('modePlayers');
		var modeName = convo.get('modeName');
		var gameName = convo.get('gameName');
		var automatic = convo.get('automatic');
		convo.getUserProfile().then((mUser) => {
			User.findOne({'messenger.id': mUser.id}, function(err, user) {
				if (user) {
					Log.findOne({userId: user._id, active:true}, function(err, otherLog) {
						if(!otherLog) { 
							var date = new Date();
							newLog = new Log;
							newLog.platform = platform;
							newLog.region = region;
							newLog.game = gameName;
							newLog.modeName = modeName;
							newLog.modePlayers = modePlayers;
							newLog.rank_s = rank;
							newLog.qd_players = yourGroup;
							newLog.userId = user._id;
							newLog.active = true;
							newLog.start = date;
							newLog.updated = date;
							if(automatic) {
								newLog.automatic=true;
							} else {
								newLog.automatic=false;
							}
							User.aggregate([
							{$match: {_id:newLog.userId}},
							{$project: {games:1, displayName:1,_id:0}},
							{$unwind: '$games'},
							{$match: {'games.name':gameName,'games.platform':platform,'games.region':region } },
							{$project: {'games.account':1, displayName:1} }
							], function(err, user2) {
								if (user2.length != 0) {
									if (user2[0].displayName != null) {
										newLog.userName = user2[0].displayName;
									} else {
										newLog.userName = user2[0].games.account;
									}
									newLog.save(function(err, log) {
										mf.changeChance(user._id, 1);
										//push to queue
										 
										if(automatic) {
											push2q(q, log._id, user._id, newLog.game, newLog.platform, newLog.region, newLog.modeName, newLog.modePlayers, false, []);
											convo.say('Ad added').then(() => module.exports.end(convo));
										} else {
											//io.to('')
											io.to(newLog.game.replace(/\s/g, '')).emit('new', newLog);
											convo.say('Ad added').then(() => module.exports.end(convo));
										}
										
									});
								} else {
									convo.say('You need to add this game to Your profile first').then(() => module.exports.end(convo));
								}
							});
						} else {
							convo.say('You can\'t add another ad.').then(() => module.exports.end(convo));
						}
					});
				} else {
					convo.say('You need to login to preform this activity.').then(() => module.exports.end(convo));
				}
			});
		});
	},
	end : (convo) => {
		convo.say('Conversation context ended.'); 
		convo.end();
		
	}
}