var _    = require('underscore');

module.exports =  {

	whatGroups: function(start, groupSize) {
		var zxc = [];

		for (var i=0; i< start.length; i++) {
			var x=start[i].count;
			if (start[i].count > 12) {
				x=12;
			}
			for (var j=0; j<x; j++) {
				zxc.push(start[i]._id);
			}
		}
		var wej=zxc.sort().reverse();
		var copy = wej.slice();

		return module.exports.sum(wej,copy,[],groupSize);
	},

	sum: function(wej, copy, result, groupSize) {
		if (module.exports.sum_arr(result)==groupSize) {
			return result;
		} else if (wej.length === 0) {
			if (copy.length === 0) {
				return false;
			}
			copy.shift();
			wej = copy.slice();
			return module.exports.sum(wej,copy, [], groupSize);
		} else {
			if (module.exports.sum_arr(result)<groupSize) {
				result.push(wej[0]);
				wej.shift();
				return module.exports.sum(wej,copy,result, groupSize);
			} else {
				result.pop();
				return module.exports.sum(wej,copy,result, groupSize);
			}
		}
	},

	sum_arr: function(arr) {
		return arr.reduce(module.exports.add, 0);
	},
	
	add: function(a, b) {
		return a + b;
	},

	getRoles: function(data) {
		var hash = {};
		var out = [];
		var legit;
		var out2 = [];

		var A = module.exports.cartesianProduct(data);

		_.sortBy(A, function(arr) {
			return arr.sort();
		});

		
		for (var i = 0; i < A.length; i++) {
			var key = A[i].join('');
			if (!hash[key]) {
				out.push(A[i]);
				hash[key] = 'found';
			}
		}

		legit = _.reject(out, function(arr) {
			var result = {};
			result = module.exports.dups(arr);
			return result.d > 2 || result.h > 2 || result.t > 2
		});

		
		for (var i = 0; i < legit.length; i++) {
			var key = legit[i].join('');
			out2.push(key);
		}

		return out2;
	},


	cartesianProduct: function(arr) {
		return arr.reduce(function(a, b) {
			return a.map(function(x) {
				return b.map(function(y) {
					return x.concat(y);
				})
			}).reduce(function(a, b) {
				return a.concat(b)
			}, [])
		}, [
			[]
		])
	},

	dups: function(arr) {
		var counts = {};
		arr.forEach(function(x) {
			counts[x] = (counts[x] || 0) + 1;
		});
		return counts;
	},


	keys_n: function(in_arr) {
		var arr = [];
		for (var i=0; i<Object.keys(in_arr).length; i++) {
			arr.push(Number(_.keys(in_arr)[i]));
		}
		var val=_.values(in_arr);
		return _.zip(val,arr);
	},
	sortNumber: function (a,b) {
			return a - b;
	}

}