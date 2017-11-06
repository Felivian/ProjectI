module.exports = {
	account : (payload, convo) => {
		convo.set('account_anw',payload.message.text)
		if (payload.message.text == 'No') {
			convo.say('you said no');
		} else {
			convo.say('you said yes');
		}
	},
	account_no : (payload, convo) => {
		const text = payload.message.text;
		convo.say(`Oh, you like ${text}!`);
	}
};