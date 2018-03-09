var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

var gameSchema = mongoose.Schema({
	name 			: String,
	platform 		: [String],
	region 			: [String],
	mode 			: [{
		modeName 	: String,
		modePlayers : [Number],
	}],
	rank 			: [String],
	changed 		: Boolean
});
gameSchema.index({ name: 'text' });

module.exports = mongoose.model('Game', gameSchema);