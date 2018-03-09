var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

var queueSchema = mongoose.Schema({
	game		: String,
	platform	: String,
	region		: String,
	modeName	: String,
	modePlayers	: Number,
	qNr			: Number
});

queueSchema.index({ game: 1});

module.exports = mongoose.model('Queue', queueSchema);