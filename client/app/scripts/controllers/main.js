'use strict';

/**
 * @ngdoc function
 * @name uMasterApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the uMasterApp
 */
angular.module('uMasterApp')
  .controller('MainCtrl', function ($scope, Settings, umasterSocket, Script, $rootScope, AppStore, store) {


    $scope.page = store.get('page');
    $scope.$on('page-change', function(event, data) {
      $scope.page = data;
      console.log("hey: " + data);
      store.set("page", data);
    });

    // get the client's version
    Settings.one('version').get().then(function(data) {
      $rootScope.clientVersion = data;
    }, function(response) {
      console.log(response);
    });

    // load the local scripts configuration in the background
    Script.one('local').get().then(function(localScripts) {
      AppStore.localScripts = localScripts;
      $rootScope.scriptsLoaded = true;
      console.log(AppStore.localScripts);
    }, function(response) {
      console.log(response);
    });

    $scope.navigate = function(path) {
      $scope.page = path;
      store.set('page', path);
    }
  });
