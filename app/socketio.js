module.exports = function(app, io, mongoose) {
	var Session            	= require('../app/models/session');
	// var User            	= require('../app/models/user');
	var cookieParser 		= require('cookie-parser');
	
	io.on('connection', function (socket) {
		
		//getting sid from cookies
		var sid = cookieParser.JSONCookies(socket.handshake.headers.cookie);
		sid = decodeURIComponent(sid);
		var str = sid.split(";");
		str.forEach(function(entry) {
			if(entry.indexOf("connect.sid=") != -1) {
				sid=entry;
			}
		});
		sid = sid.substring(sid.lastIndexOf("connect.sid=")+12,sid.length);
		sid = cookieParser.signedCookie(sid, 'keyboard cat');
		/*socket.join(sid, function(){
	  		console.log('user connected - sid: '+sid);
	  	});*/

		// Session.findOne({ 'sid': sid }, function (err, session) {
		// 	socket.join(session.data.passport.user, function () {
		// 		console.log('user connected '+session.data.passport.user);
		// 	});	
		// });
		

		Session.update({sid: sid}, {$set :{socketId: socket.id}}, function(err, session) {

		});

		socket.on('room', function(gameName) {
			console.log(gameName);
			for(room in socket.rooms){
			    if(socket.id !== room) socket.leave(room);
			}
			socket.join(gameName, function(){
			  console.log('rooms', socket.rooms); // here you'll see two rooms: one with socket.id and another with data.newroom
			});
		});
	});
};		

