module.exports = function() {  
  var game;
  var region;
  var platform;
  var modeName;
  var modePlayers;
  var qd;
  //var rank;
  var rank_s;

  var rg = Math.floor(  ( Math.random()*10 ) % 2 ); //game
  //rg =1;
  if (rg == 0) {
    game = 'Overwatch';
    
    var x = Math.floor(  ( Math.random()*10 ) % 2 ); //ow mode
    if (x==0) {
      modeName = 'Competitive';
      qd = Math.floor(  ( Math.random()*10 ) % 5 )+1;
      if (qd >= 3) {
        modePlayers = 6;
      } else if (qd >=2 ) {
        if( Math.floor((Math.random()*10) % 2) === 0) {
          modePlayers = 3;
        } else {
          modePlayers = 6;
        }
      } else {
        if( Math.floor((Math.random()*10) % 3) === 0) {
          modePlayers = 2;
        } else if( Math.floor((Math.random()*10) % 3) == 1) {
          modePlayers = 3;
        } else {
          modePlayers = 6;
        }
      }
    } else {
      modeName = 'Scrim'
      modePlayers = 12
      qd = Math.floor(  ( Math.random()*10 ) % 11 )+1;
    }
  

    var r1 = Math.floor((Math.random()*10) % 3 );
    var r2 = Math.floor((Math.random()*10) % 3 );

    if (r1 === 0) {
      region = 'eu';
    } else if(r1 === 1) {
      region = 'na';
    } else {
      region = 'asia';
    }

    if (r2 === 0) {
      platform = 'pc';
    } else if(r2 === 1) {
      platform = 'xbl';
    } else {
      platform = 'psn';
    }
    
    var r3 = Math.floor(  ( Math.random()*10 ) % 7 );
    if (r3 === 0) {
      rank_s = 'Bronze';
    } else if(r3 === 1) {
      rank_s = 'Silver';
    } else if(r3 === 2) {
      rank_s = 'Gold';
    } else if(r3 === 3) {
      rank_s = 'Platinum';
    } else if(r3 === 4) {
      rank_s = 'Diamond';
    } else if(r3 === 5) {
      rank_s = 'Master';
    } else {
      rank_s = 'GrandMaster';
    }

  } else if (rg == 1) {
    game = 'Splinter Cell Conviction';
    var r1 = Math.floor((Math.random()*10) % 3 );
    var r2 = Math.floor((Math.random()*10) % 2 );
    if (r1 === 0) {
      region = 'eu';
    } else if(r1 === 1) {
      region = 'na';
    } else {
      region = 'asia';
    }

    if (r2 === 0) {
      platform = 'pc';
    } else {
      platform = 'xbl';
    }
    modeName = 'co-op';
    modePlayers = 2;
    qd = 1;
    rank_s = 'Realistic';
    rank = [];
  }



return {game: game, qd: qd, rank_s: rank_s, modeName: modeName, modePlayers: modePlayers, region: region, platform: platform};
//return {game: game, qd: 1, rank_s: rank_s, modeName: modeName, modePlayers: modePlayers, region: region, platform: platform};

/*  function minmax(arr) {
    return [arr.sort(sortNumber)[0], arr.sort(sortNumber).reverse()[0]];
  }

  function sortNumber(a,b) {
      return a - b;
  }*/
}