var mongoose = require('mongoose');
var ObjectId = require('mongoose').Types.ObjectId; 

var sessionSchema = mongoose.Schema({
	sid				: String,
	data			: {
		passport	: {
			user	: String
		}
	},
    socketId		: String
});

module.exports = mongoose.model('Session', sessionSchema);