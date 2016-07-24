var os = require('os');
var path = require('path');
var cp = require('child_process');
var spawn = cp.spawn;

module.exports = (app, route) => {

  var platform = os.platform();

  console.log(platform);
  var update;
  var isUpdateAvailable = false;

  // Update code for windows
  function windowsUpdater() {
    if (process.platform !== "win32") {
      return false
    }

    const cmd = process.argv[1]
    console.log("arguments: ");
    console.log(process.argv);
    console.log("Processing squirrel command");
    console.log(cmd);
    const target = path.basename(process.execPath)
    if (cmd === "--squirrel-install" || cmd === "--squirrel-updated") {
      console.log("Install or update");
      run(['--createShortcut=' + target + ''], app.quit)
      return true
    }
    else if (cmd === "--squirrel-uninstall") {
      console.log("Uninstall");
      run(['--removeShortcut=' + target + ''], app.quit)
      return true
    }
    else if (cmd === "--squirrel-obsolete") {
      console.log("Obsolete");
      app.quit()
      return true
    }
    else {
      return false
    }
  };

  function run(args, done) {
    const updateExe = path.resolve(path.dirname(process.execPath), "..", "Update.exe")
    console.log("Spawning");
    console.log(updateExe);
    console.log(args);
    spawn(updateExe, args, {
      detached: true
    })
    .on("close", done)
  }

  // Update code for macs
  function autoUpdate() {
    app.autoUpdater.setFeedURL("https://umaster-nuts.herokuapp.com/update/" + platform + "/x.x.x");
    app.autoUpdater.checkForUpdates();

    //update events
    app.autoUpdater.addListener("error", (e) => {
      console.log("error");
      console.log(e);
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

  // Auto Updater section
  if (app.settings.env == 'production') {
    autoUpdate();
    if (process.platform == 'win32') windowsUpdater();
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
