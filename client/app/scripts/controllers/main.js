'use strict';

/**
 * @ngdoc function
 * @name uMasterApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the uMasterApp
 */
angular.module('uMasterApp')
  .controller('MainCtrl', function ($scope, User, auth, store, $location, umasterSocket, Script) {
    $scope.viewSignup = true;
    $scope.user = {};
    $scope.viewNewScript = false;
    $scope.script = {};
    $scope.input = {selectedActivity: 0};
    $scope.pinCode = "";
    $scope.connection = {};

    // Socket messages
    umasterSocket.on('script-accepted', function(script) {

      console.log(script);

      if (script.pinCode == $scope.pinCode) {
        Script.one('run').one(script.name).customPOST({script: script}).then(function(data) {
          console.log(data);
        });
      } else {
        console.log("Script denied.");
      }
    });

    umasterSocket.on("register-complete", function(data) {
      console.log(data);
      $scope.connection = data;
    });

    // ---------------------------------------

    // load the local scripts configuration in the background
    Script.one('local').get().then(function(localScripts) {
      $scope.localScripts = localScripts;
    }, function(response) {
      console.log(response);
    });

    if (store.get('profile')) {
      $scope.loading = true;
      // create or update the user
      User.one().customPOST({user: store.get('profile')}).then(function(user) {

        console.log(user);
        $scope.profile = store.get('profile');
        $scope.profile.type = "pc";

        $scope.loggedin = true;

        umasterSocket.emit('register', $scope.profile);
        $scope.loading = false;

        Script.one().get({user: store.get('profile').email}).then(function(scripts) {
          console.log(scripts);
          $scope.scripts = scripts;
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
        // Success callback
        console.log(profile);

        // create or update the user
        User.one().customPOST({user: profile}).then(function(user) {

          console.log(user);
          store.set('profile', profile);
          store.set('token', token);
          $scope.profile = profile;
          // register the type of the profile
          $scope.profile.type = "pc";

          $scope.loggedin = true;
          umasterSocket.emit('register', $scope.profile);
          $scope.loading = false;

          Script.one().get({user: profile.email}).then(function(scripts) {
            $scope.scripts = scripts;
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

    $scope.prepareScript = function() {
      $scope.viewNewScript = !$scope.viewNewScript;

      if (!$scope.viewNewScript) {
        $scope.script = {};
        $scope.scriptError = false;
      } else {
        $scope.loading = true;
        Script.one('local').get().then(function(localScripts) {
          $scope.localScripts = localScripts;
          $scope.loading = false;
        }, function(response) {
          console.log(response);
          $scope.loading = false;
        });
      }
    };

    $scope.addScript = function() {
      $scope.loading = true;

      console.log($scope.script.args);
      if ($scope.script.args && $scope.script.args.length > 0 && !Array.isArray($scope.script.args)) {
        console.log($scope.script.args);
        $scope.script.args = $scope.script.args.split(",");
      }

      // check to see if this an edit request or creation
      var edit = false;
      for (var i=0; i<$scope.scripts.length; i++) {
        if ($scope.script._id == $scope.scripts[i]._id) {
          edit = true;
          break;
        }
      }

      if (edit) {
        Script.one().customPUT({user: $scope.profile.email, script: $scope.script})
        .then(function(scripts) {
          $scope.scripts = scripts;
          console.log(scripts);
          $scope.viewNewScript = false;
          $scope.loading = false;
          $location.path("/");

          // emit a socket message to let the server know that a new activity was created
          umasterSocket.emit('activity-created', $scope.profile);

        }, function(response) {
          console.log(response);
          $scope.scriptError = response.data;
          $scope.loading = false;
        });

      } else {
        Script.one().customPOST({user: $scope.profile.email, script: $scope.script})
        .then(function(scripts) {
          $scope.scripts = scripts;
          console.log(scripts);
          $scope.viewNewScript = false;
          $scope.loading = false;
          $location.path("/");

          // emit a socket message to let the server know that a new activity was created
          umasterSocket.emit('activity-created', $scope.profile);

        }, function(response) {
          console.log(response);
          $scope.scriptError = response.data;
          $scope.loading = false;
        });
      }
    };

    $scope.deleteScript = function(scriptName) {
      $scope.loading = true;
      Script.one(scriptName).one('remove').customPOST({user:$scope.profile.email}).then(function(scripts) {
        console.log(scripts);
        $scope.scripts = scripts;
        $scope.loading = false;

        // emit a socket message to let the server know that a new activity was deleted
        umasterSocket.emit('activity-created', $scope.profile);

      }, function(response) {
        $scope.loading = false;
        console.log(response.data);
      });
    };

    $scope.editScript = function(script) {
      $scope.script = script;

      for (var i=0; i<$scope.localScripts.length; i++) {
        if (script.script_id == $scope.localScripts[i].script_file) {
          $scope.input.selectedActivity = i;
          console.log(i);
          break;
        }
      }

      console.log(script);
      $scope.prepareScript();
    };

    $scope.file_changed = function(element) {

      $scope.$apply(function(scope) {
         var file = element.files[0];

         $scope.script.args = file.path;

         var reader = new FileReader();
         reader.onload = function(e) {
            //
         };
         reader.readAsDataURL(file);
      });
    };

    $scope.selectScriptFile = function() {
      console.log($scope.input.selectedActivity);

      if (!$scope.script) $scope.script = {};
      // add the script file
      $scope.script.script_file = $scope.localScripts[$scope.input.selectedActivity].script_file;
      $scope.script.script_id = $scope.localScripts[$scope.input.selectedActivity].script_id;
      console.log($scope.script.script_file);
      /*if (typeof $scope.script === typeof undefined) { $scope.script = {}; console.log($scope.script); }
      $scope.script.script_file = $scope.localScripts[$scope.selectedActivity].script_file;
      console.log($scope.script.script_file);*/
    };

  });
