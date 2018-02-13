var Log             = require('./models/log');
var mongoose        = require('mongoose');
var wG              = require('./whatGroups');
var async           = require('async');
var mf              = require('./moreFunctions');

module.exports =  {
  automatic: function (io, bot, task, callback) {
    Log.findOne({'_id': task.log_id, 'active':true}, function(err, actualLog){
      console.log('here');
      if (!actualLog) { callback(); } else {
        //get datetime here
        var datetime = new Date().toISOString();
        datetime = Date.parse(datetime) - (1*60*60*1000);//1h
        datetime = new Date(datetime).toISOString();
        Log.aggregate([ 
          { $match: 
            {'_id': {$ne: task.log_id},
            //'userId': {$ne: task.userId},
            'automatic': true,
            'active':true, 
            'start': {$gte: new Date(datetime)},
            'game': actualLog.game, 
            'platform': actualLog.platform,
            'region': actualLog.region,
            'modeName': actualLog.modeName,
            'modePlayers': actualLog.modePlayers,
            'rankS':  actualLog.rankS }},
          { $group: {_id: '$qdPlayers' , count: { $sum: 1 } } },
          { $sort: { qdPlayers: -1 }}
        ],function(err, log_nb) {
          var wg = wG.whatGroups(log_nb,actualLog.modePlayers-actualLog.qdPlayers);
          if(wg) {
            actualLog.active = false;
            actualLog.success = true;
            actualLog.end = new Date();
            var dup = wG.dups(wg);
            var lf = wG.keys_n(dup);
            console.log(lf);
            var json = {};
            json.id = [actualLog._id];
            json.userIds = [actualLog.userId];

            var i = 0;
            async.whilst(
              function() { return i < lf.length; },
              function(callback3) {
                Log.find({
                '_id': {$ne: task.log_id},
                //'userId': {$ne: task.userId},
                'automatic': true,
                'active':true, 
                'start': {$gte: new Date(datetime)},
                'game': actualLog.game, 
                'platform': actualLog.platform,
                'region': actualLog.region,
                'modeName': actualLog.modeName,
                'modePlayers': actualLog.modePlayers,
                'rankS':  actualLog.rankS,
                'qdPlayers': lf[i][1]
                })
                .limit(lf[i][0])
                .exec(function(err, log) {
                  var j = 0;
                  async.each(log, function(log_i, callback2) {
                    json.id.push(log_i._id);
                    json.userIds.push(log_i.userId);
                    callback2();  
                  }, function(err) {
                    i++;
                    log.push(actualLog);
                    Log.updateMany({_id: {$in: json.id}},
                    {$set: {active: false, success: true, end: new Date() , 'match.matches': json.id, 'match.users': json.userIds} } , 
                    function(err, uLog) {
                      callback3(null, json);
                    })
                  });
                });  
              },
              function (err, n) {
                //if (!task.atf) { 
                  io.to(actualLog.game.replace(/\s/g, '')).emit('delete', n); 
                  io.to('allGames').emit('delete', n);
                //}
                mf.sendInfo(io, bot, n.userIds);
                callback();
              }
            );
          } else {
            if (!task.atf) { 
              io.to(actualLog.game.replace(/\s/g, '')).emit('new', actualLog); 
              io.to('allGames').emit('new', actualLog);
            }
            callback();
          }
        });
      }
    });
  },
  manual: function (io, bot, task, callback) {
    //task.userId
    Log.find({_id: {$in: task.logIdArr}, active:true}, function(err, log) {
      if (log.length == task.logIdArr.length) {
        var date = new Date();
        newLog = new Log;
        newLog.userId = task.userId;
        newLog.active = false;
        newLog.success = true;
        newLog.start = date;
        //newLog.updated = date;
        newLog.end = date;
        newLog.platform = log[0].platform;
        newLog.region = log[0].region;
        newLog.game = log[0].game;
        newLog.modeName = log[0].modeName;
        newLog.modePlayers = log[0].modePlayers;
        newLog.rankS = log[0].rankS;

        var userIds = [task.userId];
        var qdPlayersSum = 0;
        async.each(log, function(val, callback2) { 
          qdPlayersSum += val.qdPlayers;
          userIds.push(val.userId);
          callback2();
        }, function(err) {
          newLog.qdPlayers = log[0].modePlayers - qdPlayersSum;
          //match = new Match;
          var matches = task.logIdArr;
          matches.push(newLog._id);
          newLog.match.matches = matches;
          newLog.match.users = userIds;
          //match.matches = task.logIdArr;
          //match.matches.push(newLog._id);
          //match.users = userIds;
          newLog.save(function(err,sLog) {
            newLog.match.matches = matches;
            newLog.match.users = userIds;
            Log.updateMany({_id: {$in: task.logIdArr}},
            {$set: {active: false, success: true, end: new Date(date) , 'match.matches': matches, 'match.users': userIds} } , 
            function(err, uLog) {
              //if (!task.atf) { 
                io.to(newLog.game.replace(/\s/g, '')).emit('delete', {id: task.logIdArr}); 
                io.to('allGames').emit('delete', {id: task.logIdArr});
              //}
              mf.sendInfo(io, bot, userIds);
              callback();
            });
          });
        });
      } else { 
        mf.sendError(io, bot, task.userId);
        callback(); 
      }
    });
  }
}