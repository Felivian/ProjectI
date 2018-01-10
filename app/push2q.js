var Queue           = require('./models/queue');//
//atf - after the failure
module.exports = function(q, x, y, game, platform, region, modeName, modePlayers, atf) {
	var json = {
		game          : game,
		platform      : platform, 
		region        : region,
		modeName      : modeName,
		modePlayers   : modePlayers
	};
	Queue.findOne({game: json.game, platform: json.platform, region: json.region, modeName: json.modeName, modePlayers: json.modePlayers},
	function(err, queue) {
		if (queue) {
			console.log(queue.qNr)
			q[queue.qNr].push({log_id: x, userId: y, modePlayers: modePlayers, i: queue.qNr, atf: atf}, function(err) {
				console.log('finished processing '+x);
			});
		}
	});
}