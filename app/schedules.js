module.exports = function(app, session, mongoose, schedule) {
	var Session            	= require('../app/models/session');
	var j = schedule.scheduleJob('* 4 * * *', function(){ //4 am
		Session.deleteMany({ 'socket_id' : {$exists:false} } , function(err, session){
			console.log('The answer to life, the universe, and everything!');
		});
	});



	var jj = schedule.scheduleJob('0 * * * *', function(){ //every full hour
		Session.deleteMany({ 'socket_id' : {$exists:false} } , function(err, session){
			console.log('The answer to life, the universe, and everything!');
		});
	});
	
};