module.exports = {
	account : {
		text: 'Do you have an account?',
		quickReplies: ['Yes', 'No']
	}


	/*const askName = (convo) => {
		convo.ask('Do you have an account?', (payload, convo) => {
			const text = payload.message.text;
			convo.set('name', text);
			convo.say(`Oh, your name is ${text}`).then(() => askFavoriteFood(convo));
		});
	};*/
};