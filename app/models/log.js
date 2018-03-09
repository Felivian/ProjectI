var mongoose = require('mongoose');
var ObjectId = require('mongoose').Types.ObjectId;

var logSchema = mongoose.Schema({
	userId			: mongoose.Schema.Types.ObjectId,
	userName 		: String,
	active			: Boolean,
	success			: Boolean,
	start			: Date,
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

module.exports = mongoose.model('Log', logSchema);