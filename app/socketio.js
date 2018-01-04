module.exports = function(app, io, mongoose) {
	// var Session            	= require('../app/models/session');
	// var User            	= require('../app/models/user');
	// var cookieParser 		= require('cookie-parser');
	
	io.on('connection', function (socket) {
		//getting sid from cookies
		// var sid = cookieParser.JSONCookies(socket.handshake.headers.cookie);
		// sid = decodeURIComponent(sid);
		// var str = sid.split(";");
		// str.forEach(function(entry) {
		// 	if(entry.indexOf("connect.sid=") != -1) {
		// 		sid=entry;
		// 	}
		// });
		
		// sid = sid.substring(sid.lastIndexOf("connect.sid=")+12,sid.length);
		// sid = cookieParser.signedCookie(sid, 'keyboard cat');
	 //  	console.log('user connected - sid: '+sid);
		// //inserting socket_id into DB
		// Session.findOne({ 'sid': sid }, function (err, session) {
		// 	socket.join(session.data.passport.user ,function () {});
		// 	console.log('user connected '+session.data.passport.user);
		// });
	});
};		

