'use strict';

var assert = require('assert');
var watson = require('../lib/index');
var nock   = require('nock');

describe('personality_insights', function() {

  var noop = function() {};

  var service_request = {
    text: 'IBM Watson Developer Cloud'
  };

  var payload = {
    contentItems: [{
      userid: 'dummy',
      id: 'dummyUuid',
      sourceid: 'freetext',
      contenttype: 'text/plain',
      language: 'en',
      content: service_request.text
    }]
  };
  var service_response = {
    tree: {}
  };

  var service_path = '/v2/profile';

  var service = {
    username: 'batman',
    password: 'bruce-wayne',
    url: 'http://ibm.com:80',
    version: 'v2'
  };

  before(function() {
    nock.disableNetConnect();
    nock(service.url)
      .persist()
      .post(service_path, payload)
      .reply(200, service_response)
      .post(service_path, '"'+ service_request.text + '"')
      .reply(200, service_response);
  });

  after(function() {
    nock.cleanAll();
  });

  var personality_insights = watson.personality_insights(service);

  var missingParameter = function(err) {
    assert.ok((err instanceof Error) && /required parameters/.test(err));
  };

  it('should check no parameters provided', function() {
    personality_insights.profile({}, missingParameter);
    personality_insights.profile(null, missingParameter);
    personality_insights.profile(undefined, missingParameter);
  });

  it('should generate a valid payload with text', function() {
      var req = personality_insights.profile(service_request, noop);
      var body = new Buffer(req.body).toString('ascii');
      assert.equal(req.uri.href, service.url + service_path);
      assert.equal(body, '"' + service_request.text + '"');
      assert.equal(req.method, 'POST');
      assert.equal(req.headers['Content-type'], 'text/plain');
  });

  it('should generate a valid payload with contentItems', function() {
      var req = personality_insights.profile(payload, noop);
      var body = new Buffer(req.body).toString('ascii');
      assert.equal(req.uri.href, service.url + service_path);
      assert.equal(body, JSON.stringify(payload));
      assert.equal(req.method, 'POST');
      assert.equal(req.headers['Content-type'], 'application/json');
  });

  it('should format the response', function(done) {
    personality_insights.profile(service_request, function(err, response) {
      if (err)
        done(err);
      else {
        assert.equal(JSON.stringify(response), JSON.stringify(service_response));
        done();
      }
    });
  });

});