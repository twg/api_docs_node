var fs     = require('fs');
var mkdirp = require('mkdirp');
var jade   = require('jade');

var filePath = 'docs/api/';
var fileName = filePath + 'apiDocs.json';


module.exports = {

  cleanup: function() {
    fs.exists(fileName, function(exists) {
      if (exists) fs.unlinkSync(fileName);
    })
  },

  add: function(res, options) {
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
            url: url,
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
          if(err) {
            console.log(err);
          } else {
            console.log("JSON saved to " + fileName);
          }
        });

      });
    });
  },

  render: function(next) {
    data = JSON.parse(fs.readFileSync(fileName));

    var html = jade.renderFile(__dirname + '/templates/index.jade', {pretty: true, data: data});
    fs.writeFile(filePath + 'index.html', html, function (err) {
      if (err) return console.log(err);
      next();
    });
  },

};
