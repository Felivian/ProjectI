var Log             = require('../app/models/log');
var async           = require('async');
var wG 				= require('../app/whatGroups');
var _    			= require('underscore');

module.exports = function() {  

	Log.find({active:false, success:true}, function(err, log) {
		var i = 0;
		async.whilst(
			function() { return i < log.length; },
			function(callback) {
				Log.find({_id: {$in: log[i].match.matches}},function(err, matchedLogs) {
					var valid = true;
					var gameArr = [];
					var qdPlayersArr = [];
					var modeNameArr = [];
					var modePlayersArr = [];
					var regionArr = [];
					var platformArr = [];
					var successArr = [];
					var activeArr = [];
					var rankArr = [];
					var matchesArr = [];
					var usersArr = [];
					//var gameArr = [];
					async.eachSeries(matchedLogs, function(log_i, callback2) {
						gameArr.push(log_i.game);
						qdPlayersArr.push(log_i.qdPlayers);
						modeNameArr.push(log_i.modeName);
						modePlayersArr.push(log_i.modePlayers);
						regionArr.push(log_i.region);
						platformArr.push(log_i.platform);
						successArr.push(log_i.success);
						activeArr.push(log_i.active);
						rankArr.push(log_i.rankS);

						matchesArr.push(log_i.match.matches.length);
						usersArr.push(log_i.match.users.length);
						callback2();  
					  }, function(err) {
						i++;

						if (wG.sum_arr(qdPlayersArr) != modePlayersArr[0]) valid=false;
						if (_.uniq(gameArr).length != 1) valid = false;
						if (_.uniq(modeNameArr).length != 1) valid = false;
						if (_.uniq(modePlayersArr).length != 1) valid = false;
						if (_.uniq(regionArr).length != 1) valid = false;
						if (_.uniq(platformArr).length != 1) valid = false;
						if (_.uniq(successArr).length != 1) valid = false;
						if (_.uniq(activeArr).length != 1) valid = false;
						if (_.uniq(rankArr).length != 1) valid = false;
						if (_.uniq(matchesArr).length != 1) valid = false;
						if (_.uniq(usersArr).length != 1) valid = false;
						if (!valid) {
							console.log(valid);
						}

						callback(null,null);
					});
	
				});
				
			},function (err, n) {

				console.log('finished');
		});
	});





	// var q2 = async.queue(function(task, callback) {
	//     combine(task, callback);
	// }, 100);

	// q2.drain = function() {
	// 	console.log('end yo!');
	// }


	// Match.find( { tested: { $exists: false } }, function(err, match){
	// 	console.log(match.length);
	//     if (!match) {
	//     } else {
	//     	//console.log('here2');
	//     	for (var i = 0; i < match.length; i++) {
	//     		//console.log('here3');
	//     		q2.push({_id: match[i]._id, l_ids: match[i].matches}, function(err) {
	// 				console.log('ended processing ');
	// 			});
	//     	}
	//     }
	// });


	// function combine(task, callback) {
	// 	for (var j = 0; j < task.l_ids.length; j++) {
	// 		Log.findOne({_id: task.l_ids[j]}, function(err, log) {
	// 			//global.test_count++;
	// 			Match.updateOne({_id: task._id},
	// 				{$push: {active: log.active, success: log.success, platform: log.platform, 
	// 				region: log.region, game: log.game, name: log.modeName, players: log.modePlayers,
	// 				rankS: log.rankS, qdPlayers: log.qdPlayers}, $set: {tested: true} }, 
	// 			function(err, ulog) {
	// 				//if (global.test_count > task.l_ids.length) {
	// 					//global.test_count = 0;
	// 					//console.log('gucio');
						
	// 				//}
	// 			});
	// 		});
	// 	}
	// 	callback();
	// }
}