$(document).ready(function() {
	$('.connect-local').click(function() {
		$('div.form').show();
	});
	$('div.displayName > div > button').click(function() {

        var displayName = $('input[name=displayName]').val();
        console.log(displayName);
        $.ajax({
        type: 'POST',
        data: {displayName: displayName},
        url: '/changename',
        success:  function(json) {
            generateAlert('alert-info','Name was changed');
            $('li.dropdown > a > b ').text(displayName);
            console.log($('li.dropdown > a > b'));
            console.log($('li.dropdown > a > b').text()[$('li.dropdown > a >b ').text().length-1]);
        },
        statusCode: {
            500: function() {
                generateAlert('alert-danger','Unexpected error occurred.');
            },
            406: function() {
                generateAlert('alert-danger','Name to short.');
            }
        }

        });
    });
});

function generateAlert(alertType, message) {
    $('.alert').remove();
    $('.container-fluid').prepend('<div class=\"alert '+alertType+' col-md-6 col-md-offset-3 text-center\">'+message+
        '<span class="close glyphicon glyphicon-remove"></span></div>');
    $('span.close').off();
    $('span.close').on('click', function(){
        $(this).parent().remove();
    });
}