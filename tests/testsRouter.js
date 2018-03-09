var wG      = require('../app/whatGroups');
var _       = require('underscore');

module.exports = function(app, mongoose, q) {

    app.get('/test1/:iterations', function(req, res) {
    	require('../tests/insertRandom')(q, req.params.iterations);
    	res.sendStatus(200);
    });

    app.get('/test2', function(req, res) {
    	require('../tests/matchValidator')();
    	res.sendStatus(200);
    });
}