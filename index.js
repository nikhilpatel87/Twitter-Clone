const express = require('express');
const cors = require('cors');
const monk = require('monk');
const Filter = require('bad-words'); //package to filter bad words and place asterisks instead
const app = express();
const rateLimit = require('express-rate-limit');

const db = monk(process.env.MONGO_URI || 'localhost/twitterclone');
const tweets = db.get('tweets');
const filter = new Filter();

app.use(cors());
app.use(express.json());


app.get('/', (req, res) => {
	res.json({
		message: "Tweeeeeet!"
	});
});

app.get('/tweets', (req, res) => {
	tweets
	.find()
	.then(tweets => {
		res.json(tweets);
	});
});

function isValidTweet(tweet) {
	return tweet.name && tweet.name.toString().trim() !== '' &&
	tweet.content && tweet.content.toString().trim() !== '';
}

app.use(rateLimit({ 
	windowMs: 30 * 1000, // 30 seconds
	max: 1 // 1 request per 30 secs
}));

app.post('/tweets', (req, res) => {
	if(isValidTweet(req.body)) {
		const tweet = {
			name: filter.clean(req.body.name.toString()),
			content: filter.clean(req.body.content.toString()),
			created: new Date(),
		};
		tweets
			.insert(tweet)
			.then(createTweet => {
				res.json(createdTweet);
			});
	} else {
		res.status(422);
		res.json({
			message: 'Hey! Name and Content are required!'
		});
	}
});

app.listen(5000, () =>{
	console.log('Listening on port 5000');
});