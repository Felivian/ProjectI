var Queue 		= require('../app/models/queue');
var Game       = require('../app/models/game');
module.exports = function(mongoose) {
    // Game.remove({}, function(err, res) { //
        Queue.remove({}, function(err, res) {
            // Game.insertMany( //
            // [
            //     {
            //         name        : 'Overwatch',
            //         platform    : ['pc', 'xbl', 'psn'],
            //         region      : ['eu', 'na', 'asia'],
            //         mode        : [
            //             {
            //             modeName    : 'Competitive',
            //             modePlayers : [2,3,6]
            //             },
            //             {
            //             modeName    : 'Scrim',
            //             modePlayers : [12]
            //             }
            //         ],
            //         rank        : ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Master', 'Grand Master']
            //     },
            //     {
            //         name        : 'Splinter Cell Conviction',
            //         platform    : ['pc', 'xbl'],
            //         region      : ['eu', 'na', 'asia'],
            //         mode        : [
            //             {
            //             modeName    : 'CO-OP',
            //             modePlayers : [2]
            //             },
            //             {
            //             modeName    : 'Hunter',
            //             modePlayers : [2]
            //             },
            //             {
            //             modeName    : 'Elimination',
            //             modePlayers : [2]
            //             }
            //         ],
            //         rank        : ['Easy', 'Normal', 'Hard', 'Realistic']
            //     }
            // ], function(err, res) { //
                Game.find({}, function(err, game) {
                    var count=-1;
                    for(var i=0; i < game.length; i++) {
                        for(var k=0; k < game[i].platform.length; k++) {
                            for(var l=0; l < game[i].region.length; l++) {
                                for(var m=0; m < game[i].mode.length; m++) {
                                    for(var n=0; n < game[i].mode[m].modePlayers.length; n++) {
                                        count++;
                                        console.log(count);
                                        Queue.insertMany([{
                                            qNr: count, 
                                            game: game[i].name, 
                                            platform: game[i].platform[k], 
                                            region: game[i].region[l], 
                                            modeName: game[i].mode[m].modeName,
                                            modePlayers: game[i].mode[m].modePlayers[n]
                                        }], function(err, qi) {
                                        });
                                    }
                                }
                            }
                        }
                    }    
                });  
            // }); //
        });
    // }); //

}