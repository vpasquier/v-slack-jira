const proxyquire = require("proxyquire");
const config = require("./config-test.json");
const timeout = 3000;

describe("Lambda Slack Jira", function () {
  let lambda, context;

  beforeAll(function () {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
  });

  beforeEach(function (done) {
    lambda = proxyquire("../index", {});
    context = jasmine.createSpyObj("context", ["done", "succeed", "fail"]);
    let evnt = {
      token: "fail"
    };
    lambda.handler(evnt, context);
    setTimeout(function () {
      done();
    }, timeout);
  });
  it("should return a token check failure", function (done) {
    expect(context.fail).toHaveBeenCalled();
    expect(context.succeed).not.toHaveBeenCalled();
    done();
  });
});

describe("Lambda Slack Jira", function () {
  let lambda, context;
  let evnt = {
    token: config.token,
    result: ""
  };

  beforeAll(function () {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
  });

  beforeEach(function (done) {
    lambda = proxyquire("../index", {});
    context = jasmine.createSpyObj("context", ["done", "succeed", "fail"]);
    evnt.channel_id = "C03TPDMGS";
    lambda.handler(evnt, context);
    setTimeout(function () {
      done();
    }, timeout);
  });
  it("should succeed", function (done) {
    expect(context.succeed).toHaveBeenCalled();
    expect(context.fail).not.toHaveBeenCalled();
    expect(evnt.result[0].title).toEqual("https://jira.nuxeo.com/browse/NXP-22963");
    done();
  });
});

describe("Lambda Slack Jira Matcher", function () {
  beforeEach(function () {
    lambda = proxyquire("../index", {});
  });

  it("should succeed", function () {
    let text = "Bonjour, et oui, NXP-666 parce que pourquoi NXP-666 bah ouai, SUPNXP-323";
    let jiraList = [];
    let matches = text.match(/(?:\s|^)([A-Z]+-[0-9]+)(?=\s|$)/g);
    if (matches) {
      matches.forEach(function (ticket) {
        ticket = ticket.replace(/\s/g, '');
        jiraList.push(config.jiraUrl + ticket);
      });
    }
    expect(jiraList[2]).toEqual(
      "https://jira.nuxeo.com/browse/SUPNXP-323"
    );
  });
});
