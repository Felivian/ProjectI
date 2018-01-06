$(document).ready(function() {
    socket = io.connect('http://localhost:8080');
    socket.on('new', function (data) {
        var valid = true;
        //console.log(data);

        var gameName = $( 'select.game' ).val();
        if(gameName) gameName = gameName.replace(/([A-Z])/g, ' $1').trim();
        var modeName = $( 'select.modeName' ).val();
        var modePlayers = $( 'select.modePlayers' ).val();
        var qd_players = $( 'select.yourGroup' ).val();
        var rank_s = $( 'select.rank' ).val();
        var platform = $( 'select.platform' ).val();
        var region = $( 'select.region' ).val();
        //console.log(modePlayers);
        //console.log(data.modePlayers != modePlayers && modePlayers !== null);
        if (data.game != gameName && gameName !== null) valid = false;
        if (data.modeName != modeName && modeName !== null) valid = false;
        if (data.modePlayers != modePlayers && modePlayers !== null) valid = false;
        if (data.rank_s != rank_s && rank_s !== null) valid = false;
        if (data.platform != platform && platform !== null) valid = false;
        if (data.region != region && region !== null) valid = false;
        if (modePlayers !== null && qd_players !== null) {
            if (data.qd_players >= parseInt(modePlayers) - parseInt(qd_players)) valid = false;
        }
        //if (data.qd_players > (modePlayers - qd_players)) valid = false;
        if(valid) {
            prependUserAd(data);
            $('button.new-ads').show();
            console.log(data);
        }
    });
    socket.on('delete', function (data) {
        for (var i = 0; i < data.length; i++) {
            $('#'+data[i]).remove();
            console.log(data[i]);
        }
    });
});

$(document).ready(function() {
    
    $('button.new-ads').click(function() {
        $('button.new-ads').hide();
        $('div.user-ad-outer').toggleClass('hidden', false);
    });
});

$(document).ready(function() {
    $('select.game').change(function() {
        var gameName = $( 'select.game' ).val();
        //gameName = gameName.replace(/([A-Z])/g, ' $1').trim();
        socket.emit('room', gameName);
    });
});        


$(document).ready(function() {
    generateUserAds(true);
    

	$('select.game').change(function() {
		var gameName = $( 'select.game' ).val();
		var modeName = $( 'select.modeName' ).val();
		gameName = gameName.replace(/([A-Z])/g, ' $1').trim();
		$('select').toggleClass('hidden',false);
		$.ajax({
        type: 'POST',
        url: '/game',
        data: {gameName: gameName},
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
            generateUserAds(true);
        }
        });

	});

	$('select.modeName').change(function() {
		var gameName = $( 'select.game' ).val();
		var modeName = $( 'select.modeName' ).val();
		gameName = gameName.replace(/([A-Z])/g, ' $1').trim();
    	$.ajax({
        type: 'POST',
        url: '/queue',
        data: {gameName: gameName, modeName: modeName},
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

    $('select').not('.game').change(function() {
        generateUserAds(true);
    });

});

$(document).ready(function() {
    var win = $(window);
    var nearToBottom = 200;
    //var nearToBottom = 0;
    // Each time the user scrolls
    win.scroll(function() {
        // End of the document reached?
        //if ($(document).height() - win.height() == win.scrollTop()) {
        if ($(window).scrollTop() + $(window).height() + nearToBottom >= $('.content-area').offset().top + $('.content-area').height() ) { 
            if(!$('button.no-ads').is(':visible'))
            //if($('.no-ads:visible').length == 0)
            {
                generateUserAds(false); 
            }
        }
    });
});

$(document).ready(function() {
    //$('.no-ads').hide();
    $('.no-ads').click(function() { 
        generateUserAds(false); 
    });
});



function generateUserAds(init) {
    $('#loading').show();
    $('button.no-ads').hide();
    var data = {};
    
    var gameName = $( 'select.game' ).val();
    if(gameName) gameName = gameName.replace(/([A-Z])/g, ' $1').trim();
    var modeName = $( 'select.modeName' ).val();
    var modePlayers = $( 'select.modePlayers' ).val();
    var qd_players = $( 'select.yourGroup' ).val();
    var rank_s = $( 'select.rank' ).val();
    var platform = $( 'select.platform' ).val();
    var region = $( 'select.region' ).val();

    var offset = 0;
    if(!init) offset = $('div.user-ad-outer').length;

    var limit = 24 - (offset % 24);//migth need some more love
    //if (limit < 24) limit += 12;

    if(qd_players) qd_players = parseInt(qd_players);
    if(modePlayers) data.modePlayers = parseInt(modePlayers) ;
    if(gameName) data.game = gameName;
    if(modeName) data.modeName = modeName;
    
    if(rank_s) data.rank_s = rank_s;
    if(platform) data.platform = platform;
    if(region) data.region = region;
    $.ajax({
    type: 'POST',
    data: {data: data, limit: limit, offset: offset, qd_players: qd_players},
    url: '/logs',
    success:  function(json) {
        console.log(json.log);
        console.log(json);
        if(json.result) {
            //if(init) $('div.content-area').empty();
            for (var i = 0; i < json.log.length; i++) {
                appendUserAd(json.log[i]);
                
            }
            $('#loading').hide();
            RefreshSomeEventListener();
        } else {
            if(init) $('div.content-area').empty();
            $('#loading').hide();
            $('button.no-ads').show();
            //if(init) NO ads
            //if(!init) no MORE ads
        }
    }
    });
}

function appendUserAd(ad) {
    $('div.content-area').append(
        '<div id=\"'+ad._id+'\"class=\"user-ad-outer col-md-3 col-sm-4 col-xs-12 \">'+
            '<div class="user-ad-inner panel panel-primary col-md-12 text-center\">'+
                '<a class="nick panel-heading\" href=\"/profile/'+ad.user_id+'\">'+ad.user_name+'</a>'+
                '<div class=\"user-info\">'+
                    '<img src=\"/img/'+ad.game+'.png\" alt=\"'+ad.game+'\" class=\"img-circle game-logo\"><br>'+
                    '<div class=\"user-data panel-body\">'+
                        '<table width=\"100%\" class=\" table-striped\"><tbody>'+
                            '<tr><td>Mode</td> <td class=\"text-center\"><kbd>'+ad.modeName+'</kbd></td></tr>'+
                            '<tr><td>Maximum group</td> <td class=\"text-center\"><kbd>'+ad.modePlayers+'</kbd></td></tr>'+
                            '<tr><td>Rank</td> <td class=\"text-center\"><kbd>'+ad.rank_s+'</kbd></td></tr>'+
                            '<tr><td>Size of group</td> <td class=\"text-center\"><kbd>'+ad.qd_players+'</kbd></td></tr>'+
                            '<tr><td>Platform</td> <td class=\"text-center\"><kbd>'+ad.platform+'</kbd></td></tr>'+
                            '<tr><td>Region</td> <td class=\"text-center\"><kbd>'+ad.region+'</kbd></td></tr>'+
                        '</tbody></table>'+
                    '</div>'+
                '</div>'+
            '</div>'+
            '<div class="add-ad">'+
                '<button class="add">+</button>'+
            '</div>'+
        '</div>'
    );
}

function prependUserAd(ad) {
    $('div.content-area').prepend(
        '<div id=\"'+ad._id+'\"class=\"user-ad-outer col-md-3 col-sm-4 col-xs-12 \">'+
            '<div class="user-ad-inner panel panel-primary col-md-12 text-center\">'+
                '<a class="nick panel-heading\" href=\"/profile/'+ad.user_id+'\">'+ad.user_name+'</a>'+
                '<div class=\"user-info\">'+
                    '<img src=\"/img/'+ad.game+'.png\" alt=\"'+ad.game+'\" class=\"img-circle game-logo\"><br>'+
                    '<div class=\"user-data panel-body\">'+
                        '<table width=\"100%\" class=\" table-striped\"><tbody>'+
                            '<tr><td>Mode</td> <td class=\"text-center\"><kbd>'+ad.modeName+'</kbd></td></tr>'+
                            '<tr><td>Maximum group</td> <td class=\"text-center\"><kbd>'+ad.modePlayers+'</kbd></td></tr>'+
                            '<tr><td>Rank</td> <td class=\"text-center\"><kbd>'+ad.rank_s+'</kbd></td></tr>'+
                            '<tr><td>Size of group</td> <td class=\"text-center\"><kbd>'+ad.qd_players+'</kbd></td></tr>'+
                            '<tr><td>Platform</td> <td class=\"text-center\"><kbd>'+ad.platform+'</kbd></td></tr>'+
                            '<tr><td>Region</td> <td class=\"text-center\"><kbd>'+ad.region+'</kbd></td></tr>'+
                        '</tbody></table>'+
                    '</div>'+
                '</div>'+
            '</div>'+
            '<div class="add-ad">'+
                '<button class="add">+</button>'+
            '</div>'+
        '</div>'
    );
}


function sortNumber(a,b) {
    return a - b;
}

$(document).ready(function() {
    RefreshSomeEventListener();
    $('button.add').click(function(){
        console.log('asd');
    });
    /*$('.content-area').mouseleave(function(){
        $('div.user-ad-inner').toggleClass('focused',false);
        $('button.add').hide();
    });*/
    
});

function RefreshSomeEventListener() {
// Remove handler from existing elements
    //$('div.user-ad-inner').off(); 
    $('button.add').off();

    // Re-add event handler for all matching elements
    /*$('div.user-ad-inner').on('mouseover', function() {
        $(this).toggleClass('focused',true);
        //$(this).children('div').children('table').toggleClass('table-striped',false);
        $('div.user-ad-inner').not(this).toggleClass('focused',false);
        //$('div.user-ad-inner').not(this).children('div').children('table').toggleClass('table-striped',true);
        $('div.add-ad').hide();
        $(this).siblings('div.add-ad').show();  
    });
    $('.nick').on('mouseover', function() {
        $('div.user-ad-inner').toggleClass('focused',false);
    });*/
    /*$('div.user-ad-inner').on('mouseover', function() {
        $(this).find('.add-ad').css({ opacity: 1 });
    });*/
    $('button.add').on('click', function(){
        var x =[];
        $(this).parent().siblings('div.user-ad-inner').find('kbd').each(function(index, obj)
        {
          x.push($(this).text());
        });

        console.log(x);
       // $('select.game').val(x[0]).change();

        //$('select.game').val().change();
        //alert("Hello! I am an alert box!");
    });
}