'use strict';

/**
 * @ngdoc function
 * @name uMasterApp.controller:RegisteractivityCtrl
 * @description
 * # RegisteractivityCtrl
 * Controller of the uMasterApp
 */
angular.module('uMasterApp')
  .controller('RegisterActivityCtrl', function ($scope, Template) {

    // declare possible field configurations
    var rangeConfigurables = ["label", "min", "max"];
    var textConfigurables = ["label", "placeholder"];
    var fileConfigurables = ["label"];

    $scope.template = {
      args: []
    };

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
      Template.one().customPOST($scope.template).then(function(data) {
        console.log(data);
      }, function(response) {
        console.log(response);
      });
    }

    $scope.selectScriptFile = function(element, parent) {
      // extract the argument index (for the $scope.script.args)
      var argsIndex = parseInt(element.id.substring(element.id.lastIndexOf("e")+1));

      $scope.$apply(function(scope) {
         var file = element.files[0];

         $scope.template.script_file = file.path;

         var reader = new FileReader();
         reader.onload = function(e) {
            //
         };
         reader.readAsDataURL(file);
      });
    };
  });
