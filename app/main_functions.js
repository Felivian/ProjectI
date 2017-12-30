//var _    = require('underscore');
var User     = require('./models/user');
var Queue     = require('./models/queue');
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
	}
}