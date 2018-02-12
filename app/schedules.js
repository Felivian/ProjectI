module.exports = function(app, mongoose, schedule, q, io, bot) {
	var Log 	= require('../app/models/log');
	var mf 		= require('./moreFunctions');
	var async 	= require('async');

	var j = schedule.scheduleJob('0 * * * *', function(){ //every full hour
		console.log('triggered');
		mf.sendReminder(bot);
	});


	//setTimeout(function() {		
	setInterval(function() {
		var datetimeFrom = new Date().toISOString();
		datetimeFrom = Date.parse(datetimeFrom) - (1*60*60*1000);//1h
		datetimeFrom = new Date(datetimeFrom).toISOString();
		var datetimeTo = new Date().toISOString();
		datetimeTo = Date.parse(datetimeTo) - (1*60*60*1000+5*60*1000);//1h+5min
		datetimeTo = new Date(datetimeTo).toISOString();
		console.log(datetimeFrom);
		console.log(datetimeTo);
		console.log(datetimeFrom > datetimeTo);
		Log.find({$and: [
			{active:true}, 
			{start: {$lt: new Date(datetimeFrom)}},
			{start: {$gt: new Date(datetimeTo)}}
		]}, function(err, log) {
		console.log(log);	
			async.each(log, function(log_i, callback) { 
				console.log(log_i.userId);	
				log_i.active = false;
				log_i.success = false;
				log_i.end = new Date();
				log_i.save(function(err,sLog) {
					mf.sendInactive(io, bot, log_i.userId);
					callback();
				});
			}, function(err) {
				console.log('here');
			});
		});
	}, 60000);
};