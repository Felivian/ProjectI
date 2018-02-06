// load the things we need
var mongoose = require('mongoose');
//mongoose.Promise = require('bluebird');
var bcrypt   = require('bcrypt-nodejs');


// define the schema for our user model
var queueSchema = mongoose.Schema({
	game		: String,
	platform	: String,
	region		: String,
	modeName	: String,
	modePlayers	: Number,
	qNr			: Number
});

queueSchema.index({ game: 1});
//queueSchema.index({ qNr: 1});
// create the model for users and expose it to our app
module.exports = mongoose.model('Queue', queueSchema);