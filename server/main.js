var electron = require('electron');
var remote = electron.remote;
var app = electron.app;  // Module to control application life.
var BrowserWindow = electron.BrowserWindow;  // Module to create native browser window.
var path = require('path');
var express = require('express');
var session = require('express-session');
var methodOverride = require('method-override');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var _ = require('lodash');
var expressApp = express();
var http = require('http').Server(expressApp);
var cors = require('cors');
var spawn = require('child_process').spawn;
var fs = require('fs');
var rimraf = require('rimraf');
var execSync = require('child_process').execSync;
var util = require('util');
expressApp.packageJson = require("./package.json");
expressApp.autoUpdater = electron.autoUpdater;


process.on('uncaughtException', function (error) {
  console.log(error.stack);
});

// Report crashes to our server.
//require('crash-reporter').start();

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
var mainWindow = null;

expressApp.settings = require('./settings');

expressApp.use(cookieParser());
expressApp.use(bodyParser.urlencoded({extended: true}));
expressApp.use(bodyParser.json());
expressApp.use(methodOverride('X-HTTP-Method-Override'));
expressApp.use(session({secret: 'umasterc'}));
expressApp.use(cors());

expressApp.use(express.static(path.join(__dirname, 'public')));
expressApp.set('/', path.join(__dirname, 'public'));

// Quit when all windows are closed.
app.on('window-all-closed', function() {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform != 'darwin') {
    app.quit();
  }
});

// expressApp.quit = app.quit;

// record the path of the scripts
expressApp.scriptPath = app.getPath('userData') + "/scripts";

// check if the path exists and if it doesn't, create it and install the scripts
if (!fs.existsSync(expressApp.scriptPath)) {
  fs.mkdirSync(expressApp.scriptPath);

  // copy the demo scripts from the local store in the script folder
  var resFolder = path.join(__dirname, "scripts");
  // go through all the files
  fs.readdir(resFolder, (err, files) => {
    if (err) throw err;
    files.forEach((file) => {
      var filePath = path.join(resFolder, file);
      var destinationPath = path.join(expressApp.scriptPath, file);
      // copy the contents of each file in a new one located in the user data
      fs.createReadStream(filePath).pipe(fs.createWriteStream(destinationPath));
    });
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.on('ready', function() {
  // Create the browser window.
  mainWindow = new BrowserWindow({width: 1024, height: 764, title: "uMaster", webPreferences: {"nodeIntegration":false}});

  // load the html page
  if (expressApp.settings.env == "development") {
    mainWindow.loadURL("http://localhost:9000");
  } else if (expressApp.settings.env == "production") {
    // and load the index.html of the app.
    var url = path.join(__dirname, "public", "index.html");
    //url = url.replace("server\\", "");
    url = "file://" + url;
    console.log(url);
    mainWindow.loadURL("http://localhost:8000");
  }

  // Emitted when the window is closed.
  mainWindow.on('closed', function() {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });

  var routes = require('./routes');
  _.each(routes, function(controller, route) {
    expressApp.use(route, controller(expressApp, route));
  });


  http.listen(8000, function(){
    console.log("Listening on port" + 8000);
  });
});
