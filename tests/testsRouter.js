var wG = require('../app/whatGroups');
var _    = require('underscore');
var Match           = require('../app/models/match');//

module.exports = function(app, mongoose, q) {


    app.get('/test1', function(req, res) {
    	require('../tests/insertRandom')();
    	res.sendStatus(200);

/*        for (var asd=0; asd<500; asd++) {
            
            var test = require('../tests/generate_random')();

            var u_qd_players = test.qd;
            var u_mode_players = test.mode;
            var u_mode_name = 'comp_'+u_mode_players;
            var u_rank_arr = test.rank;

            var min = u_rank_arr.sort(wG.sortNumber)[0];
            var max = u_rank_arr.sort(wG.sortNumber).reverse()[0];
            var u_rank_n = Math.floor((max+min)/2);

            //data from user


            var newLog = new Log();
            newLog.start = new Date();
            newLog.active = true;

            //game specific
            newLog.game = 'overwatch';
            newLog.platform = test.platform;
            newLog.region = test.region;
            newLog.rank = test.rank;

            //change later
            if (max-min == 500) {
                newLog.minSR = min;
                newLog.maxSR = max;
            } else {
                newLog.minSR = min - (500 - Math.floor((max - min)/2));
                newLog.maxSR = max + (500 - Math.floor((max - min)/2));
            }
            newLog.mode.name = u_mode_name;
            newLog.mode.players = u_mode_players;
            newLog.rank_n = u_rank_n;
            newLog.qd_players = u_qd_players;


            newLog.save(function(err, log) {
                if (err) throw err;
                
                var qNr = mf.getNrOfQ(log);
                if (qNr) {
                    global.wasInserted[qNr] = true;
                }
            });
        }*/
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
                var valid = true;
                for (var i = 0; i < match.length; i++) {
                    //console.log('here3');
                    if (wG.sum_arr(match[i].qd_players) != match[i].players[0]) {
                        valid = false;
                        console.log('sum_arr');
                        console.log(wG.sum_arr(match[i].qd_players));
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
                    if (_.max(match[i].rank) - _.min(match[i].rank) > 500) {
                        valid = false;
                        console.log(match[i].rank);
                        console.log('max: '+_.max(match[i].rank)+' min: '+_.min(match[i].rank));
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