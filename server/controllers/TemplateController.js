var uuid = require('node-uuid');
var fs = require('fs');
var path = require('path');

module.exports = (app, route) => {

  app.post("/template", (req, res) => {
    if (!req.body.name) return res.status(400).send("The request is missing the name field.");
    if (!req.body.script_file) return res.status(400).send("The request is missing the script_file field.");
    if (!req.body.args) return res.status(400).send("The request is missing the args field.");

    var scriptsConfFile;
    if (process.platform == 'darwin') {
      scriptsConfFile = 'scriptsConfOsx.json';
    } else if (process.platform == 'win32') {
      scriptsConfFile = 'scriptsConfWin.json';
    }

    var scriptsConfPath = path.join(app.scriptPath, scriptsConfFile);
    var scriptsConf = JSON.parse(fs.readFileSync(scriptsConfPath));

    var newTemplate = req.body;
    newTemplate.script_id = uuid.v4();

    // add the new template to the script conf json
    scriptsConf.push(newTemplate);

    // write the new json to the config file
    fs.writeFile(scriptsConfPath, JSON.stringify(scriptsConf,null,2), (err) => {
      if (err) {
        return res.status(400).send(err);
      }

      return res.status(200).send(scriptsConf);
    });
  });

  return (req, res, next) => {
    next();
  }
}
