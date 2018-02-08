module.exports = function(app, mongoose, schedule, q, io, bot) {
	var Log 	= require('../app/models/log');
	var mf 		= require('./moreFunctions');
	var async 	= require('async');

	var j = schedule.scheduleJob('0 * * * *', function(){ //every full hour
		console.log('triggered');
		mf.sendReminder(bot);
	});


	//setTimeout(function() {		
	// setInterval(function() {
	// 	var datetime = new Date().toISOString();
	// 	datetime = Date.parse(datetime) - (1*60*60*1000);//1h
	// 	datetime = new Date(datetime).toISOString();
	// 	Log.find({active:true, start: {$lt: new Date(datetime)}}, function(err, log) {
	// 	console.log(log);	
	// 		async.each(log, function(log_i, callback) { 
	// 			console.log(log_i.userId);	
	// 			mf.sendInactive(io, bot, log_i.userId);
	// 			callback();
	// 		}, function(err) {
	// 			console.log('here');
	// 		});
	// 	});
	// }, 60000);
};