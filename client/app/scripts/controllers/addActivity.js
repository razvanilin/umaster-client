'use strict';

/**
 * @ngdoc function
 * @name uMasterApp.controller:AddactivityCtrl
 * @description
 * # AddactivityCtrl
 * Controller of the uMasterApp
 */
angular.module('uMasterApp')
  .controller('AddactivityCtrl', function ($scope, $rootScope, $location, AppStore, umasterSocket, Script) {

    $scope.script = {args:[]};
    $scope.input = {selectedActivity: 0};
    $scope.localScripts = AppStore.localScripts;
    console.log($scope.localScripts);
    $scope.prepareScript = function() {
      $scope.script = {args: []};
    };

    $scope.addScript = function() {
      $scope.loading = true;

      console.log("$scope.script.args");
      // if ($scope.script.args && $scope.script.args.length > 0 && !Array.isArray($scope.script.args)) {
      //   console.log($scope.script.args);
      //   $scope.script.args = $scope.script.args.split(",");
      // }

      // check to see if this an edit request or creation
      var edit = false;
      for (var i=0; i<$rootScope.scripts.length; i++) {
        if ($scope.script._id == $rootScope.scripts[i]._id) {
          edit = true;
          break;
        }
      }

      if (edit) {
        Script.one().customPUT({user: $scope.profile.email, script: $scope.script})
        .then(function(scripts) {
          $rootScope.scripts = scripts;
          console.log(scripts);
          $scope.loading = false;
          $scope.script = {args: []};
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
          $rootScope.scripts = scripts;
          console.log(scripts);
          $scope.loading = false;
          $scope.script = {args: []};
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
