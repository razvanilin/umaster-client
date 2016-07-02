var spawn = require('child_process').spawn;
var exec = require('child_process').exec;
var path = require('path');
var fs = require('fs');
var request = require('request');

module.exports = function(expressApp, route) {

  /*
   *  Route to get the scripts
   */
  expressApp.get('/script', function(req, res) {
    if (!req.query.user) return res.status(400).send("No user found in the query.");

    var options = {
      url: expressApp.settings.host + "/script/?user=" + req.query.user,
      method: "GET",
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    };

    request(options, function(error, resp, body) {
      if (error) return res.status(400).send("Error making the request.");

      var responseString;
      try {
        responseString = JSON.parse(body);
        return res.status(200).send(responseString);
      } catch (e) {
        return res.status(200).send([]);
      }
    });
  });
  // ------------------------------------------------------------------------

  /*
   *  Route to get the scripts found in the scriptsConf.json
   */
  expressApp.get('/script/local', function(req, res) {
    var scriptsConfPath = path.join(__dirname, '..', '..', 'scripts', 'scriptsConfTest.json');
    scriptsConfPath = path.normalize(scriptsConfPath);

    var scriptsConf;

    try {
      scriptsConf = JSON.parse(fs.readFileSync(scriptsConfPath));
      return res.status(200).send(scriptsConf);
    } catch (e) {
      return res.status(400).send("Could not read the scripts configuration file.");
    }
  });
  // ------------------------------------------------------------------------

  /*
   *  Route to request the creation of a new script
   */
  expressApp.post('/script', function(req, res) {
    console.log(req.body);
    if (!req.body.user) return res.status(400).send("No user in the body.");
    if (!req.body.script) return res.status(400).send("No script in the body.");
    if (!req.body.script.name) return res.status(400).send("Script needs a name.");

    var options = {
      url: expressApp.settings.host + "/script",
      method: "POST",
      form: {
        user: req.body.user,
        script: {
          name:req.body.script.name,
          script_file: req.body.script.script_file,
          script_id: req.body.script.script_id,
          description: req.body.script.description,
          args: req.body.script.args
        }
      },
      header: {
        "Accept": "application/json",
        "Content-Type": "application/json"
      }
    };

    request(options, function(error, resp, body) {
      if (error) return res.status(400).send("Error with the request.");

      var responseString;

      try {
        responseString = JSON.parse(body);
        return res.status(200).send(responseString);
      } catch (e) {
        return res.status(400).send(body);
      }
    });
  });
  // ------------------------------------------------------------------------

  /*
   *  Route to request changes to a script
   */
  expressApp.put('/script', function(req, res) {
    if (!req.body.user) return res.status(400).send("No user in the body.");
    if (!req.body.script) return res.status(400).send("No script in the body.");
    if (!req.body.script.name) return res.status(400).send("Script needs a name.");
    if (!req.body.script.script_file) return res.status(400).send("Script needs a file name");

    var options = {
      url: expressApp.settings.host + "/script",
      method: "PUT",
      form: { user: req.body.user,script: req.body.script },
      header: {
        "Accept": "application/json",
        "Content-Type": "application/json"
      }
    };

    request(options, function(error, resp, body) {
      if (error) return res.status(400).send("Error with the request.");

      var responseString;

      try {
        responseString = JSON.parse(body);
        return res.status(200).send(responseString);
      } catch (e) {
        return res.status(400).send(body);
      }
    });
  });
  // ------------------------------------------------------------------------

  /*
  **  Route to update the status of a script
  */
  expressApp.put("/script/status", (req, res) => {
    if (!req.body.user) return res.status(400).send("No user specified.");
    if (!req.body.script._id) return res.status(400).send("No script id specified.");
    if (typeof req.body.script.status === typeof undefined)
      return res.status(400).send("No script status specified");

    var options = {
      url: expressApp.settings.host + "/script/status",
      method: "PUT",
      form: { user: req.body.user, script: req.body.script},
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json"
      }
    };

    // make the request
    request(options, (error, resp, body) => {
      if (error) return res.status(400).send(error);

      try {
        var responseString = JSON.parse(body);
        return res.status(resp.statusCode).send(responseString);
      } catch (e) {
        console.log(e);
        console.log(body);
        return res.status(400).send(body);
      }
    });
  });
  // ------------------------------------------------------------------------

  /*
   *  Route to delete a script
   */
  expressApp.post('/script/:name/remove', function(req, res) {
    if (!req.body.user) return res.status(400).send("No user in the body.");

    var options = {
      url: expressApp.settings.host + '/script/' + req.params.name + '/remove',
      method: "POST",
      form: {user: req.body.user},
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    };

    request(options, function(error, resp, body) {
      if (error) return res.status(400).send("There was an error with the request.");

      var responseString;
      try {
        responseString = JSON.parse(body);
        return res.status(200).send(responseString);
      } catch (e) {
        return res.status(400).send(e);
      }
    });
  });
  // ------------------------------------------------------------------------


  expressApp.post('/script/run/:name', function(req, res) {
    var script = path.join(__dirname, '..', '..', 'scripts', req.body.script.script_file + "");
    script = path.normalize(script);
    var command;

    // UNIX
    if (process.platform == "darwin" || process.platform == "linux") {
      // make sure the script is executable
      var chmod = exec('chmod a+x ' + script);

      if (req.body.script.args && req.body.script.args.length > 0) {
        var args = "";
        // build the args string
        if (req.body.script.args.length == 1) {
          args = req.body.script.args[0];
        } else {
          for (var i=0; i<req.body.script.args.length; i++) {
            args += "\"" + req.body.script.args[i] + "\" ";
          }
        }
        console.log(script + " " + args);

        // execute the command
        command = exec('sh ' + script + " \"" + args + "\"");
      } else {
        command = spawn('sh', ['-c',script]);
      }

    // Windows
    } else if (process.platform == "win32") {
      if (req.body.script.args && req.body.script.args.length > 0) {
        var args = "";
        // build the args string
        if (req.body.script.args.length == 1) {
          args = req.body.script.args[0];
        } else {
          for (var i=0; i<req.body.script.args.length; i++) {
            args += req.body.script.args[i];
          }
        }
        // execute
        command = spawn(script, req.body.script.args[0]);
      } else {
        command = spawn(script);
      }
    }

    return res.status(200).send('Run script accepted.');
  });
  // ------------------------------------------------------------------------

  return function(req, res, next) {
    next();
  };
};
