var Queue 		= require('../app/models/queue');
var insideQ           = require('../app/insideQ');
module.exports = function(async,q) {

	Queue.count({}, function(err, count){
		console.log(count);
		for (var i=0; i<count; i++) {
			global.count.push(0);
			q[i] = async.queue(function(task, callback) {
		    	insideQ(task, callback);
			}, 1);
		}
	});
}