var Qinfo           = require('./Qinfo');
var insideQ_OW           = require('../app/insideQ_OW');
module.exports = function(async,q) {

	for (var i=0; i<Qinfo.queue.length; i++) {
	  global.count.push(0);
	  q[i] = async.queue(function(task, callback) {
	    insideQ_OW(task, callback);
	  }, 1);
	}

	for (var i=0; i<Qinfo.queue.length; i++) {
	  q[i].drain = function() {
	    console.log('all items have been processed');
	    global.drained = true;
	  };
	}

}