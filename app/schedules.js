module.exports = function(app, mongoose, schedule, q, io, bot) {
	var Log 	= require('../app/models/log');
	var mf 		= require('./moreFunctions');
	var async 	= require('async');

	var j = schedule.scheduleJob('0 * * * *', function(){
		mf.sendReminder(bot);
	});

	
	setInterval(function() {
		var datetimeFrom = new Date().toISOString();
		datetimeFrom = Date.parse(datetimeFrom) - (1*60*60*1000);
		datetimeFrom = new Date(datetimeFrom).toISOString();
		var datetimeTo = new Date().toISOString();
		datetimeTo = Date.parse(datetimeTo) - (1*60*60*1000+2*60*1000);
		datetimeTo = new Date(datetimeTo).toISOString();
		Log.find({$and: [
			{active:true}, 
			{start: {$lt: new Date(datetimeFrom)}},
			{start: {$gt: new Date(datetimeTo)}}
		]}, function(err, log) {	
			async.each(log, function(log_i, callback) { 
				log_i.active = false;
				log_i.success = false;
				log_i.end = new Date();
				log_i.save(function(err,sLog) {
					mf.sendInactive(io, bot, log_i.userId);
					callback();
				});
			}, function(err) {

			});
		});
	}, 60000);
};