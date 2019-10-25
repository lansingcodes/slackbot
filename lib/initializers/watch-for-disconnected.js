// Description:
//   Reconnect the bot when it gets disconnected from Slack.
//
// Dependencies:
//   "intercept-stdout"
//
// Configuration:
//   SLACKBOT_DISCONNECT_WAIT_TIME - Duration in milliseconds to wait for reconnection before force restarting the client. Hard-coded to 20000
//
// Commands:
//   N/A
//
// Notes:
//   N/A
//
// Author:
//   chrisvfritz
const intercept = require("intercept-stdout");

const waitTime = 20000;
process.env.SLACKBOT_DISCONNECT_WAIT_TIME = waitTime;

module.exports = robot => {
  let timer = null;

  intercept(text => {
    if (text.includes("Slack client closed, waiting for reconnect")) {
      timer = setTimeout(() => {
        throw new Error("Force restarting due to disconnect");
      }, waitTime);
    }

    if (text.includes("Slack client now connected")) {
      clearTimeout(timer);
    }
  });
};
