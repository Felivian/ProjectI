var Log             = require('./models/log');//
var Match             = require('./models/match');//

var Qinfo           = require('../config/Qinfo');//
var wG              = require('./whatGroups');//

module.exports = function (task, callback) {
  Log.findOne({'_id': task.log_id, 'active':true}, function(err, actualLog){
    if (!actualLog) { callback(); } else {
      //var maxSR = actualLog.rank_n + 250;
      //var minSR = actualLog.rank_n - 250;
      Log.aggregate([ 
        { $match: 
          {'_id': {$ne: task.log_id},
          'active':true, 
          'pending':false, 
          'game': actualLog.game, 
          'platform': actualLog.platform,
          'region': actualLog.region,
          'mode.name': actualLog.mode.name,
          'mode.players': actualLog.mode.players,
          'realMax': {$lte: actualLog.maxSR },
          'realMin': {$gte: actualLog.minSR} }},
        { $group: {_id: '$qd_players' , count: { $sum: 1 } } },
        { $sort: { qd_players: -1 }}
      ],function(err, log_nb) {
        var wg = wG.whatGroups(log_nb,actualLog.mode.players-actualLog.qd_players);
        if(wg) {
          console.log('wg:' + wg);
          actualLog.active = false;
          actualLog.success = true;
          actualLog.save(function(err, updatedActualLog){});
          match = new Match;
          match.matches=[actualLog._id];
          match.save(function(err, match){});
          
          var dup = wG.dups(wg);
          var lf = wG.keys_n(dup);
          for(var i=0; i<lf.length; i++) {
            Log.find({
              '_id': {$ne: task.log_id},
              'active':true, 
              'pending':false, 
              'game': actualLog.game, 
              'platform': actualLog.platform,
              'region': actualLog.region,
              'mode.name': actualLog.mode.name,
              'mode.players': actualLog.mode.players,
              'realMax': {$lte: actualLog.maxSR },
              'realMin': {$gte: actualLog.minSR },
              'qd_players': lf[i][1]
            })//, {$set: {success: true, active: false}}, { new: true })
            .limit(lf[i][0])
            .exec(function(err, log) {
              for (var j=0; j<log.length; j++) {
                log[j].success=true;
                log[j].active=false;
                //Log.update({'_id': log[j]._id}, {$set: { success:true, active: false }}, function(err, ulog) {
                log[j].save(function(err, ulog) {
                  console.log('saved1 '+task.log_id);
                  Match.update({'matches': {$in: [task.log_id]}},  {$push: {matches: ulog._id} }, function(err, umatch) {
                    console.log('saved1 '+task.log_id );
                    global.count[task.i]++;
                    console.log('count: '+global.count[task.i]+', wg.length: '+wg.length);
                    if(global.count[task.i] == wg.length ) { 
                      console.log('TRUE count: '+global.count[task.i]+', wg.length: '+wg.length);
                      global.count[task.i] = 0;
                      callback();
                    }
                  });
                });
              }
            });
          }
        } else {
          callback();
          //not found
          //serch in user DB
        }
      });
    }
  });
}
