var _       = require('underscore');
var Log     = require('../app/models/log');
var wG      = require('../app/whatGroups');//
var mf      = require('../app/main_functions');//
var Qinfo   = require('../config/Qinfo');

module.exports = function() {  
    for (var asd=0; asd<1000; asd++) {
    
	    var test = require('../tests/generate_random')();

	    var u_qd_players = test.qd;
	    var u_mode_players = test.mode;
	    var u_mode_name = 'comp_'+u_mode_players;
	    var u_rank_arr = test.rank;

	    var min = u_rank_arr.sort(wG.sortNumber)[0];
	    var max = u_rank_arr.sort(wG.sortNumber).reverse()[0];
	    //var u_rank_n = Math.floor((max+min)/2);

	    //data from user


	    var newLog = new Log();
	    newLog.start = new Date();
	    newLog.active = true;
	    newLog.pending = true;

	    //game specific
	   	newLog.realMax = max;
	    newLog.realMin = min;
	    newLog.game = 'overwatch';
	    newLog.platform = test.platform;
	    newLog.region = test.region;
	    newLog.rank = test.rank;

	    //change later
	    if (max-min == 500) {
	        newLog.minSR = min;
	        newLog.maxSR = max;
	    } else if (max-min == 0) {
	    	newLog.minSR = min-250;
	        newLog.maxSR = max+250;
	    } else {
	        newLog.minSR = min - Math.floor((500 - (max - min))/2);
	        newLog.maxSR = max + Math.floor((500 - (max - min))/2);
	    }
	    newLog.mode.name = u_mode_name;
	    newLog.mode.players = u_mode_players;
	    //newLog.rank_n = u_rank_n;
	    newLog.qd_players = u_qd_players;


	    newLog.save(function(err, log) {
	        if (err) throw err;
	        
	        var qNr = mf.getNrOfQ(log);
	        if (qNr) {
	            global.wasInserted[qNr] = true;
	        }
	    });
	}
}