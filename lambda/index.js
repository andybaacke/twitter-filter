const tweetToHtml = require('tweet-to-html');
const Twitter = require('twitter');
const twitterClient = new Twitter({
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
});

exports.handler = (event, context, callback) => {
  const numberOfResults = 45;
  // TODO build URL q param with query string params -> ${event.queryStringParameters['HASH_PARAMETER']}
  const searchUrl = `search/tweets.json?q=from%3ANM_NEWS%20OR%20NM_MKE&count=${numberOfResults}`;

  twitterClient.get(searchUrl, function(error, tweets, response) {
    if (error) throw error;

    console.log(`Success calling ${searchUrl}`, response);
    if (tweets.statuses) {
      callback(null, createResponse(context, tweetToHtml.parse(tweets.statuses)));
    } else {
      callback(null, createResponse(context, []));
    }
  });
};

function createResponse(context, body) {
  // TODO enable gzip compression on response
  const gatewayCacheTTL = 180;

  for (let tweet of body) { // simplify date strings for IE pipe error (remove offset)
    tweet.created_at = tweet.created_at.replace(/\ \+\d{4}\ /, ' ');
  }

  context.succeed({
    'statusCode': 200,
    headers: {
      'Access-Control-Allow-Origin' : '*',
      'Cache-Control': `max-age=${gatewayCacheTTL}`
    },
    'body': JSON.stringify(body)
  });
}
