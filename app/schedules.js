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
		var datetime = new Date().toISOString();
		datetime = Date.parse(datetime) - (1*60*60*1000);//1h
		datetime = new Date(datetime).toISOString();
		var datetime2 = new Date().toISOString();
		datetime2 = Date.parse(datetime2) - (1*60*60*1000+5*60*1000);//1h+5min
		datetime2 = new Date(datetime2).toISOString();
		Log.find({
			active:true, 
			start: {$lt: new Date(datetime)},
			start: {$gt: new Date(datetime2)}
		}, function(err, log) {
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