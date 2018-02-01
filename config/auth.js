var configExtras = require('./extras');
module.exports = {

    'facebookAuth' : {
        'clientID'      : '1824776361147158', // App ID
        'clientSecret'  : 'fa7a136c2bde652bc07f002e7d992f0b', // App Secret
        'callbackURL'   : configExtras.websiteURL+'/auth/facebook/callback'
    },
	'messengerAuth' : {
		'app_secret'	: 'fa7a136c2bde652bc07f002e7d992f0b',
        'access_token'  : 'EAAZA7n9rMZBxYBACKDQASQFwZCgNE37UqBJjUI4xG6P0ucUYIQ55v2CZCjkccEm9WniZAXZBNbpjYtu8y3gVhmzQLJ3jQMOB5ODRqFJ6H1ZAmlOnyx3EpVs0zVd9rhBfZCs7rj2cubB7AoS2FCmUQnWKGkHvVmahoc2tSPZB8fcCfKlmxnhG7IcvY',
		'verify_token'	: 'Who_Left_Me_Outside'
	},
    'giphyApiKey' : '30lORG6s0LhJAz4EZW09N5ifmvYgnlYN'

};
