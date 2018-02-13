var _       = require('underscore');
var Log     = require('../app/models/log');
var wG      = require('../app/whatGroups');//
var push2q  = require('../app/push2q');
var Queue  	= require('../app/models/queue');
var Game  	= require('../app/models/game');
var async	= require('async');

module.exports = function(q) {  
	var i = 0;
	async.whilst(
		function() { return i < 1000; },
		function(callback) {
			i++;
			var rand = Math.floor((Math.random() * (q.length-1)));
			Queue.findOne({qNr: rand}, function(err, queue) {
				Game.findOne({name: queue.game}, function(err, game){
					var newLog = new Log();
					newLog.modeName = queue.modeName;
					newLog.modePlayers = queue.modePlayers;
					newLog.qdPlayers = Math.floor(Math.random() * (queue.modePlayers-1)+1);
					newLog.start = new Date();
					newLog.active = true;
					newLog.game = queue.game;
					newLog.platform = queue.platform;
					newLog.region = queue.region;
					newLog.rankS = game.rank[Math.floor(Math.random() * (game.rank.length))];
					newLog.automatic = true;
					newLog.userId = '5a3fbdc366484b2058751dad';
					newLog.userName = 'Felivian';
					newLog.save(function(err, log) {
						if (err) callback(err, null);
						push2q(q, log._id, log.userId, log.game, log.platform, log.region, log.modeName, log.modePlayers, false, []);
						callback(null, null);
					});
				});
			});
		},function (err, n) {
			console.log('finished');
	});
}