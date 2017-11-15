var _    = require('underscore');

module.exports =  {

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
        //out.push(A[i]);
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
  }

}