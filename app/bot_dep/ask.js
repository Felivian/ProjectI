var sh 		= require("shorthash");
var User 	= require('../models/user');
var Log 	= require('../models/log');
var Game 	= require('../models/game');
var async 		= require('async');
var mf              = require('../main_functions');
var push2q  = require('../push2q');

module.exports = /*function(bot, mongoose, q) */{
	// askAdd : (convo) => {
	// 	convo.ask('Please name game that for which You want to add an ad', (payload, convo) => {
	// 	//convo.say('Please name game that for which You want to add an ad', { typing: true })			
	// 		var gameName = payload.message.text;

	// 		Game.find({ $text: {$search: gameName}}, function (err, game) {
	// 			var gameArr = ['asd','asdqwe','qwewqe','qwexsacv'];
	// 			async.each(game, function(game_i, callback) {
 //           			gameArr.push(game_i.name);
 //                	callback();  
 //                }, function(err) {
 //    				convo.ask({text: 'Select game.', quickReplies: gameArr}, (payload, convo) => {
 //    					gameName = payload.message.text;
 //    					Game.findOne({ name: gameName}, function (err, game2) {
 //    						console.log(game2);
 //    						var modeArr = [];
 //    						var modePlayersArr = [];
 //    						async.each(game2.mode, function(mode_i, callback2) {
 //    							console.log(mode_i);
	// 		           			modeArr.push(mode_i.modeName[0]);
	// 		           			modePlayersArr.push(mode_i.modePlayers);
	// 		                	callback2();  
	// 		                }, function(err) {
	// 		                	console.log(modeArr);
	// 		                	convo.ask({text: 'Select mode.', quickReplies: modeArr}, (payload, convo) => {
	// 		                		var mode = payload.message.text;
	// 		                		var modePlayers = modePlayersArr[modeArr.indexOf(mode)].map(function convertAsString(val) {
	// 									return val.toString();
	// 								});
	// 		                		console.log(modePlayers);
	// 		                		convo.ask({text: 'Select number of players.', quickReplies: modePlayers}, (payload, convo) => {
	// 		                			var chosenPlayers = payload.message.text;
	// 		                			var i = 0;
	// 		                			var yourGroupArr = [];
	// 		                			async.whilst(
	// 						                function() { return i < chosenPlayers; },
	// 						                function(callback3) {
	// 						                	yourGroupArr.push(i);
	// 						                	i++;
	// 						                	callback3(null, null);
	// 						                },
	// 						                function (err, n) {
	// 						                	convo.ask({text: 'Select number of players.', quickReplies: yourGroupArr}, (payload, convo) => {
	// 						                		console.log(payload.messenge.text);
	// 						                		convo.end();
	// 						                	});
	// 						                }
	// 						            );
			                			
	// 		                		});
	// 		                	});
	//     					});
 //    					//convo.end();
 //    					});
	// 				});
 //                });
				
	// 		});
	// 	});
	// },
	askAdd : (convo, io) => {
		convo.ask('Please name game that for which You want to add an ad', (payload, convo) => {
			if(payload.message.text == 'abort' || payload.message.text == 'cancel'){
				module.exports.end(convo);
			} else {		
				var gameName = payload.message.text;

				Game.find({ $text: {$search: gameName}}, function (err, game) {
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
			}
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
					//convo.set('modePlayersArr', modePlayers);
					convo.ask({text: 'Select number of combined group.', quickReplies: modePlayers}, (payload, convo) => {
						convo.set('modePlayers', payload.message.text);
						module.exports.askYourGroup(convo, io);
					});
            	});
			});
		//convo.end();
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
				console.log(yourGroupArrStr)
            	convo.ask({text: 'Select number of players in Your group.', quickReplies: yourGroupArrStr}, (payload, convo) => {
            		console.log(payload.message.text);
            		convo.set('yourGroup', payload.message.text);
            		module.exports.askPlatform(convo, io);
            	});
            }
        );
	},
	askPlatform : (convo, io) => {
		var platform = convo.get('platform');
    	convo.ask({text: 'Select platform.', quickReplies: platform}, (payload, convo) => {
    		console.log(payload.message.text);
    		convo.set('platform', payload.message.text);
    		module.exports.askRegion(convo, io);
    	});
	},
	askRegion : (convo, io) => {
		var region = convo.get('region');
    	convo.ask({text: 'Select region.', quickReplies: region}, (payload, convo) => {
    		console.log(payload.message.text);
    		convo.set('region', payload.message.text);
    		module.exports.askRank(convo, io);
    	});
	},
	askRank : (convo, io) => {
		var rank = convo.get('rank');
    	convo.ask({text: 'Select rank.', quickReplies: rank}, (payload, convo) => {
    		console.log(payload.message.text);
    		convo.set('rank', payload.message.text);
    		module.exports.askAutomatic(convo, io);
    	});
	},
	askAutomatic : (convo, io) => {
		var rank = convo.get('rank');
    	convo.ask({text: 'Automatic search?', quickReplies: ['Yes','No']}, (payload, convo) => {
    		console.log(payload.message.text);
    		if (payload.message.text == "Yes") {
    			convo.set('automatic', true);
    		} else {
    			convo.set('automatic', false);
    		}
    		module.exports.askConfirm(convo, io);
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
	    		//console.log(payload.message.text);
    		if (payload.message.text == "Yes") {
    			module.exports.askSave(convo, io);
    		} else {
    			module.exports.end(convo);
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
		console.log(rank);
		console.log(region);
		console.log(platform);
		console.log(yourGroup);
		console.log(modePlayers);
		console.log(modeName);
		console.log(gameName);

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
		                    //newLog.userName =
		                    newLog.active = true;
		                    newLog.start = date;
		                    newLog.updated = date;
		                    if(automatic) {
		                        newLog.automatic=true;
		                    } else {
		                        newLog.automatic=false;
		                    }
		                    //User.findOne({_id: req.session.passport.user}, function(err, user) {
		                        //newLog.userName = user.displayName;
		                    User.aggregate([
		                    {$match: {_id:newLog.userId}},
		                    {$project: {games:1, displayName:1,_id:0}},
		                    {$unwind: '$games'},
		                    {$match: {'games.name':gameName,'games.platform':platform,'games.region':region } },
		                    // {$match: {'games.name':req.body.data.game } },
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
	    	// convo.ask({text: 'Select rank.', quickReplies: rank}, (payload, convo) => {
	    	// 	console.log(payload.messenge.text);
	    	// 	convo.set('rank', payload.messenge.text);
	    	// 	module.exports.askSave(convo);
	    	});
		});
	},
	end : (convo) => {
		convo.end();
	},
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
					User.findOneAndUpdate({'messenger.id': m_user.id}, {$set:{'overwatch.battletag': convo.get('battletag')[0]}}, function (err, user) {
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
					User.findOneAndUpdate({'messenger.id': m_user.id}, {$set:{'overwatch.SR': convo.get('battletag')[0]}}, function (err, user) {
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