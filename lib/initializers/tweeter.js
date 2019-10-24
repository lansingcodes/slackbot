// Description:
//   Send tweets from your Twitter bot.
//
// Dependencies:
//   "twitter-node-client"
//
// Configuration:
//   TWITTER_CONSUMER_KEY        - Consumer key which identifies your Twitter
//                                 bot app.
//   TWITTER_CONSUMER_SECRET     - Secret for your consumer key.
//   TWITTER_ACCESS_TOKEN        - OAuth access token granted by Twitter.
//   TWITTER_ACCESS_TOKEN_SECRET - Secret for your access token.
//
// Commands:
//   hubot tweet <message> - Send the message as a tweet from the bot on
//                           Twitter. Approved users only.
//
// Notes:
//   The list of users approved to send tweets is hard-coded in this script.
//
// Author:
//   chrisvfritz
const tweet = require('../helpers/tweet');
const getDeniedGif = require('../helpers/get-denied-gif');

const approvedTweeters = [
    'chrisvfritz',
    'davin',
    'leo',
    'erik.gillespie',
    'katiemfritz',
];
const denialStr = (deniedGifUrl) => `No tweet for you!
${deniedGifUrl}
Only the following users have access: ${approvedTweeters.join(', ')}`;

module.exports = (robot) => {
    robot.respond(/tweet (.+)/i, (response) => {
        const userName = response.envelope.user.name;
        if (approvedTweeters.includes(userName)) {
            tweet(
                response.match[1],
                (error) => response.send(`Tweet failed. :-( Error: ${error}`),
                () => response.send('Tweet sent!')
            );
        } else {
            response.send(denialStr(getDeniedGif()));
        }
    });
};
