var _       = require('underscore');
var Log     = require('../app/models/log');
var wG      = require('../app/whatGroups');//
//var mf      = require('../app/main_functions');//
//var Qinfo   = require('../config/Qinfo');
var push2q  = require('../app/push2q');

module.exports = function(q) {  


    for (var asd=0; asd<1000; asd++) {
    
	    var test = require('../tests/generate_random')();



	    var newLog = new Log();
	    newLog.modeName = test.modeName;
	    newLog.modePlayers = test.modePlayers;
	    newLog.qd_players = test.qd;
	    newLog.start = new Date();
	    newLog.updated = newLog.start;
	    newLog.active = true;
	    //newLog.pending = true;
	    newLog.game = test.game;
	    newLog.platform = test.platform;
	    newLog.region = test.region;
	    newLog.rank_s = test.rank_s;
	    //u_rank_arr = test.rank;
		    

	    newLog.save(function(err, log) {
	        if (err) throw err;
	        
	        //var qNr = mf.getNrOfQ(log);
	        //if (qNr) {
	            //global.wasInserted[qNr] = true;
	            push2q(q, log._id, log.user_id, log.game, log.platform, log.region, log.modeName, log.modePlayers);
	        //}
	    });
	}
}