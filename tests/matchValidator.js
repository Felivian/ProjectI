var Log             = require('../app/models/log');//
var Match           = require('../app/models/match');//
var async           = require('async');

module.exports = function() {  

	var q2 = async.queue(function(task, callback) {
	    combine(task, callback);
	}, 1);

	q2.drain = function() {
		console.log('end yo!');
	}


	Match.find( { tested: { $exists: false } }, function(err, match){
		console.log(match.length);
	    if (!match) {
	    } else {
	    	//console.log('here2');
	    	for (var i = 0; i < match.length; i++) {
	    		//console.log('here3');
	    		q2.push({_id: match[i]._id, l_ids: match[i].matches}, function(err) {
					console.log('ended processing ');
				});
	    	}
	    }
	});


	function combine(task, callback) {
		for (var j = 0; j < task.l_ids.length; j++) {
			Log.findOne({_id: task.l_ids[j]}, function(err, log) {
				//global.test_count++;
				Match.updateOne({_id: task._id},
					{$push: {active: log.active, success: log.success, platform: log.platform, 
					region: log.region, game: log.game, name: log.mode.name, players: log.mode.players,
					rank_s: log.rank_s, qd_players: log.qd_players}, $set: {tested: true} }, 
				function(err, ulog) {
					//if (global.test_count > task.l_ids.length) {
						//global.test_count = 0;
						//console.log('gucio');
						
					//}
				});
			});
		}
		callback();
	}

















	/*Match.findOne({$ne: {tested: true}}, function(err, match){
		var count = 0;
		async.whilst(
		    function() { return count < match.length; },
		    function(callback) {
		        count++;
		        
		        var count2=0;
		        async.whilst(
				    function() { return count2 < match[count].matches[count2].length; },
				    function(callback2) {
				        count2++;
				        Log.findOne({_id: match[count].matches[count2]}, function(err, log) {
				        	Match.updateOne({_id: match[i]._id},
		    					{$push: {active: log.active, success: log.success, platform: log.platform, 
		    					region: log.region, game: log.game, name: log.mode.name, players: log.mode.players,
		    					rank: log.rank, qd_players: log.qd_players}}, 
		    				function(err, ulog) {
		    					console.log('gucio');
		    					callback(null, count2);
		    				});
				        });
				    },
				    function (err, n2) {
				        callback(null, count);
				    }
				);
		    },
		    function (err, n) {
		    	console.log('koniec');
		        // 5 seconds have passed, n = 5
		    }
		);
	});*/

	/*Match.findOne({$ne: {tested: true}}, function(err, match){
	    if (!match) {
	    	console.log('ehh?');
	    	return false;
	    } else {
	    	console.log('ayy');
	    	for (var i = 0; i < match.length; i++) {
	    		console.log('ayooo');
	    		for (var j = 0; j < match[i].matches.length; j++) {
	    			Log.findOne({_id: match[i].matches[j]}, function(err, log) {
	    				Match.updateOne({_id: match[i]._id},
	    					{$push: {active: log.active, success: log.success, platform: log.platform, 
	    					region: log.region, game: log.game, name: log.mode.name, players: log.mode.players,
	    					rank: log.rank, qd_players: log.qd_players}}, 
	    				function(err, ulog) {
	    					console.log('gucio');
	    				});
	    			});
	    		}
	    	}
		}
	});*/
}