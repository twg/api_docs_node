# API Docs for Node

Generate documentation for your API by writting tests

## Example


```jasvascript
var assert = require('assert');
var request = require('supertest');
var apidoc = require('api_docs_node');

it('should GET a single user', function (done) {
  supertest.agent(app);
    .get('/api/v1/users/' + user.id)
    .set('Accept', 'application/json')
    .expect('Content-Type', /json/)
    .expect(200, JSON.stringify(user), done);
    .end(function(error, res){
      if (error) {throw error};
      apidoc(res, {
        resource: 'Users',
        action: 'List',
        description: 'Get a list of users ordered by name'
      });
      done();
    });
});

```