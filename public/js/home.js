$(document).ready(function() {
    generateUserAds();
    

	$('select.game').change(function() {
		var gameName = $( 'select.game' ).val();
		var modeName = $( 'select.modeName' ).val();
		gameName = gameName.replace(/([A-Z])/g, ' $1').trim();
		$('select').toggleClass('hidden',false);
		$.ajax({
        type: 'GET',
        url: '/game/'+gameName,
        success:  function(json) { 
            $('select.modeName').empty();
            $('select.modeName').append( '<option value="" disabled selected hidden>Mode name</option>');
            for (var i = 0; i < json.modeName.length; i++) {
            	$('select.modeName').append( '<option value='+json.modeName[i]+'>'+json.modeName[i]+'</option>');
            }
            $('select.modePlayers').empty();
            $('select.modePlayers').append( '<option value="" disabled selected hidden>Mode players</option>');
            for (var i = 0; i < json.modePlayers.length; i++) {
            	$('select.modePlayers').append( '<option value='+json.modePlayers[i]+'>'+json.modePlayers[i]+'</option>');
            }
            $('select.yourGroup').empty();
            $('select.yourGroup').append( '<option value="" disabled selected hidden>Your group size</option>');
            for (var i = json.modePlayers.sort(sortNumber).reverse()[0]-1; i >0 ; i--) {
            	$('select.yourGroup').append( '<option value='+i+'>'+i+'</option>');
            }
            $('select.rank').empty();
            $('select.rank').append( '<option value="" disabled selected hidden>Rank</option>');
            for (var i = 0; i < json.rank.length; i++) {
            	$('select.rank').append( '<option value='+json.rank[i]+'>'+json.rank[i]+'</option>');
            }
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
            generateUserAds();
        }
        });
	});

	$('select.modeName').change(function() {
		var gameName = $( 'select.game' ).val();
		var modeName = $( 'select.modeName' ).val();
		gameName = gameName.replace(/([A-Z])/g, ' $1').trim();
    	$.ajax({
        type: 'GET',
        url: '/queue/gamename/'+gameName+'/modename/'+modeName,
        success:  function(json) {
        	json.modePlayers = json.modePlayers.sort(sortNumber);
        	console.log(json.modePlayers);
        	$('select.modePlayers').empty();
            $('select.modePlayers').append( '<option value="" disabled selected hidden>Mode players</option>');

            for (var i = 0; i < json.modePlayers.length; i++) {
            	$('select.modePlayers').append( '<option value='+json.modePlayers[i]+'>'+json.modePlayers[i]+'</option>');
            }
            $('select.yourGroup').empty();
            $('select.yourGroup').append( '<option value="" disabled selected hidden>Your group size</option>');
			var maxPlayers = json.modePlayers.sort(sortNumber).reverse()[0];
            for (var i = 1; i < maxPlayers; i++) {
            	$('select.yourGroup').append( '<option value='+i+'>'+i+'</option>');
            }

        }});
    });



	$('select.modePlayers').change(function() {
        var maxPlayers = $('select.modePlayers').val();
        var group = $('select.yourGroup').val();
        console.log(group);
       
            $('select.yourGroup').empty();
            $('select.yourGroup').append( '<option value="" disabled selected hidden>Your group size</option>');

            for (var i = 1; i < maxPlayers; i++) {
            	$('select.yourGroup').append( '<option value='+i+'>'+i+'</option>');
            }
       	if ( group !== null ) {
            if ($('select.yourGroup>option[value='+group+']').length >0) {
            	$('select.yourGroup').val(group);
            }
        }
	});

    $('select').not('select.yourGroup').change(function() {
        generateUserAds();
    });

});


function generateUserAds() {
    var gameName = $( 'select.game' ).val();
    if(gameName) gameName = gameName.replace(/([A-Z])/g, ' $1').trim();
    var modeName = $( 'select.modeName' ).val();
    var modePlayers = $( 'select.modePlayers' ).val();
    var qd_players = $( 'select.yourGroup' ).val();
    var rank_s = $( 'select.rank' ).val();
    var platform = $( 'select.platform' ).val();
    var region = $( 'select.region' ).val();

    $.ajax({
    type: 'GET',
    url: '/logs/'+gameName+'/'+modeName+'/'+modePlayers+'/'+qd_players+'/'+rank_s+'/'+platform+'/'+region+'/24',
    success:  function(json) {
        console.log(json.log);
        $('div.content-area').empty();
        for (var i = 0; i < json.log.length; i++) {

            $('div.content-area').append(
                '<div id=\"'+json.log[i]._id+'\"class=\"user-ad-outer col-md-3 col-sm-4 col-xs-12 \">'+
                '<div class="user-ad-inner panel panel-primary col-md-12 text-center\">'+
                    '<a class="nick panel-heading\" href=\"/profile/'+json.log[i].user_id+'\">'+json.log[i].user_name+'</a>'+
                    '<img src=\"/img/'+json.log[i].game+'.png\" alt=\"'+json.log[i].game+'\" class=\"rounded-circle game-logo\"><br>'+
                    '<div class=\"user-data panel-body\">'+
                        '<table width=\"100%\" class=\"table-striped\"><tbody>'+
                            '<tr><td>Mode</td> <td class=\"text-center\"><kbd>'+json.log[i].modeName+'</kbd></td></tr>'+
                            '<tr><td>Maximum group</td> <td class=\"text-center\"><kbd>'+json.log[i].modePlayers+'</kbd></td></tr>'+
                            '<tr><td>Rank</td> <td class=\"text-center\"><kbd>'+json.log[i].rank_s+'</kbd></td></tr>'+
                            '<tr><td>Size of group</td> <td class=\"text-center\"><kbd>'+json.log[i].qd_players+'</kbd></td></tr>'+
                            '<tr><td>Platform</td> <td class=\"text-center\"><kbd>'+json.log[i].platform+'</kbd></td></tr>'+
                            '<tr><td>Region</td> <td class=\"text-center\"><kbd>'+json.log[i].region+'</kbd></td></tr>'+
                        '</tbody></table>'+
                    '</div>'+
                '</div>'+
            '</div>'
            );
        }
    }});
}

function sortNumber(a,b) {
    return a - b;
}