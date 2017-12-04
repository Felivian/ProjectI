var mf = require('./main_functions');//

module.exports = function(q, x, y, game, platform, region, mode_name, mode_players) {
	var json = {
		game          : game,
		platform      : platform, 
		region        : region,
		mode          : {
			name      : mode_name,
			players   : mode_players
		} 
	};
	var qNr = mf.getNrOfQ(json);
	if ( qNr ) {
		q[qNr].push({log_id: x, user_id: y, mode_players: mode_players, i: qNr}, function(err) {
			console.log('finished processing '+x);
		});
	}
}