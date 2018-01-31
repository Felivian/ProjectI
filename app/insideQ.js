var Log             = require('./models/log');//
var Match             = require('./models/match');//

//var Qinfo           = require('../config/Qinfo');//
var wG              = require('./whatGroups');//
var async           = require('async');
var mf              = require('./main_functions');//

module.exports =  {
  automatic: function (io, bot, task, callback) {
    Log.findOne({'_id': task.log_id, 'active':true}, function(err, actualLog){
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
            actualLog.end = new Date();
            actualLog.save(function(err, updatedActualLog){
              var dup = wG.dups(wg);
              var lf = wG.keys_n(dup);
              //var arr = [actualLog._id];
              var json = {};
              json.id = [actualLog._id];
              json.userId = [actualLog.userId];

              var i = 0;
              async.whilst(
                function() { return i < lf.length; },
                function(callback3) {
                  Log.find({
                  '_id': {$ne: task.log_id},
                  //'userId': {$ne: task.userId},
                  'automatic': true,
                  'active':true, 
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
                      log_i.end = new Date();
                      log_i.save(function(err, ulog) {
                          //arr.push(log_i._id);
                          json.id.push(log_i._id);
                          json.userId.push(log_i.userId);
                          callback2();  
                      });
                    }, function(err) {
                      i++;
                      //callback3(null, arr);
                      callback3(null, json);
                    });
                  });  
                },
                function (err, n) {
                  match = new Match;
                  //match.matches = n;
                  match.matches = n.id;
                  match.users = n.userId;
                  if (!task.atf) io.to(actualLog.game.replace(/\s/g, '')).emit('delete', n);
                  match.save(function(err, match){
                    callback();
                    mf.sendInfo(io, bot, match.users);
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
  },
  manual: function (io, bot, task, callback) {
    //task.userId
    Log.find({_id: {$in: task.arr}, active:true}, function(err, log) {
      console.log(log);
      console.log(task.arr);
      if (log.length == task.arr.length) {
        console.log('yep');
        var date = new Date();
        newLog = new Log;
        newLog.userId = task.userId;
        //newLog.userName =
        newLog.active = false;
        newLog.success = true;
        newLog.start = date;
        newLog.updated = date;
        newLog.end = date;
        newLog.platform = log[0].platform;
        newLog.region = log[0].region;
        newLog.game = log[0].game;
        newLog.modeName = log[0].modeName;
        newLog.modePlayers = log[0].modePlayers;
        newLog.rank_s = log[0].rank_s;

        var userIds = [task.userId];
        var qd_playersSum = 0;
        async.each(log, function(val, callback2) { 
          qd_playersSum += val.qd_players;
          userIds.push(val.userId);
          callback2();
        }, function(err) {
          newLog.qd_players = log[0].modePlayers - qd_playersSum;
          newLog.save(function(err,sLog) {
            console.log(sLog._id);
            match = new Match;
            match.matches = task.arr;
            match.users = userIds;
                    
            Log.updateMany({_id: {$in: task.arr}},
            {$set: {active: false, success: true, end: new Date(date)} } , 
            function(err, uLog) {
              console.log(match.matches);
              console.log(newLog.game.replace(/\s/g, ''));
              if (!task.atf) io.to(newLog.game.replace(/\s/g, '')).emit('delete', {id: task.arr});
              match.matches.push(sLog._id);
              match.save(function(err, match){
                //stoping active ads (one) of person that triggered match event
                var date = new Date();
                Log.updateMany({userId: task.userId, active:true},
                {$set: {active: false, success: false, end: new Date(date)} } , 
                function(err, uLog) {
                  callback();
                });
                //console.log('yeah');
                //send info to matches
                mf.sendInfo(io, bot, match.users);
              });
            });
          });
        });
      } else { 
        //send error info
        //~some ads are not active anymore
        //mf.sendInfo(io, task.userId);
        mf.sendError(io, bot, task.userId);
        callback(); 
      }
    });
  }
}