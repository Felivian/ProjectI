module.exports = function(app, mongoose, schedule, q, io, bot) {
	var Log            	= require('../app/models/log');
	var mf              = require('./main_functions');//
	var async    = require('async');

	/*var j = schedule.scheduleJob('* 4 * * *', function(){ //4 am
		Session.deleteMany({ 'socket_id' : {$exists:false} } , function(err, session){
			console.log('The answer to life, the universe, and everything!');
		});
	});

	var jj = schedule.scheduleJob('0 * * * *', function(){ //every full hour
		Session.deleteMany({ 'socket_id' : {$exists:false} } , function(err, session){
			console.log('The answer to life, the universe, and everything!');
		});
	});*/
	

	//setTimeout(function() {		
	setInterval(function() {
		var datetime = new Date().toISOString();
        datetime = Date.parse(datetime) - (1*60*60*1000);//1h
        datetime = new Date(datetime).toISOString();
        Log.find({active:true, updated: {$lt: new Date(datetime)}}, function(err, log) {
        	console.log(log);	
			async.each(log, function(log_i, callback) { 
				console.log(log_i.userId);	
        		mf.sendInactive(io, bot, log_i.userId);
				callback();
			}, function(err) {
				console.log('here');
        	});
        });
	}, 60000);
};