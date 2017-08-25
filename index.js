const config = require("./config.json");
const request = require("request");

exports.handler = function (event, context) {
  "use strict";
  console.log("Start Lambda - Payload content:", event);

  if (event.token !== config.token) {
    return context.fail("Unauthorized request. This token is not valid:" + config.token);
  }

  let timeStamp = Math.floor(Date.now());
  request(
    "https://slack.com/api/channels.history?token=" + config.oauthToken + "&channel=" + event.channel_id + "&latest=" + timeStamp,
    function (error, response, body) {
      if (!(error || !response)) {
        if (response && response.statusCode !== 200) {
          return context.fail("Cannot access to Slack team messages - Code:" + response.statusCode + " - " + response);
        }
      } else {
        return context.fail("Cannot access to Slack team - " + error);
      }

      let json = JSON.parse(body);

      if (!json.ok) {
        context.fail("Cannot access to Slack team - " + json.error);
      }

      let jiraList = [];
      json.messages.forEach(function (message) {
        let text = message.text;
        let matches = text.match(/(?:\s|^)([A-Z]+-[0-9]+)(?=\s|$)/g);
        if (matches) {
          matches.forEach(function (ticket) {
            ticket = ticket.replace(/\s/g, '');
            jiraList.push(config.jiraUrl + ticket);
          });
        }
      });
      let responseBody = {};
      if (jiraList.length === 0) {
        responseBody.text = ":jira:\nNo Jira ticket.\n";
      } else {
        responseBody.attachments = [];
        responseBody.attachments[0] = {};
        responseBody.attachments[0].pretext = ":jira: Here are the tickets:\n";
        for (let i in jiraList) {
          if (!responseBody.attachments[i]) {
            responseBody.attachments[i] = {};
          }
          responseBody.attachments[i].title = jiraList[i];
          responseBody.attachments[i].title_link = jiraList[i];
        }
      }
      // For unit tests purpose
      event.result = responseBody.attachments;
      context.succeed(responseBody);
    }
  );
};
