// load the things we need
var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
var ObjectId = require('mongoose').Types.ObjectId;

// define the schema for our user model
var matchSchema = mongoose.Schema({
	end				: Date,
	matches			: [mongoose.Schema.Types.ObjectId]
});


// create the model for users and expose it to our app
module.exports = mongoose.model('Match', matchSchema);