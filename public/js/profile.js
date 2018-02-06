var urlArr = window.location.href.split("/"); 
socket = io.connect(urlArr[0]+'//'+urlArr[2]);

//socket = io.connect('http://localhost:8080');

socket.on('match', function (data) {
    generateAlert('alert-info','<a href=\"/profile\">Match was found!</a>');
});

socket.on('match', function (data) {
    generateAlert('alert-info','<a href=\"/profile\">Match was found!</a>');
});



$(document).ready(function() {
	getLogs(true,0);
	
	$('select.game').change(function() {
		var gameName = $( 'select.game' ).val();
		if(gameName != null) gameName = gameName.replace(/([A-Z])/g, ' $1').trim();
        

        
        var elem = $(this);
		$.ajax({
        type: 'POST',
        url: '/game',
        data: {gameName: gameName},
        success:  function(json) {       
            $('select.platform').empty();
            $('select.platform').append( '<option value="" disabled selected hidden>Platform</option>');
            for (var i = 0; i < json.platform.length; i++) {
            	$('select.platform').append( '<option value='+json.platform[i]+'>'+json.platform[i]+'</option>');
            }
            $('select.region').empty();
            $('select.region').append( '<option value="" disabled selected hidden>Region</option>');
            for (var i = 0; i < json.region.length; i++) {
            	$('select.region').append( '<option value='+json.region[i]+'>'+json.region[i]+'</option>');
            }
        }
        });

	});
		
});

function getLogs(init,offset) {
	var userId = window.location.href.substr(window.location.href.lastIndexOf('/') + 1);
	$.ajax({
    type: 'GET',
    url: '/profile-logs/'+userId+'/'+offset,
    success:  function(json) {
    	console.log(json);
    	generateUserLogs(json.userLogs, json.mineProfile);
    	if (init) generateSpecificLog(json.userLogs[0]._id);
    }
	});
}

function generateUserLogs(userLogs, mineProfile) {
    if (mineProfile) {
    	for(i=0; i<userLogs.length; i++) {
    		if (userLogs[i].active) {
	    		$( '#logs > table > tbody' ).append(
	    		'<tr id=\"'+userLogs[i]._id+'\" class=\"log-row\">'+
					'<td class=\"text-center\">'+userLogs[i].game+'</td>'+
					'<td class=\"text-center\">'+userLogs[i].modeName+'</td>'+
					'<td class=\"text-center\">'+moment(userLogs[i].start).format('DD-MM-YYYY')+'</td>'+
					'<td class=\"text-center\">'+
						'<button class=\"glyphicon glyphicon-plus renew btn btn-warning btn-xs\"></button>'+
						'<button class=\"glyphicon glyphicon-remove\ terminate btn btn-warning btn-xs"></button>'+
						'<button class=\"glyphicon glyphicon-info-sign\ info btn btn-warning btn-xs"></button>'+
					'</td>'+
				'</tr>');
	    	} else {
	    		$( '#logs > table > tbody' ).append(
	    		'<tr id=\"'+userLogs[i]._id+'\" class=\"log-row\">'+
					'<td class=\"text-center\">'+userLogs[i].game+'</td>'+
					'<td class=\"text-center\">'+userLogs[i].modeName+'</td>'+
					'<td class=\"text-center\">'+moment(userLogs[i].start).format('DD-MM-YYYY')+'</td>'+
					'<td class=\"text-center\">'+
						'<button class=\"glyphicon glyphicon-plus renew btn btn-warning btn-xs\"></button>'+
						
						'<button class=\"glyphicon glyphicon-info-sign info btn btn-warning btn-xs\"></button>'+
					'</td>'+
				'</tr>');
	    	}
			$( '.log-row' ).insertBefore( 'tr.more-history' );
		}
    } else {
    	for(i=0; i<userLogs.length; i++) {
    		$( '#logs > table > tbody' ).append(
    		'<tr class=\"log-row\">'+
				'<td class=\"text-center\">'+userLogs[i].game+'</td>'+
				'<td class=\"text-center\">'+userLogs[i].modeName+'</td>'+
				'<td class=\"text-center\">'+moment(userLogs[i].start).format('DD-MM-YYYY')+'</td>'+
			'</tr>');
			$( '.log-row' ).insertBefore( 'tr.more-history' );
		}
    }
    RefreshSomeEventListener();
}

function generateSpecificLog(logId) {
	$.ajax({
	type: 'GET',
	url: '/specific-log/'+logId,
	success:  function(json) {
		console.log(json);
		$( '#specific-log > table > tbody > tr > td.game' ).empty();
		$( '#specific-log > table > tbody > tr > td.mode' ).empty();
		$( '#specific-log > table > tbody > tr > td.maximum-group' ).empty();
		$( '#specific-log > table > tbody > tr > td.your-group' ).empty();
		$( '#specific-log > table > tbody > tr > td.rank' ).empty();
		$( '#specific-log > table > tbody > tr > td.platform' ).empty();
		$( '#specific-log > table > tbody > tr > td.region' ).empty();
		$( '#specific-log > table > tbody > tr > td.start' ).empty();
		$( '#specific-log > table > tbody > tr > td.end' ).empty();
		$( '#specific-log > table > tbody > tr > td.is-actv' ).empty();
		$( '#specific-log > table > tbody > tr > td.is-success' ).empty();
		$( '#specific-log > table > tbody > tr > td.players' ).empty();
		//var timezoneOffset = new Date().getTimezoneOffset()*60*1000; //60*60*1000
		var timezoneOffset = 0;
	    json.userLog.start = Date.parse(json.userLog.start) - timezoneOffset;
	    json.userLog.start = new Date(json.userLog.start).toISOString();
		$( '#specific-log > table > tbody > tr > td.start' ).append(moment(json.userLog.start).format('DD-MM-YYYY, hh:mm a'));

		if (json.userLog.end == null) {
			$( '#specific-log > table > tbody > tr > td.end' ).append('-');
		} else {
			json.userLog.end = Date.parse(json.userLog.end) - timezoneOffset;
		    json.userLog.end = new Date(json.userLog.end).toISOString();
			$( '#specific-log > table > tbody > tr > td.end' ).append(moment(json.userLog.end).format('DD-MM-YYYY, hh:mm a'));
		}

		$( '#specific-log > table > tbody > tr > td.game' ).append(json.userLog.game);
		$( '#specific-log > table > tbody > tr > td.mode' ).append(json.userLog.modeName);
		$( '#specific-log > table > tbody > tr > td.maximum-group' ).append(json.userLog.modePlayers);
		$( '#specific-log > table > tbody > tr > td.your-group' ).append(json.userLog.qdPlayers);
		$( '#specific-log > table > tbody > tr > td.rank' ).append(json.userLog.rankS);
		$( '#specific-log > table > tbody > tr > td.platform' ).append(json.userLog.platform);
		$( '#specific-log > table > tbody > tr > td.region' ).append(json.userLog.region);

		if (json.userLog.active) {
			$( '#specific-log > table > tbody > tr > td.is-actv' ).append('Yes');
		} else {
			$( '#specific-log > table > tbody > tr > td.is-actv' ).append('No');
		}
		if (json.userLog.success == null) {
			$( '#specific-log > table > tbody > tr > td.is-success' ).append('-');
		} else {
			if (json.userLog.success) {
				$( '#specific-log > table > tbody > tr > td.is-success' ).append('Yes');
			} else {
				$( '#specific-log > table > tbody > tr > td.is-success' ).append('No');
			}
		}
		if (json.userLog.match.users.length == 0) {
			$( '#specific-log > table > tbody > tr > td.players' ).append('-');
		} else {
			for (var i = 0; i < json.userLog.match.users.length; i++) {
				var j=i+1;
				$( '#specific-log > table > tbody > tr > td.players' ).append('<a href=\"/profile\/'+json.userLog.match.users[i]+'\">Leader'+ j +'<\/a> ');
			}
		}
		RefreshSomeEventListener();
	}
	});
}

function generateAlert(alertType, message) {
    $('.alert').remove();
    $('.container').prepend('<div class=\"alert '+alertType+' col-md-6 col-md-offset-3 text-center\">'+message+
        '<span class="close glyphicon glyphicon-remove"></span></div>');
    RefreshSomeEventListener();
}

function RefreshSomeEventListener() {
    $('.game-logo.add').off();
    $('button.info').off();
    $('button.terminate').off();
    $('button.renew').off();
    $('.add-games.add').off();
    $('.add-games > div > .cancel').off();
    $('.add-games > div > .add').off();
    $('#games.over-table').find('button').off();
    $('button.more-history').off();
    $('span.close').off();
    
    $('.game-logo.add').on('click', function(){
		$('.add-games').toggle('display');
		$(this).toggleClass('active');
	});

	$('button.info').on('click', function() {
		generateSpecificLog($(this).parents('tr').attr('id'));
	});

	$('button.terminate').on('click', function() {
		var logId = $(this).parents('tr').attr('id');
		var thisButton = $(this);
		$.ajax({
		type: 'POST',
		data: {logId: $(this).parents('tr').attr('id') },
		url: '/cancel-ad/',
		success:  function(json) {
			thisButton.remove();
			generateSpecificLog(logId);
		}
		});
	});

	$('button.renew').on('click', function() {
		var logId = $(this).parents('tr').attr('id');
		$.ajax({
		type: 'GET',
		url: '/specific-log/'+logId,
		success:  function(json) {
			if (!json.userLog.active) {
				sessionStorage.removeItem('group');
				sessionStorage.removeItem('yourGroup');
				sessionStorage.removeItem('gameName');
			    sessionStorage.removeItem('modeName');
			    sessionStorage.removeItem('modePlayers');
			    sessionStorage.removeItem('rank');
			    sessionStorage.removeItem('platform');
			    sessionStorage.removeItem('region');
			    sessionStorage.removeItem('id');
			    
			    sessionStorage.setItem('id',JSON.stringify([]));
			    //sessionStorage.setItem('init',true);
			    sessionStorage.setItem('group', 0);
				sessionStorage.setItem('yourGroup', json.userLog.qdPlayers);
		        sessionStorage.setItem('gameName',json.userLog.game.replace(/\s/g, ''));
		        sessionStorage.setItem('modePlayers',json.userLog.modePlayers);
		        sessionStorage.setItem('modeName',json.userLog.modeName);
		        sessionStorage.setItem('rank',json.userLog.rankS.replace(/\s/g, ''));
		        sessionStorage.setItem('platform',json.userLog.platform);
		        sessionStorage.setItem('region',json.userLog.region);
		        window.location.href='/';
		    }
		}
		});
	});

	$('.add-games > div > .cancel').on('click', function(){
		console.log('cancel');
		$( '.game-logo.add' ).trigger( "click" );
	});

	$('.add-games > div > .add').on('click', function(){
		var valid = true;
		var game = $('select.game').val().replace(/([A-Z])/g, ' $1').trim();
		var platform = $('select.platform').val();
		var region = $('select.region').val();
		var nick = $('input[name=nick]').val();

		if ( game == null) valid = false;
		if ( platform == null) valid = false;
		if ( nick == '') valid = false;
		if (valid) {
			var userId = window.location.href.substr(window.location.href.lastIndexOf('/') + 1);
			//game = game.replace(/([A-Z])/g, ' $1').trim();
			$.ajax({
			type: 'POST',
			data: {userId: userId, game: game, platform: platform, nick: nick, region: region },
			url: '/add-game',
			success:  function(json) {
				$( '#games.over-table > table > tbody' ).append(
	    		'<tr>'+
					'<td class=\"text-center\">'+game+'</td>'+
					'<td class=\"text-center\">'+nick+'</td>'+
					'<td class=\"text-center\">'+platform+'</td>'+
					'<td class=\"text-center\">'+region+'</td>'+
					'<td class=\"text-center\">'+
						'<button class=\"glyphicon glyphicon-remove btn btn-warning btn-xs\"></button>'+
					'</td>'+
				'</tr>');
				var str = game.replace(/\s/g, '');
				//$('.img-circle.game-logo[alt='+str+']')
				if ($('.img-circle.game-logo[alt='+str+']').length == 0 ) {
					$( 'div.games' ).append('<img src=\"/img/'+str+'.png\" alt=\"'+str+'\" class=\"img-circle game-logo\">');
					$( '.img-circle.game-logo' ).not('.img-circle.game-logo.add').insertBefore( '.img-circle.game-logo.add' );
					//"img-circle game-logo"
				}
				$( '.game-logo.add' ).trigger( "click" );
				RefreshSomeEventListener();
			}
			});
		}
	});

	$('#games.over-table').find('button').on('click', function(){
		console.log('here m8');
		var parent = $(this).parents('tr');
		//console.log($(this).parents('tr').children().text());
		var arr = [];
		$(this).parents('tr').children().not(':last').each(function(index, obj) {
			console.log($(this).text());
			arr[index] = $(this).text();
		});
		console.log(arr);
		var userId = window.location.href.substr(window.location.href.lastIndexOf('/') + 1);
		$.ajax({
		type: 'POST',
		data: {userId: userId, userGame: arr },
		url: '/game-remove',
		success:  function(json) {
			console.log(json);
			console.log('test');
			parent.remove();

			var gamesArr = [];
			$('#games.over-table').find('tbody >tr').find('td:first').each(function(index, obj) {
				gamesArr.push($(this).text());
			});
			console.log(gamesArr);
			if (!gamesArr.includes(arr[0].replace(/\s/g, ''))) {
				//console.log($('.img-circle.game-logo[alt='+arr[0]+']').attr('alt',arr[0]));
				$('.img-circle.game-logo[alt='+arr[0].replace(/\s/g, '')+']').remove();
			}
			//if ($('#games.over-table > tbody').find('td:first').text() == 0 ) {
			// generateUserLogs(json.userLogs, json.mineProfile);
			// generateSpecificLog(json.userLogs[0]._id);

		}
		});
	});
	$('button.more-history').on('click',function(){
		getLogs(false,$('tr.log-row').length);
	});

	$('span.close').on('click', function(){
        $(this).parent().remove();
    });
}

// generateAlert('alert-danger','At least one ad is no longer active.');