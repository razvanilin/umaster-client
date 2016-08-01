'use strict';

/**
 * @ngdoc function
 * @name uMasterApp.controller:RegisteractivityCtrl
 * @description
 * # RegisteractivityCtrl
 * Controller of the uMasterApp
 */
angular.module('uMasterApp')
  .controller('RegisterActivityCtrl', function ($scope) {

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
  });
