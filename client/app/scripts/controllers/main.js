'use strict';

/**
 * @ngdoc function
 * @name uMasterApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the uMasterApp
 */
angular.module('uMasterApp')
  .controller('MainCtrl', function ($scope, $window, User, auth, store, $location, umasterSocket, Script, AppStore, $rootScope) {
    $scope.viewSignup = true;
    $scope.user = {};
    $scope.scriptsLoaded = false;
    $scope.pinCode = "";
    $scope.connection = {};

    // Socket messages
    umasterSocket.on('script-accepted', function(script) {

      if (script.pinCode == $scope.pinCode) {
        Script.one('run').one(script.name).customPOST({script: script}).then(function(data) {
          console.log(data);
        });
      } else {
        console.log("Script denied.");
      }
    });

    umasterSocket.on("register-complete", function(data) {
      $scope.connection = data;
    });

    // ---------------------------------------

    // load the local scripts configuration in the background
    Script.one('local').get().then(function(localScripts) {
      AppStore.localScripts = localScripts;
      $scope.scriptsLoaded = true;
      console.log(AppStore.localScripts);
    }, function(response) {
      console.log(response);
    });

    if (store.get('profile')) {
      $scope.loading = true;
      // create or update the user
      User.one().customPOST({user: store.get('profile')}).then(function(user) {

        $scope.profile = store.get('profile');
        $scope.profile.type = "pc";

        $scope.loggedin = true;

        umasterSocket.emit('register', $scope.profile);
        $scope.loading = false;

        Script.one().get({user: store.get('profile').email}).then(function(scripts) {
          $rootScope.scripts = scripts;
        }, function(response) {
          console.log(response);
        });

      }, function(response) {
        console.log(response);
        $scope.loading = false;
      });
    }

    $scope.signin = function() {
      $scope.loading = true;
      auth.signin({}, function (profile, token) {

        // create or update the user
        User.one().customPOST({user: profile}).then(function(user) {

          store.set('profile', profile);
          store.set('token', token);
          $scope.profile = profile;
          // register the type of the profile
          $scope.profile.type = "pc";

          $scope.loggedin = true;
          umasterSocket.emit('register', $scope.profile);
          $scope.loading = false;

          Script.one().get({user: profile.email}).then(function(scripts) {
            $rootScope.scripts = scripts;
            // refresh workaround to reset the socket factory settings
            $window.location.reload();
          }, function(response) {
            console.log(response);
          });

        }, function(response) {
          console.log(response);
          $scope.loading = false;
        });
      }, function () {
        // Error callback
        $scope.loading = false;
      });
    };

    $scope.logout = function() {
      auth.signout();
      store.remove('profile');
      store.remove('token');
      $scope.loggedin = false;

      umasterSocket.emit('unregister', $scope.profile);
      $scope.profile = {};


      $scope.pinCode = "";
    };

    $scope.deleteScript = function(scriptName) {
      $scope.loading = true;
      Script.one(scriptName).one('remove').customPOST({user:$scope.profile.email}).then(function(scripts) {
        $rootScope.scripts = scripts;
        $scope.loading = false;

        // emit a socket message to let the server know that a new activity was deleted
        umasterSocket.emit('activity-updated', $scope.profile);

      }, function(response) {
        $scope.loading = false;
        console.log(response.data);
      });
    };

    $scope.changeScriptStatus = function(script) {
      $scope.loading = true;
      Script.one("status").customPUT({
        user:$scope.profile.email,
        script: {
          _id: script._id,
          status: script.active
        }}
      ).then(function(scripts) {
        $scope.loading = false;
        // emit a message to flag the change
        console.log("emitting");
        umasterSocket.emit("activity-updated", $scope.profile);
      }, function(response) {
        console.log(response);
        $scope.loading = false;
      });
    }
  });
