var _    = require('underscore');
var Qinfo   = require('../config/Qinfo');
var User     = require('./models/user');
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
	getNrOfQ: function(json1) {
		var json2 = {
			'game'          : json1.game,
			'platform'      : json1.platform, 
			'region'        : json1.region,
			'mode'          : {
				'name'      : json1.mode.name,
				'players'   : json1.mode.players
			} 
		};
		var i=0;
		var Qfound = false;
		do {
			if ( _.isEqual(Qinfo.queue[i], json2) ) {
				Qfound = true;
				return i;
			}
			i++
		} while( !Qfound && i<Qinfo.queue.length );
		return false;
	}

}