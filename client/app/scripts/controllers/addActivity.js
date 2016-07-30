'use strict';

/**
 * @ngdoc function
 * @name uMasterApp.controller:AddactivityCtrl
 * @description
 * # AddactivityCtrl
 * Controller of the uMasterApp
 */
angular.module('uMasterApp')
  .controller('AddactivityCtrl', function ($scope, $rootScope, $location, AppStore, umasterSocket, Script, Profile, $timeout) {

    $scope.script = {args:[]};
    $scope.input = {selectedActivity: 0};
    $scope.localScripts = AppStore.localScripts;
    $scope.selectedActivity = 0;

    // ANGULAR FUNCTIONS
    $rootScope.prepareScript = function() {
      $scope.script = {args: []};
    };

    $scope.addScript = function() {
      $scope.loading = true;

      // save script configuration
      $scope.script.script_file = $scope.localScripts[$scope.selectedActivity].script_file;
      $scope.script.script_id = $scope.localScripts[$scope.selectedActivity].script_id;

      // check to see if this an edit request or creation
      var edit = false;
      if ($scope.script._id) {
        for (var i=0; i<$rootScope.scripts.length; i++) {
          if ($scope.script._id == $rootScope.scripts[i]._id) {
            edit = true;
            break;
          }
        }
      }

      if (edit) {
        Script.one().customPUT({user: Profile.details.email, script: $scope.script})
        .then(function(scripts) {
          $rootScope.scripts = scripts;
          $scope.loading = false;
          $scope.script = {args: []};
          $location.path("/");

          // emit a socket message to let the server know that a new activity was created
          umasterSocket.emit('activity-updated', Profile.details);

        }, function(response) {
          console.log(response);
          $scope.scriptError = response.data;
          $scope.loading = false;
        });

      } else {
        Script.post({user: Profile.details.email, script: $scope.script})
        .then(function(scripts) {

          $rootScope.scripts = scripts;
          console.log(scripts);
          $scope.loading = false;
          $scope.script = {args: []};
          $location.path("/");

          // emit a socket message to let the server know that a new activity was created
          umasterSocket.emit('activity-updated', Profile.details);

        }, function(response) {
          console.log(response);
          $scope.scriptError = response.data;
          $scope.loading = false;
        });
      }
    };

    $rootScope.editScript = function(script) {
        $scope.script = script;
        if (script.script_id) {
          $scope.input.selectedActivity = script.script_id;
          for (var i=0; i<$scope.localScripts.length; i++) {
            if ($scope.localScripts[i].script_id == script.script_id) {
              $scope.selectedActivity = i;
              console.log($scope.selectedActivity);
              break;
            }
          }
        }
    };

    $scope.file_changed = function(element, parent) {
      // extract the argument index (for the $scope.script.args)
      var argsIndex = parseInt(element.id.substring(element.id.lastIndexOf("e")+1));

      $scope.$apply(function(scope) {
         var file = element.files[0];

         $scope.script.args[argsIndex] = file.path;

         var reader = new FileReader();
         reader.onload = function(e) {
            //
         };
         reader.readAsDataURL(file);
      });
    };

    $scope.selectScriptFile = function() {
      if (!$scope.script) $scope.script = {args: []};
      console.log($scope.input.selectedActivity);
      // find the index of the selected activity
      for (var i=0; i<$scope.localScripts.length; i++) {
        if ($scope.localScripts[i].script_id == $scope.input.selectedActivity) {
          $scope.selectedActivity = i;
          console.log($scope.selectedActivity);
          break;
        }
      }

      // add the script file
      $scope.script.script_file = $scope.localScripts[$scope.selectedActivity].script_file;
      $scope.script.script_id = $scope.localScripts[$scope.selectedActivity].script_id;
    };
  });
