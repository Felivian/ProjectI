var Qinfo           = require('./Qinfo');
var insideQ           = require('../app/insideQ');
module.exports = function(async,q) {

	for (var i=0; i<Qinfo.queue.length; i++) {
		global.count.push(0);
		//global.wasInserted[i] = true;
		//global.isDrained[i] = true;
		q[i] = async.queue(function(task, callback) {
	    	insideQ(task, callback);
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
	/*q[0].drain = function() {
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
	q[27].drain = function() {
		console.log('all items have been processed in queue nr. 27');
	    global.isDrained[27] = true;
	}
	q[28].drain = function() {
		console.log('all items have been processed in queue nr. 28');
	    global.isDrained[28] = true;
	}
	q[29].drain = function() {
		console.log('all items have been processed in queue nr. 29');
	    global.isDrained[29] = true;
	}
	q[30].drain = function() {
		console.log('all items have been processed in queue nr. 30');
	    global.isDrained[30] = true;
	}
	q[31].drain = function() {
		console.log('all items have been processed in queue nr. 31');
	    global.isDrained[31] = true;
	}
	q[32].drain = function() {
		console.log('all items have been processed in queue nr. 32');
	    global.isDrained[32] = true;
	}
	q[33].drain = function() {
		console.log('all items have been processed in queue nr. 33');
	    global.isDrained[33] = true;
	}
	q[34].drain = function() {
		console.log('all items have been processed in queue nr. 34');
	    global.isDrained[34] = true;
	}
	q[35].drain = function() {
		console.log('all items have been processed in queue nr. 35');
	    global.isDrained[35] = true;
	}
	q[36].drain = function() {
		console.log('all items have been processed in queue nr. 36');
	    global.isDrained[36] = true;
	}
	q[37].drain = function() {
		console.log('all items have been processed in queue nr. 37');
	    global.isDrained[37] = true;
	}
	q[38].drain = function() {
		console.log('all items have been processed in queue nr. 38');
	    global.isDrained[38] = true;
	}
	q[39].drain = function() {
		console.log('all items have been processed in queue nr. 39');
	    global.isDrained[39] = true;
	}
	q[40].drain = function() {
		console.log('all items have been processed in queue nr. 40');
	    global.isDrained[40] = true;
	}
	q[41].drain = function() {
		console.log('all items have been processed in queue nr. 41');
	    global.isDrained[41] = true;
	}*/

}