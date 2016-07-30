'use strict';

/**
 * @ngdoc function
 * @name uMasterApp.controller:DashboardCtrl
 * @description
 * # DashboardCtrl
 * Controller of the uMasterApp
 */
angular.module('uMasterApp')
  .controller('DashboardCtrl', function ($scope, auth, store, umasterSocket, Script, AppStore, $rootScope) {
    $rootScope.connection = {};
    $rootScope.openUpdateModal = false;

    // Socket messages
    umasterSocket.on('script-accepted', function(script) {
      Script.one('run').one(script.name).customPOST({script: script}).then(function(data) {
        console.log(data);
      });
    });

    umasterSocket.on("register-complete", function(data) {
      $rootScope.connection = data;
    });

    // ---------------------------------------

    $rootScope.logOut = function() {
      auth.signout();
      store.remove('profile');
      store.remove('token');
      $rootScope.loggedin = false;

      umasterSocket.emit('unregister', $rootScope.profile);
      $rootScope.profile = {};
    };

    $scope.deleteScript = function(scriptName) {
      $scope.loading = true;
      Script.one(scriptName).one('remove').customPOST({user:$rootScope.profile.email}).then(function(scripts) {
        $rootScope.scripts = scripts;
        $scope.loading = false;

        // emit a socket message to let the server know that a new activity was deleted
        umasterSocket.emit('activity-updated', $rootScope.profile);

      }, function(response) {
        $scope.loading = false;
        console.log(response.data);
      });
    };

    $scope.changeScriptStatus = function(script) {
      $scope.loading = true;
      Script.one("status").customPUT({
        user:$rootScope.profile.email,
        script: {
          _id: script._id,
          status: script.active
        }}
      ).then(function(scripts) {
        $scope.loading = false;
        // emit a message to flag the change
        console.log("emitting");
        umasterSocket.emit("activity-updated", $rootScope.profile);
      }, function(response) {
        console.log(response);
        $scope.loading = false;
      });
    }
  });
