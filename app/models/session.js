// load the things we need
var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
//var bcrypt   = require('bcrypt-nodejs');
var ObjectId = require('mongoose').Types.ObjectId; 

// define the schema for our session model
var sessionSchema = mongoose.Schema({
	
	sid				: String,
	data			: {
		passport	: {
			user	: String
		}
	},
    socket_id		: String
});

// methods ======================

// create the model for users and expose it to our app
module.exports = mongoose.model('Session', sessionSchema);