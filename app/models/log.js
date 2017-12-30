// load the things we need
var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
var ObjectId = require('mongoose').Types.ObjectId;

// define the schema for our user model
var logSchema = mongoose.Schema({
	user_id			: mongoose.Schema.Types.ObjectId,
	active			: Boolean,
	pending			: Boolean,//
	success			: Boolean,
	start			: Date,
	end				: Date,
	
	platform		: String,
	region			: String,
	game			: String,
	mode 			: {
		name 		: String,
		players 	: Number
	},
	//rank_n			: Number,
	rank_s			: String, //rank_s exists or not
	rank			: [Number],
	realMax			: Number, //
	realMin			: Number, // if rank_s exists than all four are equal 0
	maxSR			: Number, //
	minSR			: Number, //
	//roles 			: [String],

	qd_players		: Number,
	matches			: [mongoose.Schema.Types.ObjectId]
});
logSchema.index({ start: 1});


// create the model for users and expose it to our app
module.exports = mongoose.model('Log', logSchema);