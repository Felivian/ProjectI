// load the things we need
var mongoose = require('mongoose');
//mongoose.Promise = require('bluebird');
var ObjectId = require('mongoose').Types.ObjectId;

// define the schema for our user model
var logSchema = mongoose.Schema({
	userId			: mongoose.Schema.Types.ObjectId,
	userName 		: String,
	active			: Boolean,
	success			: Boolean,
	start			: Date,
	//updated			: Date,
	end				: Date,
	
	platform		: String,
	region			: String,
	game			: String,
	modeName 		: String,
	modePlayers 	: Number,
	rankS			: String,


	qdPlayers		: Number,
	automatic 		: Boolean,
	match 			: {
		matches 	: [mongoose.Schema.Types.ObjectId],
		users 		: [mongoose.Schema.Types.ObjectId]
	}
});
logSchema.index({ start: 1});
//logSchema.index({ updated: 1});


// create the model for users and expose it to our app
module.exports = mongoose.model('Log', logSchema);