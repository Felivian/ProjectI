var Queue 		= require('../app/models/queue');
var insideQ 	= require('../app/insideQ');


var Log 		= require('../app/models/log');//
var Game 		= require('../app/models/game');//
var push2q      = require('../app/push2q');
var mf      	= require('../app/moreFunctions');
module.exports = function(async,q, io, bot) {



	async.waterfall([
		insertQueues,
		configureQueues,
		afterFailurePush
	], function (error, result) {
		if (error) { alert('Something is wrong!'); }
	});

	function insertQueues(waterfallCallback) {
		Game.findOne({changed: true }, function(err, found) {
			if(found) {
				Queue.remove({}, function(err, res) {
		            Game.find({}, function(err, game) {
		                var count=-1;
		                async.eachOfSeries(game, function (value1, key1, callback1) {
		                	async.eachOfSeries(value1.platform, function (value2, key2, callback2) {
		                    	async.eachOfSeries(value1.region, function (value3, key3, callback3) {
		                        	async.eachOfSeries(value1.mode, function (value4, key4, callback4) {
		                            	async.eachOfSeries(value4.modePlayers, function (value5, key5, callback5) {
		                                    count++;
		                                    Queue.insertMany([{
		                                        qNr: count, 
		                                        game: value1.name, 
		                                        platform: value2, 
		                                        region: value3, 
		                                        modeName: value4.modeName,
		                                        modePlayers: value5
		                                    }], function(err, qi) {
		                                    	callback5();
		                                    });
		                                }, function (err) {
										    callback4();
										});
		                            }, function (err) {
									    callback3();
									});
		                        }, function (err) {
								    callback2();
								});
		                    }, function (err) {
							    callback1();
							});
		                }, function (err) {
						    Game.updateMany({},{ $set: { changed: false}}, function(err, uGames) {
						    	waterfallCallback(null, '');
						    });
						    
						});    
		            });  
		        });
			} else {
				waterfallCallback(null, '');
			}
		});
	    
	}
	function configureQueues(arg1, waterfallCallback) {
	    var i=-1;
	    Queue.count({}, function(err, count){
			async.during(
			    function (callback1) {
			        return callback1(null, i < count);
			    },
			    function (callback1) {
			        i++;
			        q[i] = async.queue(function(task, callback) {
						if (task.logIdArr.length != 0) {
							insideQ.manual(io, bot, task, callback);
						} else {
				    		insideQ.automatic(io, bot, task, callback);
				    	}
					}, 1);
					callback1();
			    },
			    function (err) {
			        waterfallCallback(null, '');
			    }
			);
		});
	    
	}
	function afterFailurePush(arg1, waterfallCallback) {
		Log.find({ active: true, automatic:true }, function(err, log) {
	      	async.each(log, function(thisLog, callback1) {
	      		
	      		var datetime = new Date().toISOString();
		        datetime = Date.parse(datetime) - (1*60*60*1000);//1h
		        var date2 = Date.parse(thisLog.start)
		        if (date2 > datetime) {
		        	push2q(q, thisLog._id, thisLog.user_id, thisLog.game, thisLog.platform, thisLog.region, thisLog.modeName, thisLog.modePlayers, true, []);
		        	callback1();
		        } else {
		        	thisLog.active = false;
		        	thisLog.success = false;
		        	thisLog.end = new Date();
		        	thisLog.save(function(err, savedLog) {
		        		mf.sendInactive(io, bot, thisLog.userId);
		        		callback1();
		        	});
		        	
		        }   		
	      	}, function(err) {
			    waterfallCallback(null, 'done');
			});
		});
	}
}