var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

var userSchema = mongoose.Schema({
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
    },
    games            : [{
        name         : String,
        account      : String,
        platform     : String,
        region       : String
    }],
    active           : {
        mon          : [{hour:Number,chance:Number}],
        tue          : [{hour:Number,chance:Number}],
        wed          : [{hour:Number,chance:Number}],
        thu          : [{hour:Number,chance:Number}],
        fri          : [{hour:Number,chance:Number}],
        sat          : [{hour:Number,chance:Number}],
        sun          : [{hour:Number,chance:Number}]
    },
    displayName      : String,
    lastActive       : Date
});

userSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

userSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.local.password);
};

module.exports = mongoose.model('User', userSchema);