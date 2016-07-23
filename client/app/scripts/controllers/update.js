'use strict';

/**
 * @ngdoc function
 * @name uMasterApp.controller:UpdateCtrl
 * @description
 * # UpdateCtrl
 * Controller of the uMasterApp
 */
angular.module('uMasterApp')
  .controller('UpdateCtrl', function ($scope, $rootScope, Update) {

    $rootScope.checkForUpdates = function() {
      $scope.updateData = null;
      $scope.updateNotice = null;

      Update.one().get().then(function(data) {
        $scope.updateData = data;
        if (!$scope.toastsDisplayed) {
          Materialize.toast("New update available!", 4000, "rounded", function() {
            Materialize.toast("Check the settings menu to update", 4000, "rounded");
          });
        }
        $scope.toastsDisplayed = true;
      }, function(response) {
        $scope.updateNotice = response.data;
      });
    }

    $scope.update = function() {
      Update.one('install').get().then(function(data) {
        $scope.updateData = data;
      }, function(response) {
        $scope.updateNotice = response.data;
      });
    }

    $rootScope.checkForUpdates();
  });
