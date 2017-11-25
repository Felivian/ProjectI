module.exports = function() {  
  var qd = Math.floor(  ( Math.random()*10 ) % 5 )+1;

  var mode;
  if (qd >= 3) {
    mode = 6;
  } else if (qd >=2 ) {
    if( Math.floor((Math.random()*10) % 2) === 0) {
      mode = 3;
    } else {
      mode = 6;
    }
  } else {
    if( Math.floor((Math.random()*10) % 3) === 0) {
      mode = 2;
    } else if( Math.floor((Math.random()*10) % 3) == 1) {
      mode = 3;
    } else {
      mode = 6;
    }
  }

  var rank = [];

  for (var i=0; i<qd; i++) {
    do {
      rank.push( (Math.floor( Math.random()*10000) % 4500)+500 );
      var newArray = rank.slice()
      var mm = minmax(newArray);
      var min = mm[0];
      var max = mm[1];
      if ( (max-min) > 500 ) {
        rank.pop();
      }
    } while ( (max-min) > 500 );
  }

  var r1 = Math.floor((Math.random()*10) % 3 );
  var r2 = Math.floor((Math.random()*10) % 3 );

  var region;
  var platform;

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

  //return {qd: qd, rank: rank, mode: mode, region: region, platform: platform};
  return {qd: 2, rank: rank, mode: 6, region: 'eu', platform: 'pc'};
  function minmax(arr) {
    return [arr.sort(sortNumber)[0], arr.sort(sortNumber).reverse()[0]];
  }

  function sortNumber(a,b) {
      return a - b;
  }
}