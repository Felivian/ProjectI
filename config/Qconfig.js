var Queue 		= require('../app/models/queue');
var insideQ           = require('../app/insideQ');


var Log             = require('../app/models/log');//
var Match             = require('../app/models/match');//
module.exports = function(async,q, io, bot) {

	Queue.count({}, function(err, count){
		console.log(count);
		for (var i=0; i<count; i++) {
			//global.count.push(0);
			q[i] = async.queue(function(task, callback) {
				if (task.arr.length != 0) {
					insideQ.manual(io, bot, task, callback);
				} else {
		    		insideQ.automatic(io, bot, task, callback);
		    	}
			}, 1);
		}
	});
}