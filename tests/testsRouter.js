var wG = require('../app/whatGroups');
var _    = require('underscore');
var Match           = require('../app/models/match');//

module.exports = function(app, mongoose, q) {

    app.get('/test4', function(req, res) {
        require('../tests/insertQueues')(mongoose);
        res.sendStatus(200);
    });

    app.get('/test1', function(req, res) {
    	require('../tests/insertRandom')(q);
    	res.sendStatus(200);
    });

    app.get('/test2', function(req, res) {
    	require('../tests/matchValidator')();
    	res.sendStatus(200);
    });

    app.get('/test3', function(req, res) {
        //require('../tests/matchValidator')();
        Match.find( { tested: { $exists: true } }, function(err, match){
            console.log(match.length);
            if (!match) {
            } else {
                
                for (var i = 0; i < match.length; i++) {
                    var valid = true;
                    //console.log('here3');
                    if (wG.sum_arr(match[i].qdPlayers) != match[i].players[0]) {
                        valid = false;
                        console.log('sum_arr');
                        console.log(wG.sum_arr(match[i].qdPlayers));
                        console.log(match[i].players[0]);
                    }
                    if (_.uniq(match[i].players).length != 1) {
                        valid = false;
                        console.log('players');
                    }
                    if (_.uniq(match[i].name).length != 1) {
                        valid = false;
                        console.log('name');
                    }
                    if (_.uniq(match[i].game).length != 1) {
                        valid = false;
                        console.log('game');
                    }
                    if (_.uniq(match[i].region).length != 1) {
                        valid = false;
                        console.log('region');
                    }
                    if (_.uniq(match[i].platform).length != 1){
                        valid = false;
                        console.log('platform');
                    }
                    if (_.uniq(match[i].success).length != 1) {
                        valid = false;
                        console.log('success');
                    }
                    if (_.uniq(match[i].active).length != 1) {
                        valid = false;
                        console.log('active');
                    }
                    if (_.uniq(match[i].rankS).length != 1) {
                        valid = false;
                        console.log('rankS');
                    }
                    Match.updateOne({_id: match[i]._id}, {$set: {valid: valid}}, function(err, match2) {
                        if (err) throw err;
                    });
                }
            }
        });


        res.sendStatus(200);
    });
}