var routes = {
  '/user': require('./controllers/UserController'),
  '/script': require('./controllers/ScriptController'),
  '/update': require('./controllers/UpdateController'),
  '/settings': require('./controllers/SettingsController')
};

module.exports = routes;
