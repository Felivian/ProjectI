// load the things we need
var mongoose = require('mongoose');
//mongoose.Promise = require('bluebird');
var bcrypt   = require('bcrypt-nodejs');


// define the schema for our user model
var gameSchema = mongoose.Schema({
    name        : String,
    platform    : [String],
    region      : [String],
    mode : [{
    	modeName    : [String],
    	modePlayers : [Number],
    }],
    rank		: [String]
});
gameSchema.index({ name: 'text' });

// create the model for users and expose it to our app
module.exports = mongoose.model('Game', gameSchema);