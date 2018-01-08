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
        //sessionStorage.setItem('gameName', $( 'select.game' ).val());
        //sessionStorage.removeItem('modeName');

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
            	$('select.rank').append( '<option value='+json.rank[i].replace(/\s/g, '')+'>'+json.rank[i]+'</option>');
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
            if (sessionStorage.getItem('modeName') != null ) $('select.modeName').val(sessionStorage.getItem('modeName'));
            if (sessionStorage.getItem('modePlayers') != null ) $('select.modePlayers').val(sessionStorage.getItem('modePlayers'));
            if (sessionStorage.getItem('rank') != null ) $('select.rank').val(sessionStorage.getItem('rank'));
            if (sessionStorage.getItem('platform') != null ) $('select.platform').val(sessionStorage.getItem('platform'));
            if (sessionStorage.getItem('region') != null ) $('select.region').val(sessionStorage.getItem('region'));
            if (sessionStorage.getItem('yourGroup') != null ) {
                $('select.yourGroup').val(sessionStorage.getItem('yourGroup'));
            } else {
                $('select.yourGroup').val(1);
            }
            generateUserAds(true);
            //change selects here
        }
        });

	});

	$('select.modeName').change(function() {
        //sessionStorage.setItem('modeName', $( 'select.modeName' ).val());

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
            } else {
                //$('select.yourGroup').val(1);
            }
        }
	});

    $('select').not('.game').change(function() {
        generateUserAds(true);
    });

    $('select.yourGroup').change(function() {
        sessionStorage.setItem('yourGroup',$('select.yourGroup').val());
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
    $('button.picked').click(function() { 

        $('div.pick').toggle('display');
        $('.pick-data').show();
        //$(this).hide();
    });

    /*$('.pick').scroll(function(event){
        var st = $(this).scrollTop();
        if (st > 0){
            $('.pick-data').hide();
        }

    });*/
    $('.pick').bind('mousewheel touchmove', function(event) {
        if (event.originalEvent.wheelDelta >= 0) {
            //$('.pick-data').toggle('show');
            $('.pick-data').show('slow');
        } else {
            $('.pick-data').hide('slow');
            //$('.pick-data').toggle('hide');
        }
    });
    /*$('.pick').bind('scroll', function(event) {
        if (event.originalEvent.wheelDelta >= 0) {
            $('.pick-data').show();
        } else {
            $('.pick-data').hide();
        }
    });
    $('.pick').bind('touchmove', function(event) {
        if (event.originalEvent.wheelDelta >= 0) {
            $('.pick-data').show();
        } else {
            $('.pick-data').hide();
        }
    });*/

    $('.pick').bind('mousewheel touchmove DOMMouseScroll', function(e) {
        var scrollTo = null;

        if (e.type == 'mousewheel') {
            scrollTo = (e.originalEvent.wheelDelta * -1);
        }
        else if (e.type == 'DOMMouseScroll') {
            scrollTo = 40 * e.originalEvent.detail;
        }

        if (scrollTo) {
            e.preventDefault();
            $(this).scrollTop(scrollTo + $(this).scrollTop());
        }
    });
});


function generateUserPick(id,nick,group) {
    $('.picked-users').append('<div class=\"col-sm-12 picked-user\">'+
                    '<div class=\"col-sm-5\"><a href=\"/profile/'+id+'\">'+nick+'</a></div>'+
                    '<div class=\"col-sm-5\">Group: '+group+'</div>'+
                    '<button class=\"col-sm-1\">X</button>'+
                '</div>');
}

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
            if(init) $('div.content-area').empty();
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
    updatePicks(true);

    /*$('.content-area').mouseleave(function(){
        $('div.user-ad-inner').toggleClass('focused',false);
        $('button.add').hide();
    });*/
    
});

function RefreshSomeEventListener() {
    $('button.add').off();
    $('button.add').on('click', function(){
        var selVal =[];
        $(this).parent().siblings('div.user-ad-inner').find('kbd').each(function(index, obj)
        {
            selVal.push($(this).text());
        });
        selVal[2] = selVal[2].replace(/\s/g, '');
        var gameName = $(this).parent().siblings('div.user-ad-inner').find('img').attr('alt')
        gameName = gameName.replace(/\s/g, '');

        /*if(gameName != $('select.game').val()) {
            $('select.game').val(gameName).change();
            console.log(selVal[0]);
        }*/

        var nick = $('#'+id).children().find('a.nick').text();
        var actualGroup = selVal[3];

        var valid = true;
        
        var group = JSON.parse(sessionStorage.getItem('group'));
        if(group === null) {
            group = 0;
            if($('select.yourGroup').val() !== null) group = $('select.yourGroup').val();
        }
        var id = JSON.parse(sessionStorage.getItem('id'));
        if(id == null) id = [];
        
        if ( id.includes($(this).parents('.user-ad-outer').attr('id'))) valid = false;
        if (sessionStorage.getItem('gameName') != null && sessionStorage.getItem('gameName') != gameName) valid = false;
        if (sessionStorage.getItem('modeName') != null && sessionStorage.getItem('modeName') != selVal[0]) valid = false;
        if (sessionStorage.getItem('modePlayers') != null && sessionStorage.getItem('modePlayers') != selVal[1]) valid = false;
        if (sessionStorage.getItem('rank') != null && sessionStorage.getItem('rank') != selVal[2]) valid = false;
        if (sessionStorage.getItem('platform') != null && sessionStorage.getItem('platform') != selVal[4]) valid = false;
        if (sessionStorage.getItem('region') != null && sessionStorage.getItem('region') != selVal[5]) valid = false;
        
        console.log(valid);
        if (valid) {
            id.push($(this).parents('.user-ad-outer').attr('id'));
            sessionStorage.setItem('id', JSON.stringify(id));
            group = parseInt(group) + parseInt(actualGroup);
            sessionStorage.setItem('group', JSON.stringify(group));
            
            sessionStorage.setItem('gameName',gameName);
            sessionStorage.setItem('modeName',selVal[0]);
            sessionStorage.setItem('modePlayers',selVal[1]);
            sessionStorage.setItem('rank',selVal[2]);
            sessionStorage.setItem('platform',selVal[4]);
            sessionStorage.setItem('region',selVal[5]);
            
            updatePicks(false);
            generateUserPick(id,nick,actualGroup);
                //$('select.modeName').val(selVal[0]).change();
        }

    });
}

function updatePicks(init) {
    $('th.gameName').text(sessionStorage.getItem('gameName'));
    $('th.modeName').text(sessionStorage.getItem('modeName'));
    $('th.modePlayers').text(sessionStorage.getItem('modePlayers'));
    $('th.rank').text(sessionStorage.getItem('rank').replace(/([A-Z])/g, ' $1').trim());
    $('th.platform').text(sessionStorage.getItem('platform'));
    $('th.region').text(sessionStorage.getItem('region'));

    var yourGroup = sessionStorage.getItem('yourGroup');
    if (yourGroup == null) {
        $('select.yourGroup').val(1);
        yourGroup = 1;
    } else {
        yourGroup = parseInt(yourGroup);
    }
    sessionStorage.setItem('yourGroup',yourGroup);
    var group = JSON.parse(sessionStorage.getItem('group'));
    var temp_group = group+yourGroup;
    $('span.group').text(temp_group+'/'+parseInt(sessionStorage.getItem('modePlayers')));
    if(sessionStorage.getItem('gameName') != $('select.game').val()) {
        $('select.game').val(sessionStorage.getItem('gameName')).change();
    }
    if(init) recreatePicks();
    
}

function recreatePicks() {
    //get id from session ajax to DB
}