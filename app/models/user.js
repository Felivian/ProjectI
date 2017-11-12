// load the things we need
var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
var bcrypt   = require('bcrypt-nodejs');


// define the schema for our user model
var userSchema = mongoose.Schema({
    //_id              : mongoose.Schema.Types.ObjectId,
    local            : {
        email        : String,
        password     : String,
    },
    facebook         : {
        id           : String,
        token        : String,
        email        : String,
        name         : String
    },
    messenger        : {
        id           : String,
        first_name   : String,
        last_name    : String,
        profile_pic  : String
    },
    overwatch        : {
        battletag    : String,
        SR           : Number,
        platform     : String,
        region       : String,
        heroes       : [String]
    },
	
    active           : {
        mon          : [{hour:Number,chance:Number}],
        tue          : [{hour:Number,chance:Number}],
        wed          : [{hour:Number,chance:Number}],
        thu          : [{hour:Number,chance:Number}],
        fri          : [{hour:Number,chance:Number}],
        sat          : [{hour:Number,chance:Number}],
        sun          : [{hour:Number,chance:Number}]
    }
	//friends          : [mongoose.Schema.Types.ObjectId],
	//conversations    : [mongoose.Schema.Types.ObjectId]
	//friends          : String
});

// methods ======================
// generating a hash
userSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
userSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.local.password);
};

// create the model for users and expose it to our app
module.exports = mongoose.model('User', userSchema);