'use strict';

/**
 * @ngdoc function
 * @name uMasterApp.controller:DashboardCtrl
 * @description
 * # DashboardCtrl
 * Controller of the uMasterApp
 */
angular.module('uMasterApp')
  .controller('DashboardCtrl', function ($scope, auth, store, Profile, umasterSocket, Script, AppStore, $rootScope) {
    $rootScope.openUpdateModal = false;

    // load the templates configuration in the background
    Script.one('local').get().then(function(localScripts) {
      AppStore.localScripts = localScripts;
      $rootScope.scriptsLoaded = true;
      console.log(AppStore.localScripts);
    }, function(response) {
      console.log(response);
    });

    Script.one().get({user: Profile.details.email}).then(function(scripts) {
      AppStore.activities = scripts;
      console.log(scripts);
      $scope.scripts = AppStore.activities;
    }, function(response) {
      console.log(response);
    });

    $scope.$emit('page-change', 'dashboard');

    // update the activities
    $scope.$on('activity-updated', function() {
      $scope.scripts = AppStore.activities;
    });

    // ---------------------------------------

    if (Profile.details) {
      console.log(Profile.details);
      $scope.profile = Profile.details;
    }

    $scope.deleteScript = function(scriptName) {
      $scope.loading = true;
      Script.one(scriptName).one('remove').customPOST({user: Profile.details.email }).then(function(scripts) {
        AppStore.activities = scripts;
        $scope.scripts = scripts;
        $scope.loading = false;
        // emit a socket message to let the server know that a new activity was deleted
        umasterSocket.emit('activity-updated', Profile.details);

      }, function(response) {
        $scope.loading = false;
        console.log(response.data);
      });
    };

    $scope.changeScriptStatus = function(script) {
      $scope.loading = true;
      Script.one("status").customPUT({
        user:Profile.details.email,
        script: {
          _id: script._id,
          status: script.active
        }}
      ).then(function(scripts) {
        $scope.loading = false;
        // emit a message to flag the change
        console.log("emitting");
        umasterSocket.emit("activity-updated", Profile.details);
      }, function(response) {
        console.log(response);
        $scope.loading = false;
      });
    }
  });
