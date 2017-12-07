

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
}