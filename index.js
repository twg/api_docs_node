var fs     = require('fs');
var fsSync = require('fs-sync');
var mkdirp = require('mkdirp');
var jade   = require('jade');

var filePath = 'docs/api/';
var fileName = filePath + 'apiDocs.json';


function cleanup() {
  fs.exists(fileName, function(exists) {
    if (exists) fs.unlinkSync(fileName);
  })
  mkdirp(filePath, function(err) {
    fs.writeFile(fileName, '{}');
  });
}

function add(res, options) {
  var url = res.req.path.split('?')[0];
  var data = {};

  if(!options) options = {};

  mkdirp(filePath, function(err) {
    fs.exists(fileName, function(exists) {
      // Load existing api docs
      if(exists) {
        data = JSON.parse(fs.readFileSync(fileName, "utf8"));
      }

      // Create a new key for this resource if it doesn't exist already
      if (options.resource == undefined) options.resource = 'Unnamed Resource';
      if(!data[options.resource]) data[options.resource] = [];

      var resource = _.find(data[options.resource], function(resource) {
        return resource.action == options.action;
      });

      if (!resource) {
        data[options.resource].push({
          action: options.action || 'undefined',
          method: res.req.method,
          description: options.description,
          url: options.url || url,
          requests: []
        });
        resource = _.last(data[options.resource]);
      }

      resource.requests.push({
        status: res.status,
        params: options.params,
        response: JSON.stringify(res.body, null, '  ')
      });

      // Save everything
      fs.writeFile(fileName, JSON.stringify(data, null, '\t'), function(err) {
        if(err) {console.log(err);}
      });

    });
  });
}

function render() {
  data = JSON.parse(fs.readFileSync(fileName));
  var html = jade.renderFile(__dirname + '/views/index.jade', {pretty: true, data: data});
  fs.writeFileSync(filePath + 'index.html', html);
  fsSync.copy(__dirname + '/assets', filePath + '/assets', {force: true});
}

module.exports = {
  add: add
}

cleanup();

process.on('exit', function (exitcode) {
  if (exitcode === 0) {
    console.log('\uD83D\uDCDA  Writing API documentation to ' + filePath);
    render();
  } else {
    console.log("Not writing API documentation due to nonzero exit code " + exitcode + ".");
  }
});
