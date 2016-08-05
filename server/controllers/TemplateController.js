var uuid = require('node-uuid');
var fs = require('fs');
var path = require('path');
var request = require('request');

module.exports = (app, route) => {

  // global unique id for new templates
  var templateId;

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
    newTemplate.script_id = templateId;

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

  /*
  ** Route to upload the script file
  */
  app.post("/template/file", (req, res) => {
    req.pipe(req.busboy);
    req.busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
      var uploadPath = path.join(app.scriptPath, filename);

      var stream = fs.createWriteStream(uploadPath);
      file.pipe(stream);

      stream.on('close', () => {
        return res.status(200).send("File registered with the template.");
      });
    });
  });

  return (req, res, next) => {
    next();
  }
}
