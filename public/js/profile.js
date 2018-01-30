$(document).ready(function() {
	var userId = window.location.href.substr(window.location.href.lastIndexOf('/') + 1);
	// var timezoneOffset = new Date().getTimezoneOffset()/60;
	// console.log(timezoneOffset);
	$.ajax({
    type: 'GET',
    url: '/profile-logs/'+userId,
    success:  function(json) {
    	console.log(json);
    	generateUserLogs(json.userLogs, json.mineProfile);
    	generateSpecificLog(json.userLogs[0]._id);
    }
	});

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
        }
        });

	});
		
});

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
						'<button class=\"glyphicon glyphicon-plus renew\"></button>'+
						'<button class=\"glyphicon glyphicon-remove\ terminate"></button>'+
						'<button class=\"glyphicon glyphicon-info-sign\ info"></button>'+
					'</td>'+
				'</tr>');
	    	} else {
	    		$( '#logs > table > tbody' ).append(
	    		'<tr id=\"'+userLogs[i]._id+'\" class=\"log-row\">'+
					'<td class=\"text-center\">'+userLogs[i].game+'</td>'+
					'<td class=\"text-center\">'+userLogs[i].modeName+'</td>'+
					'<td class=\"text-center\">'+moment(userLogs[i].start).format('DD-MM-YYYY')+'</td>'+
					'<td class=\"text-center\">'+
						'<button class=\"glyphicon glyphicon-plus renew\"></button>'+
						
						'<button class=\"glyphicon glyphicon-info-sign info\"></button>'+
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
		$( '#specific-log > table > thead > tr > td.game' ).empty();
		$( '#specific-log > table > thead > tr > td.mode' ).empty();
		$( '#specific-log > table > thead > tr > td.maximum-group' ).empty();
		$( '#specific-log > table > thead > tr > td.your-group' ).empty();
		$( '#specific-log > table > thead > tr > td.rank' ).empty();
		$( '#specific-log > table > thead > tr > td.platform' ).empty();
		$( '#specific-log > table > thead > tr > td.region' ).empty();
		$( '#specific-log > table > thead > tr > td.start' ).empty();
		$( '#specific-log > table > thead > tr > td.end' ).empty();
		$( '#specific-log > table > thead > tr > td.is-actv' ).empty();
		$( '#specific-log > table > thead > tr > td.is-success' ).empty();
		$( '#specific-log > table > thead > tr > td.players' ).empty();
		var timezoneOffset = new Date().getTimezoneOffset()*60*1000; //60*60*1000

	    json.userLog.start = Date.parse(json.userLog.start) - timezoneOffset;
	    json.userLog.start = new Date(json.userLog.start).toISOString();
		$( '#specific-log > table > thead > tr > td.start' ).append(moment(json.userLog.start).format('DD-MM-YYYY, hh:mm a'));

		if (json.userLog.end == null) {
			$( '#specific-log > table > thead > tr > td.end' ).append('-');
		} else {
			json.userLog.end = Date.parse(json.userLog.end) - timezoneOffset;
		    json.userLog.end = new Date(json.userLog.end).toISOString();
			$( '#specific-log > table > thead > tr > td.end' ).append(moment(json.userLog.end).format('DD-MM-YYYY, hh:mm a'));
		}

		$( '#specific-log > table > thead > tr > td.game' ).append(json.userLog.game);
		$( '#specific-log > table > thead > tr > td.mode' ).append(json.userLog.modeName);
		$( '#specific-log > table > thead > tr > td.maximum-group' ).append(json.userLog.modePlayers);
		$( '#specific-log > table > thead > tr > td.your-group' ).append(json.userLog.qd_players);
		$( '#specific-log > table > thead > tr > td.rank' ).append(json.userLog.rank_s);
		$( '#specific-log > table > thead > tr > td.platform' ).append(json.userLog.platform);
		$( '#specific-log > table > thead > tr > td.region' ).append(json.userLog.region);

		if (json.userLog.active) {
			$( '#specific-log > table > thead > tr > td.is-actv' ).append('Yes');
		} else {
			$( '#specific-log > table > thead > tr > td.is-actv' ).append('No');
		}
		if (json.userLog.success == null) {
			$( '#specific-log > table > thead > tr > td.is-success' ).append('-');
		} else {
			if (json.userLog.success) {
				$( '#specific-log > table > thead > tr > td.is-success' ).append('Yes');
			} else {
				$( '#specific-log > table > thead > tr > td.is-success' ).append('No');
			}
		}
		if (json.oneMatch == null) {
			$( '#specific-log > table > thead > tr > td.players' ).append('-');
		} else {
			for (var i = 0; i < json.oneMatch.users.length; i++) {
				var j=i+1;
				$( '#specific-log > table > thead > tr > td.players' ).append('<a href=\"/profile\/'+json.oneMatch.users[i]+'\">Leader'+ j +'<\/a> ');
			}
		}
		RefreshSomeEventListener();
	}
	});
}

function RefreshSomeEventListener() {
    $('.game-logo.add').off();
    $('button.info').off();
    $('button.terminate').off();
    $('button.renew').off();
    $('.game-logo.add').on('click', function(){
		$('.add-games').toggle('display');
		$(this).toggleClass('active');
	});

	$('button.info').on('click', function() {
		generateSpecificLog($(this).parents('tr').attr('id'));
	});

	$('button.terminate').on('click', function() {
		var logId = $(this).parents('tr').attr('id');
		$.ajax({
		type: 'POST',
		data: {logId: $(this).parents('tr').attr('id') },
		url: '/cancel-ad/',
		success:  function(json) {
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
				sessionStorage.setItem('yourGroup', json.userLog.qd_players);
		        sessionStorage.setItem('gameName',json.userLog.game.replace(/\s/g, ''));
		        sessionStorage.setItem('modePlayers',json.userLog.modePlayers);
		        sessionStorage.setItem('modeName',json.userLog.modeName);
		        sessionStorage.setItem('rank',json.userLog.rank_s.replace(/\s/g, ''));
		        sessionStorage.setItem('platform',json.userLog.platform);
		        sessionStorage.setItem('region',json.userLog.region);
		        window.location.href='/';
		    }
		}
		});
	});

}