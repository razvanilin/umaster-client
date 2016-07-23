module.exports = (app, route) => {

  console.log("route");
  console.log(route);
  /*
  ** Route to get the version of the client
  */
  app.get("/settings/version", (req, res) => {
    if (!app.packageJson) {
      return res.status(400).send("Can't find the project settings.");
    }
    return res.status(200).send(app.packageJson.version);
  });

  return (req, res, next) => {
    next();
  }
}
