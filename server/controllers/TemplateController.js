var uuid = require('node-uuid');
var fs = require('fs');
var path = require('path');
var request = require('request');

module.exports = (app, route) => {

  // global unique id for new templates
  var templateId;

  /*
  ** Route to get the user's templates and generate the configuration file if the flag is true
  */
  app.get('/template', (req, res) => {
    if (!req.query.user) return res.status(400).send("The user parameter is required for this request.");

    var options = {
      url: app.settings.host + '/template?user=' + req.query.user,
      method: "GET",
      headers: {
        "Accept": "application/json"
      }
    };

    request(options, (error, resp, body) => {
      if (error) return res.status(400).send(error);

      try {
        var responseString = JSON.parse(body);
        // if the config flag is not present, then return just the templates
        if (!req.query.config) return res.status(200).send(responseString);

        // if config flag is true then also generate the config file and scripts

      } catch (e) {
        console.log(e);
        console.log(body);
        return res.status(400).send(body);
      }
    });
  });
  // ----------------------------------------------------

  /*
  ** Route to create a new template
  */
  app.post("/template", (req, res) => {
    if (!req.body.template.name) return res.status(400).send("The request is missing the name field.");
    if (!req.body.template.script_file) return res.status(400).send("The request is missing the script_file field.");
    if (!req.body.template.args) return res.status(400).send("The request is missing the args field.");

    var scriptsConfFile;
    if (process.platform == 'darwin') {
      scriptsConfFile = 'scriptsConfOsx.json';
    } else if (process.platform == 'win32') {
      scriptsConfFile = 'scriptsConfWin.json';
    }

    var scriptsConfPath = path.join(app.scriptPath, scriptsConfFile);
    var scriptsConf = JSON.parse(fs.readFileSync(scriptsConfPath));

    var newTemplate = req.body.template;
    templateId = uuid.v4();
    newTemplate.template_id = templateId;

    // add the new template to the script conf json
    scriptsConf.push(newTemplate);

    // prepare the request options
    var options = {
      url: app.settings.host + "/template",
      method: "POST",
      form: req.body,
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      }
    }

    // write the new json to the config file
    fs.writeFile(scriptsConfPath, JSON.stringify(scriptsConf,null,2), (err) => {
      if (err) {
        return res.status(400).send(err);
      }

      // register the template with the server
      request(options, (error, resp, body) => {
        if (error) return res.status(400).send(error);

        if (resp.statusCode == 200) return res.status(200).send(scriptsConf);

        return res.status(400).send(resp);
      });
    });
  });
  // ----------------------------------------------------

  /*
  ** Route to upload the script file
  */
  app.post("/template/file", (req, res) => {
    // prepare the request to the api
    var options = {
      url: app.settings.host + "/template/file",
      method: "POST",
      form: {
        template_id: templateId,
        script_file_data: {}
      },
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      }
    }

    req.pipe(req.busboy);
    req.busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
      // save the mimetype in the request options
      options.form.script_file_data.contentType = mimetype;

      // create the upload path (user data script folder)
      var uploadPath = path.join(app.scriptPath, filename);

      var stream = fs.createWriteStream(uploadPath);
      file.pipe(stream);

      var fileBuffer;
      stream.on('data', (data) => {
        if (!fileBuffer) {
          fileBuffer = new Buffer(data);
        } else {
          fileBuffer = Buffer.concat([fileBuffer, data]);
        }
      });

      stream.on('close', () => {
        // send the file buffer to the api
        // options.form.script_file_data.data = file.toString('base64');
        options.form.script_file_data.data = fs.readFileSync(uploadPath).toString('base64');
        request(options, (error, resp, body) => {
          if (error) return res.status(400).send(error);

          if (resp.statusCode == 200) return res.status(200).send("File registered with the template.");

          return res.status(resp.statusCode).send(body);
        });
      });
    });
  });
  // ----------------------------------------------------


  return (req, res, next) => {
    next();
  }
}
