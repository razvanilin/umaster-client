var os = require('os');

module.exports = (app, route) => {

  var platform = os.platform() + "_" + os.arch();
  var update;
  var isUpdateAvailable = false;
  // Auto Updater section
  if (app.settings.env == 'production') {
    app.autoUpdater.setFeedURL("https://umaster-nuts.herokuapp.com/update/" + platform + "/x.x.x");
    app.autoUpdater.checkForUpdates();

    //update events
    app.autoUpdater.addListener("error", (e) => {
      console.log("error");
      console.log(util.inspect(e, {showHidden:false, depth:null}));
    });

    app.autoUpdater.addListener("checking-for-update", (e) => {
      console.log("checking for update");
      console.log(e);
    });

    app.autoUpdater.addListener("update-available", (e) => {
      console.log("update-available");
      console.log(e);
      isUpdateAvailable = true;
      console.log("UA: " + isUpdateAvailable);
    });

    app.autoUpdater.addListener("update-not-available", (e) => {
      console.log("update-not-available");
      console.log(e);
    });

    app.autoUpdater.on("update-downloaded", (e, releaseNotes, releaseName, releaseDate, updateUrl) => {
      console.log("update-downloaded");
      console.log(e);
      console.log("Update: '" + releaseName + "' was released at " + releaseDate + " and can be found here: " + updateUrl);

      update = {
        releaseNotes: releaseNotes,
        releaseName: releaseName,
        releaseDate: releaseDate,
        updateUrl: updateUrl
      };

      console.log(update);
    });
  }

  /* ROUTES */

  /*
  **  Route to check for updates
  */
  app.get("/update", (req, res) => {
    if (!isUpdateAvailable) {
      return res.status(404).send("No updates available.");
    }

    return res.status(200).send("A new update is available.");
  });

  /*
  ** Route to aknowledge an update
  */
  app.get("/update/install", (req, res) => {
    if (!isUpdateAvailable) return res.status(404).send("No updates available.");
    if (!update) return res.status(400).send("The update is downloading in the background. Please try again later.");
    // quit and install the update if an update is available
    app.autoUpdater.quitAndInstall();
    return res.status(200).send("updating");
  });

  return (req, res, next) => {
    next();
  }
}
