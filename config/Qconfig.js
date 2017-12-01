var Qinfo           = require('./Qinfo');
var insideQ_OW           = require('../app/insideQ_OW');
module.exports = function(async,q) {

	for (var i=0; i<Qinfo.queue.length; i++) {
		global.count.push(0);
		global.wasInserted[i] = false;
		global.isDrained[i] = true;
		q[i] = async.queue(function(task, callback) {
	    	insideQ_OW(task, callback);
		}, 1);
	}

	/*for (var i=0; i<Qinfo.queue.length; i++) {
		q[i].drain = funcOnDrain(i);
	}

	function funcOnDrain(x) {
	    console.log('all items have been processed in queue nr. '+x);
	    global.isDrained[x] = true;

	    //global.isDrained.push(true);
	};*/
	q[0].drain = function() {
		console.log('all items have been processed in queue nr. 0');
	    global.isDrained[0] = true;
	}
	q[1].drain = function() {
		console.log('all items have been processed in queue nr. 1');
	    global.isDrained[1] = true;
	}
	q[2].drain = function() {
		console.log('all items have been processed in queue nr. 2');
	    global.isDrained[2] = true;
	}
	q[3].drain = function() {
		console.log('all items have been processed in queue nr. 3');
	    global.isDrained[3] = true;
	}
	q[4].drain = function() {
		console.log('all items have been processed in queue nr. 4');
	    global.isDrained[4] = true;
	}
	q[5].drain = function() {
		console.log('all items have been processed in queue nr. 5');
	    global.isDrained[5] = true;
	}
	q[6].drain = function() {
		console.log('all items have been processed in queue nr. 6');
	    global.isDrained[6] = true;
	}
	q[7].drain = function() {
		console.log('all items have been processed in queue nr. 7');
	    global.isDrained[7] = true;
	}
	q[8].drain = function() {
		console.log('all items have been processed in queue nr. 8');
	    global.isDrained[8] = true;
	}
	q[9].drain = function() {
		console.log('all items have been processed in queue nr. 9');
	    global.isDrained[9] = true;
	}
	q[10].drain = function() {
		console.log('all items have been processed in queue nr. 10');
	    global.isDrained[10] = true;
	}
	q[11].drain = function() {
		console.log('all items have been processed in queue nr. 11');
	    global.isDrained[11] = true;
	}
	q[12].drain = function() {
		console.log('all items have been processed in queue nr. 12');
	    global.isDrained[12] = true;
	}
	q[13].drain = function() {
		console.log('all items have been processed in queue nr. 13');
	    global.isDrained[13] = true;
	}
	q[14].drain = function() {
		console.log('all items have been processed in queue nr. 14');
	    global.isDrained[14] = true;
	}
	q[15].drain = function() {
		console.log('all items have been processed in queue nr. 15');
	    global.isDrained[15] = true;
	}
	q[16].drain = function() {
		console.log('all items have been processed in queue nr. 16');
	    global.isDrained[16] = true;
	}
	q[17].drain = function() {
		console.log('all items have been processed in queue nr. 17');
	    global.isDrained[17] = true;
	}
	q[18].drain = function() {
		console.log('all items have been processed in queue nr. 18');
	    global.isDrained[18] = true;
	}
	q[19].drain = function() {
		console.log('all items have been processed in queue nr. 19');
	    global.isDrained[19] = true;
	}
	q[20].drain = function() {
		console.log('all items have been processed in queue nr. 20');
	    global.isDrained[20] = true;
	}
	q[21].drain = function() {
		console.log('all items have been processed in queue nr. 21');
	    global.isDrained[21] = true;
	}
	q[22].drain = function() {
		console.log('all items have been processed in queue nr. 22');
	    global.isDrained[22] = true;
	}
	q[23].drain = function() {
		console.log('all items have been processed in queue nr. 23');
	    global.isDrained[23] = true;
	}
	q[24].drain = function() {
		console.log('all items have been processed in queue nr. 24');
	    global.isDrained[24] = true;
	}
	q[25].drain = function() {
		console.log('all items have been processed in queue nr. 25');
	    global.isDrained[25] = true;
	}
	q[26].drain = function() {
		console.log('all items have been processed in queue nr. 26');
	    global.isDrained[26] = true;
	}

}