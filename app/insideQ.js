var Log             = require('./models/log');//
var Match             = require('./models/match');//

//var Qinfo           = require('../config/Qinfo');//
var wG              = require('./whatGroups');//
var async           = require('async');

module.exports = function (io, task, callback) {
  Log.findOne({'_id': task.log_id, 'active':true}, function(err, actualLog){
    if (!actualLog) { callback(); } else {
      //io.emit('new',actualLog);//delete this
      //if (!task.atf) io.emit('new',actualLog);
      //get datetime here
      var datetime = new Date().toISOString();
      datetime = Date.parse(datetime) - (1*60*60*1000);//1h
      datetime = new Date(datetime).toISOString();
      Log.aggregate([ 
        { $match: 
          {'_id': {$ne: task.log_id},
          'active':true, 
          //datetime
          'updated': {$gte: new Date(datetime)},
          'game': actualLog.game, 
          'platform': actualLog.platform,
          'region': actualLog.region,
          'modeName': actualLog.modeName,
          'modePlayers': actualLog.modePlayers,
          'rank_s':  actualLog.rank_s }},
        { $group: {_id: '$qd_players' , count: { $sum: 1 } } },
        { $sort: { qd_players: -1 }}
      ],function(err, log_nb) {
        var wg = wG.whatGroups(log_nb,actualLog.modePlayers-actualLog.qd_players);
        if(wg) {
          console.log('wg:' + wg);
          actualLog.active = false;
          actualLog.success = true;
          actualLog.save(function(err, updatedActualLog){
            var dup = wG.dups(wg);
            var lf = wG.keys_n(dup);
            var arr = [actualLog._id];
            var i = 0;
            async.whilst(
              function() { return i < lf.length; },
              function(callback3) {
                Log.find({
                '_id': {$ne: task.log_id},
                'active':true, 
                //datetime
                'updated': {$gte: new Date(datetime)},
                'game': actualLog.game, 
                'platform': actualLog.platform,
                'region': actualLog.region,
                'modeName': actualLog.modeName,
                'modePlayers': actualLog.modePlayers,
                'rank_s':  actualLog.rank_s,
                'qd_players': lf[i][1]
                })
                .limit(lf[i][0])
                .exec(function(err, log) {
                  var j = 0;
                  async.each(log, function(log_i, callback2) {
                    log_i.success=true;
                    log_i.active=false;
                    log_i.save(function(err, ulog) {
                        arr.push(log_i._id);
                        callback2();  
                    });
                  }, function(err) {
                    i++;
                    callback3(null, arr);
                  });
                });  
              },
              function (err, n) {
                match = new Match;
                match.matches = n;
                //io remove
                //io.emit('delete',n);
                if (!task.atf) io.to(actualLog.game.replace(/\s/g, '')).emit('delete', n);
                match.save(function(err, match){
                  callback();
                });
              }
            );
          });
        } else {
          if (!task.atf) io.to(actualLog.game.replace(/\s/g, '')).emit('new', actualLog);
          //if (!task.atf) io.emit('new',actualLog);
          callback();
          //not found
          //serch in user DB
        }
      });
    }
  });
}