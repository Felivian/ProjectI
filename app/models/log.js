// load the things we need
var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
var ObjectId = require('mongoose').Types.ObjectId;

// define the schema for our user model
var logSchema = mongoose.Schema({
	user_id			: mongoose.Schema.Types.ObjectId,
	active			: Boolean,
	success			: Boolean,
	start			: Date,
	end				: Date,
	
	platform		: String,
	region			: String,
	game			: String,
	mode 			: {
		name		: String,
		players		: Number
	},
	rank_s			: String,
	rank_n			: Number,

	matches			: [mongoose.Schema.Types.ObjectId],
	fillters		: [String]
});
logSchema.index({ start: 1});


// create the model for users and expose it to our app
module.exports = mongoose.model('Log', logSchema);