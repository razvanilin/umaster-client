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
    console.log(req.body.user);
    var options = {
      url: expressApp.settings.host + "/user?auth_token=" + req.query.auth_token,
      method: "POST",
      form: req.body.user,
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json"
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


  /*expressApp.post('/user/signup', function(req, res) {
    var signupOp = options;
    signupOp.url = expressApp.settings.host + "/user/signup";
    signupOp.form = req.body;
    signupOp.method = "POST";

    request(signupOp, function(error, resp, body) {
      if (error) return res.status(400).send(error);
      console.log(body);
      try {
        var responseString = JSON.parse(body);
        console.log(responseString);
        return res.status(200).send(responseString);
      } catch (e) {
        return res.status(200).send(body);
      }
    });
  });

  expressApp.post('/user/login', function(req, res) {
    var loginOp = options;
    loginOp.url = expressApp.settings.host + "/user/login";
    loginOp.form = req.body;
    loginOp.method = "POST";

    request(loginOp, function(error, resp, body) {
      if (error) return res.status(400).send("Something went wrong");
      console.log(body);
      var responseString = JSON.parse(body);
      console.log(responseString);
      return res.status(200).send(responseString);
    });
  });*/

  return function(req, res, next) {
    next();
  };

};
