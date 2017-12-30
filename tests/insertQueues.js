var Queue 		= require('../app/models/queue');//
module.exports = function(mongoose) {
	Queue.insertMany(		[{
            'qNr'			: 0,
			'game'          : 'overwatch',
            'platform'      : 'pc', 
            'region'        : 'eu',
            
            'modeName'      : 'comp',
            'modePlayers'   : 2
        },
        {
            'qNr'			: 1,
			'game'          : 'overwatch',
            'platform'      : 'pc', 
            'region'        : 'eu',
            
            'modeName'      : 'comp',
            'modePlayers'   : 3
        },
        {
            'qNr'			: 2,
			'game'      	: 'overwatch',
            'platform'  	: 'pc', 
            'region'    	: 'eu',
            
            'modeName'      : 'comp',
            'modePlayers'   : 6
        },
        {
            'qNr'			: 3,
			'game'      	: 'overwatch',
            'platform'  	: 'pc', 
            'region'    	: 'na',
            
            'modeName'      : 'comp',
            'modePlayers'   : 2
        },
        {
            'qNr'			: 4,
			'game'      	: 'overwatch',
            'platform'  	: 'pc', 
            'region'    	: 'na',
            
            'modeName'      : 'comp',
            'modePlayers'   : 3
        },
        {
            'qNr'			: 5,
			'game'      	: 'overwatch',
            'platform'  	: 'pc', 
            'region'    	: 'na',
            
            'modeName'      : 'comp',
            'modePlayers'   : 6
        },
        {
            'qNr'			: 6,
			'game'      	: 'overwatch',
            'platform'  	: 'pc', 
            'region'    	: 'asia',
            
            'modeName'      : 'comp',
            'modePlayers'   : 2
        },
        {
            'qNr'			: 7,
			'game'      	: 'overwatch',
            'platform'  	: 'pc', 
            'region'    	: 'asia',
            
            'modeName'      : 'comp',
            'modePlayers'   : 3
        },
        {
			'qNr'			: 8,
            'game'      	: 'overwatch',
            'platform'  	: 'pc', 
            'region'    	: 'asia',
            
            'modeName'      : 'comp',
            'modePlayers'   : 6
        },
        {
			'qNr'			: 9,
            'game'      	: 'overwatch',
            'platform'  	: 'psn', 
            'region'    	: 'eu',
            
            'modeName'      : 'comp',
            'modePlayers'   : 2
        },
        {
			'qNr'			: 10,
            'game'      	: 'overwatch',
            'platform'  	: 'psn', 
            'region'    	: 'eu',
            
            'modeName'      : 'comp',
            'modePlayers'   : 3
        },
        {
			'qNr'			: 11,
            'game'      	: 'overwatch',
            'platform'  	: 'psn', 
            'region'    	: 'eu', 
            'modeName'      : 'comp',
            'modePlayers'   : 6
        },
        {
			'qNr'			: 12,
            'game'      	: 'overwatch',
            'platform'  	: 'psn', 
            'region'    	: 'na',
            'modeName'      : 'comp',
            'modePlayers'   : 2
        },
        {
			'qNr'			: 13,
            'game'      	: 'overwatch',
            'platform'  	: 'psn', 
            'region'    	: 'na',
            'modeName'      : 'comp',
            'modePlayers'   : 3
        },
        {
			'qNr'			: 14,
            'game'      	: 'overwatch',
            'platform'  	: 'psn', 
            'region'    	: 'na',
            'modeName'      : 'comp',
            'modePlayers'   : 6
        },
        {
			'qNr'			: 15,
            'game'      	: 'overwatch',
            'platform'  	: 'psn', 
            'region'    	: 'asia',
            'modeName'      : 'comp',
            'modePlayers'   : 2
        },
        {
			'qNr'			: 16,
            'game'      	: 'overwatch',
            'platform'  	: 'psn', 
            'region'    	: 'asia',
            'modeName'      : 'comp',
            'modePlayers'   : 3
        },
        {
			'qNr'			: 17,
            'game'      	: 'overwatch',
            'platform'  	: 'psn', 
            'region'    	: 'asia',
            'modeName'      : 'comp',
            'modePlayers'   : 6
        },
        {
			'qNr'			: 18,
            'game'      	: 'overwatch',
            'platform'  	: 'xbl', 
            'region'    	: 'eu',
            'modeName'      : 'comp',
            'modePlayers'   : 2
        },
        {
			'qNr'			: 19,
            'game'      	: 'overwatch',
            'platform'  	: 'xbl', 
            'region'    	: 'eu',
            'modeName'      : 'comp',
            'modePlayers'   : 3
        },
        {
			'qNr'			: 20,
            'game'      	: 'overwatch',
            'platform'  	: 'xbl', 
            'region'    	: 'eu',
            'modeName'      : 'comp',
            'modePlayers'   : 6
        },
        {
			'qNr'			: 21,
            'game'      	: 'overwatch',
            'platform'  	: 'xbl', 
            'region'    	: 'na',
            
            'modeName'      : 'comp',
            'modePlayers'   : 2
        },
        {
			'qNr'			: 22,
            'game'      	: 'overwatch',
            'platform'  	: 'xbl', 
            'region'    	: 'na',
            
            'modeName'      : 'comp',
            'modePlayers'   : 3

        },
        {
			'qNr'			: 23,
            'game'      	: 'overwatch',
            'platform'  	: 'xbl', 
            'region'    	: 'na',
            
            'modeName'      : 'comp',
            'modePlayers'   : 6
            
        },
        {
			'qNr'			: 24,
            'game'      	: 'overwatch',
            'platform'  	: 'xbl', 
            'region'    	: 'asia',
            
            'modeName'      : 'comp',
            'modePlayers'   : 2
            
        },
        {
			'qNr'			: 25,
            'game'      	: 'overwatch',
            'platform'  	: 'xbl', 
            'region'    	: 'asia',
            
            'modeName'      : 'comp',
            'modePlayers'   : 3
        },
        {
			'qNr'			: 26,
            'game'      	: 'overwatch',
            'platform'  	: 'xbl', 
            'region'    	: 'asia',
            
            'modeName'      : 'comp',
            'modePlayers'   : 6
            
        },
        {
			'qNr'			: 27,
            'game'          : 'overwatch',
            'platform'      : 'pc', 
            'region'        : 'eu',
            
            'modeName'      : 'scrim',
            'modePlayers'   : 12
            
        },
        {
			'qNr'			: 28,
            'game'          : 'overwatch',
            'platform'      : 'pc', 
            'region'        : 'na',
            
            'modeName'      : 'scrim',
            'modePlayers'   : 12
            
        },
        {	
			'qNr'			: 29,
            'game'          : 'overwatch',
            'platform'      : 'pc', 
            'region'        : 'asia',
            
            'modeName'      : 'scrim',
            'modePlayers'   : 12
            
        },
        {
			'qNr'			: 30,
            'game'          : 'overwatch',
            'platform'      : 'xbl', 
            'region'        : 'eu',
            
            'modeName'      : 'scrim',
            'modePlayers'   : 12
            
        },
        {
			'qNr'			: 31,
            'game'          : 'overwatch',
            'platform'      : 'xbl', 
            'region'        : 'na',
            
            'modeName'      : 'scrim',
            'modePlayers'   : 12
            
        },
        {
			'qNr'			: 32,
            'game'          : 'overwatch',
            'platform'      : 'xbl', 
            'region'        : 'asia',
            
            'modeName'      : 'scrim',
            'modePlayers'   : 12
            
        },
        {
			'qNr'			: 33,
            'game'          : 'overwatch',
            'platform'      : 'psn', 
            'region'        : 'eu',
            
            'modeName'      : 'scrim',
            'modePlayers'   : 12
            
        },
        {
			'qNr'			: 34,
            'game'          : 'overwatch',
            'platform'      : 'psn', 
            'region'        : 'na',
            
            'modeName'      : 'scrim',
            'modePlayers'   : 12
            
        },
        {
			'qNr'			: 35,
            'game'          : 'overwatch',
            'platform'      : 'psn', 
            'region'        : 'asia',
            
            'modeName'      : 'scrim',
            'modePlayers'   : 12
            
        },
        {
			'qNr'			: 36,
            'game'          : 'splinter cell conviction',
            'platform'      : 'pc', 
            'region'        : 'eu',
            
            'modeName'      : 'co-op',
            'modePlayers'   : 2
            
        },
        {
			'qNr'			: 37,
            'game'          : 'splinter cell conviction',
            'platform'      : 'pc', 
            'region'        : 'na',
            
            'modeName'      : 'co-op',
            'modePlayers'   : 2
            
        },
        {
			'qNr'			: 38,
            'game'          : 'splinter cell conviction',
            'platform'      : 'pc', 
            'region'        : 'asia',
            
            'modeName'      : 'co-op',
            'modePlayers'   : 2
            
        },
        {
			'qNr'			: 39,
            'game'          : 'splinter cell conviction',
            'platform'      : 'xbl', 
            'region'        : 'eu',
            
            'modeName'      : 'co-op',
            'modePlayers'   : 2
            
        },
        {
			'qNr'			: 40,
            'game'          : 'splinter cell conviction',
            'platform'      : 'xbl', 
            'region'        : 'na',
            
            'modeName'      : 'co-op',
            'modePlayers'   : 2
            
        },
        {
			'qNr'			: 41,
            'game'          : 'splinter cell conviction',
            'platform'      : 'xbl', 
            'region'        : 'asia',
            
            'modeName'      : 'co-op',
            'modePlayers'   : 2
            
        }], function(err, res){});
}