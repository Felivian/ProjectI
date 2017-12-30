var Log             = require('./models/log');//
var Match             = require('./models/match');//

//var Qinfo           = require('../config/Qinfo');//
var wG              = require('./whatGroups');//
var async           = require('async');

module.exports = function (task, callback) {
  Log.findOne({'_id': task.log_id, 'active':true}, function(err, actualLog){
    if (!actualLog) { callback(); } else {
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
          match = new Match;
          match.matches=[actualLog._id];
          actualLog.save(function(err, updatedActualLog){
            match.save(function(err, match){
              var dup = wG.dups(wg);
              var lf = wG.keys_n(dup);
              for(var i=0; i<lf.length; i++) {
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
                })//, {$set: {success: true, active: false}}, { new: true })
                .limit(lf[i][0])
                .exec(function(err, log) {
                  async.each(log, function(log_i, callback2) {
                    log_i.success=true;
                    log_i.active=false;
                    log_i.save(function(err, ulog) {
                      global.count[task.i]++;
                      Match.update({'matches': {$in: [task.log_id]}},  {$push: {matches: ulog._id} }, function(err, umatch) {
                        callback2();
                      });
                      
                    });
                  }, function(err) {
                    if(global.count[task.i] === wg.length ) { 
                      console.log('HERE!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
                      global.count[task.i] = 0;
                      callback();
                    }
                  });
                });   
              }
            });   
          });
        } else {
          callback();
          //not found
          //serch in user DB
        }
      });
    }
  });

}