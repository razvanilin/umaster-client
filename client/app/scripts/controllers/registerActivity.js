'use strict';

/**
 * @ngdoc function
 * @name uMasterApp.controller:RegisteractivityCtrl
 * @description
 * # RegisteractivityCtrl
 * Controller of the uMasterApp
 */
angular.module('uMasterApp')
  .controller('RegisterActivityCtrl', function ($scope, Template, Upload, $timeout, HOST, Script, AppStore, Profile) {

    // declare possible field configurations
    var rangeConfigurables = ["label", "min", "max"];
    var textConfigurables = ["label"];
    var fileConfigurables = ["label"];


    $scope.startOver = function() {
      $scope.template = {
        args: []
      };
      $scope.argument = null;
      $scope.templateSaved = false;
    }
    $scope.startOver();


    $scope.addNewField = function(fieldType) {
      $scope.template.args[$scope.template.args.length] = {
        id: $scope.template.args.length,
        type: fieldType
      }
    }

    $scope.removeField = function(index) {
      $scope.template.args.splice(index,1);
    }

    $scope.editField = function(argument) {
      $scope.argument = JSON.parse(JSON.stringify(argument));

      // add argument configuration based on the field type
      if (argument.type == "range") {
        $scope.argument.configurables = rangeConfigurables;
      } else if (argument.type == "text") {
        $scope.argument.configurables = textConfigurables;
      } else if (argument.type == "file") {
        $scope.argument.configurables = fileConfigurables;
      }
    }

    $scope.saveField = function() {
      // delete the configurables as they are not needed for the template registration
      delete $scope.argument.configurables;
      // save the new argument in the template
      $scope.template.args[$scope.argument.id] = JSON.parse(JSON.stringify($scope.argument));
      console.log($scope.template);
      $scope.closeEdit();
    }

    $scope.closeEdit = function() {
      $scope.argument = null;
    }

    $scope.registerTemplate = function() {
      Template.one().customPOST({template: $scope.template, user: Profile.details}).then(function(data) {
        $scope.templateSaved = true;
        // reload the local script
        // load the local scripts configuration in the background
        Script.one('local').get().then(function(localScripts) {
          AppStore.localScripts = localScripts;
          console.log(AppStore.localScripts);
        }, function(response) {
          console.log(response);
        });

        // upload the file
        $scope.f.upload = Upload.upload({
                url: HOST + '/template/file',
                data: {name: $scope.template, file: $scope.f}
            });

            $scope.f.upload.then(function (response) {
                $timeout(function () {
                    $scope.f.result = response.data;
                });
            }, function (response) {
                if (response.status > 0)
                    $scope.errorMsg = response.status + ': ' + response.data;
            }, function (evt) {
                $scope.f.progress = Math.min(100, parseInt(100.0 *
                                         evt.loaded / evt.total));
            });
      }, function(response) {
        console.log(response);
      });
    }

    $scope.selectScriptFile = function(file, errFiles) {
      $scope.f = file;
    }

    $scope.goToDashboard = function() {
      $scope.$emit('page-change', 'dashboard');
    }
  });
