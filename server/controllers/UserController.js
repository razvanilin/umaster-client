var request = require('request');

module.exports = function(expressApp, route) {

  /*var options = {
    url: expressApp.settings.host,
    method: "GET",
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json"
    }
  };*/

  /*
   *  Route to request a create or an update for a user
   */
  expressApp.post('/user', function(req, res) {
    console.log("POST requested.");
    var options = {
      url: expressApp.settings.host + "/user",
      method: "POST",
      form: req.body,
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "Authorization": req.get('Authorization')
      }
    };

    request(options, function(error, resp, body) {
      if (error) {
        console.log(error);
        return res.status(400).send("Error while making the server request.");
      }

      var responseString;

      try {
        responseString = JSON.parse(body);
        return res.status(200).send(responseString);
      } catch (e) {
        console.log(e);
        console.log(body);
        return res.status(400).send(body);
      }
    });
  });
  // ------------------------------------------------------------------------

  return function(req, res, next) {
    next();
  };

};
