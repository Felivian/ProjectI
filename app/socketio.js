module.exports = function(app, io, mongoose) {
	var Session            	= require('../app/models/session');
	var cookieParser 		= require('cookie-parser');
	
	io.on('connection', function (socket) {
		
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

		Session.update({sid: sid}, {$set :{socketId: socket.id}}, function(err, session) {

		});

		socket.on('room', function(gameName) {
			for(room in socket.rooms){
			    if(socket.id !== room) socket.leave(room);
			}
			socket.join(gameName, function(){
			});
		});

		socket.on('allGames', function(data) {
			for(room in socket.rooms){
			    if(socket.id !== room) socket.leave(room);
			}
			socket.join('allGames', function(){
			});
		});

		socket.on('leaveChannels', function(data) {
			for(room in socket.rooms){
			    if(socket.id !== room) socket.leave(room);
			}
		});

	});
};		

