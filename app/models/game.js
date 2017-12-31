// load the things we need
var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
var bcrypt   = require('bcrypt-nodejs');


// define the schema for our user model
var gameSchema = mongoose.Schema({
    name        : String,
    platform    : [String],
    region      : [String],
    modeName    : [String],
    modePlayers : [Number],
    rank		: [String]
});

//gameSchema.index({ qNr: 1});
// create the model for users and expose it to our app
module.exports = mongoose.model('Game', gameSchema);