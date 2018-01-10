var Queue 		= require('../app/models/queue');//
var Game       = require('../app/models/game');//
module.exports = function(mongoose) {
    Game.remove({}, function(err, res) {
        Queue.remove({}, function(err, res) {
            Game.insertMany(
            [
                {
                    name        : 'Overwatch',
                    platform    : ['pc', 'xbl', 'psn'],
                    region      : ['eu', 'na', 'asia'],
                    modeName    : ['Competitive', 'Scrim'],
                    modePlayers : [2,3,6,12],
                    rank        : ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Master', 'Grand Master']
                },
                {
                    name        : 'Splinter Cell Conviction',
                    platform    : ['pc', 'xbl'],
                    region      : ['eu', 'na', 'asia'],
                    modeName    : ['co-op', 'hunter', 'elimination'],
                    modePlayers : [2],
                    rank        : ['Easy', 'Normal', 'Hard', 'Realistic']
                }
            ], function(err, res) {
                Game.find({}, function(err, game) {
                    var count=-1;
                    for(var i=0; i < game.length; i++) {
                        for(var k=0; k < game[i].platform.length; k++) {
                            for(var l=0; l < game[i].region.length; l++) {
                                for(var m=0; m < game[i].modeName.length; m++) {
                                    for(var n=0; n < game[i].modePlayers.length; n++) {
                                        if( game[i].name!='Overwatch' ||    ((game[i].name=='Overwatch' && 
                                                                            (game[i].modeName[m]=='Competitive' &&
                                                                            game[i].modePlayers[n]!=12)) 
                                                                            || 
                                                                            (game[i].modeName[m]=='Scrim' && 
                                                                            game[i].modePlayers[n]==12)) ){
                                            count++;
                                            console.log(count);
                                            //var x=i*j*k*l*m-1;
                                            Queue.insertMany([{
                                                qNr: count, 
                                                game: game[i].name, 
                                                platform: game[i].platform[k], 
                                                region: game[i].region[l], 
                                                modeName: game[i].modeName[m],
                                                modePlayers: game[i].modePlayers[n]
                                            }], function(err, qi) {
                                            });
                                        } 
                                    }
                                }
                            }
                        }
                    }    
                });  
            }); 
        });
    });

}