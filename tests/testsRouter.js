var wG      = require('../app/whatGroups');
var _       = require('underscore');

module.exports = function(app, mongoose, q) {

    app.get('/test1', function(req, res) {
    	require('../tests/insertRandom')(q);
    	res.sendStatus(200);
    });

    app.get('/test2', function(req, res) {
    	require('../tests/matchValidator')();
    	res.sendStatus(200);
    });
}