module.exports = function(app, io, mongoose) {
	var Session            	= require('../app/models/session');
	var User            	= require('../app/models/user');
	var Conversation       	= require('../app/models/conversation');
	var Message       		= require('../app/models/message');
	var FriendReq      		= require('../app/models/friendReq');
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
	  	console.log('user connected - sid: '+sid);
		//inserting socket_id into DB
		Session.findOne({ 'sid': sid }, function (err, session) {
			//if (err) return handleError(err);
			//cone on success
			socket.join(session.data.passport.user ,function () {});
			console.log('user connected '+session.data.passport.user);
			//sending status to friends
			status_update(session.data.passport.user, 'online',socket);
		});

		

		// =====================================
		// ON DISCONNECT =======================
		// =====================================
		socket.on('disconnect', function() {
			Session.findOne({ 'sid': sid }, function (err, session) {
				console.log('user disconnected: '+session.data.passport.user);
				
				//sending status to friends
				console.log(numClientsInRoom('/', session.data.passport.user));
				if( numClientsInRoom('/', session.data.passport.user) < 1 )  {
					status_update(session.data.passport.user, 'offline', socket);
				}
			});
		});
		
		
		// =====================================
		// ON MESSAGE SENT =====================
		// =====================================
		//message client to server
		/*socket.on('message-c2s', function(data) {
			//from
			Session.findOne({ 'sid': sid }, function (err, session) {
				if (err) throw err;
				//if (! session) throw err; --it wont happend

				//Message.sent=new Date().toISOString().
				//			replace(/T/, ' ').      // replace T with a space
				//			replace(/\..+/, '');     // delete the dot and everything after
				
				
				var from = session.data.passport.user;
				var sent = new Date();
				var body = data.body;
				var read = [{by: from, time: sent}];

				//pushing message to DB
				Conversation.findOneAndUpdate( {'_id': data.conversation },
				{$push: { 'messages' : {'from': from,'sent': sent,'body': body, 'read': read} }},{upsert:true}, function(err, conversation) { 
					if (err) throw err;
					var position = conversation.messages.length;
					console.log(position);
					//retrieving id of message - optional probably
					Conversation.findOne({'_id': data.conversation}, {'messages': { $slice: [position,1] } }, function(err, conversation2) { 
						console.log(conversation2.messages[0]._id);
						for (var i=0; i<conversation.participants.length; i++) {
							Session.find({ 'data.passport.user': conversation.participants[i] }, function (err, session2) {
								for (var j=0;j<session2.length;j++) {
									//console.log(session2[j]);
									if (session2[j].socket_id == null){
										//console.log('jest null');
									} else {
										socket.to(session2[j].socket_id).emit('message-s2c', {'id':conversation2.messages[0]._id, 'from': from,'sent': sent,'body': body, 'read': read}); //message - server to client
										//console.log('NIE jest null');
									}
								}
							});
						}
					});
				});
			});
		});*/
		

		// =====================================
		// ON MESSAGE READ =====================
		// =====================================
		/*socket.on('message-read', function(data) {
			console.log(data);
			var time = new Date();
			if (data) {
				//Conversation.update( {'_id': data.conversation, 'messages.sent': data.sent},
				Conversation.update( {'_id': data.conversation, 'messages._id': data.message_id},
				 {$push: {'messages.$.read': {by: data.user_id, time: time }}}
				, function(err) { 
					console.log('as');
				});
				//finding participants of conversation
				Conversation.findOne( {'_id': data.conversation}, function(err, conversation) {
					for(var i=0; i<conversation.participants.length; i++) {
						//finding socket_id of every participant except sending one
						if(conversation.participants[i] != data.user_id) {
							Session.find( {'data.passport.user': conversation.participants[i]}, function(err, session) {
								for (var j=0;j<session.length;j++) {
									if (session[j].socket_id == null){
									} else {
										socket.to(session[j].socket_id).emit('message-update', {id: data.message_id, read: {by: data.user_id, time: time }});
									}
								}
							});
						}
					}
				});

			}

		});*/
		

		// =====================================
		// ON FRIEND REQUEST ACK ===============
		// =====================================
		socket.on('newFriendReq', function(data) {
			socket.to(data.to).emit('gotNewFriendReq',data);
		});

		// =====================================
		// ON GET CONVERSATIONS ================
		// =====================================
		/*socket.on('getConversations1', function(data) {
			//finging sender id
			Session.findOne( {'sid':sid}, function(err, session) {
				User.findOne( {'_id':session.data.passport.user}, function(err, user) {
					for(var i=0; i<user.conversations.length; i++) {
						Conversation.findOne({'_id':user.conversations[i]}, {'messages': {$slice: -20}} , function(err, conversation) {
							socket.emit('getConversations2', conversation);
						});
					}
				});
			});
		});*/

		// =====================================
		// ON GET MORE MESSAGES ================
		// =====================================
		/*socket.on('getMoreMessages1', function(data) {
			//finging sender id
			Session.findOne( {'sid':sid}, function(err, session) {
				var skip=-20-data.qt;
				Conversation.findOne({'_id':data.id}, {'messages': {$slice: [skip,20]}} , function(err, conversation) {
					socket.emit('getMoreMessages2', conversation);
				});
			});
		});*/

	});




	function status_update(user_id, status, socket) {
		User.findOne({'_id': user_id}, function(err, user) {
			for (var i=0; i<user.friends.length;i++) {
				socket.to(user.friends[i]).emit('status', {'id':user_id, 'status':status});
			}
		});
	}

	function numClientsInRoom(namespace, room) {
	try {
    	var clients = io.nsps[namespace].adapter.rooms[room].sockets;
    	return Object.keys(clients).length;
    }
    catch(err) {
    	return 0;
    }
}

};		

