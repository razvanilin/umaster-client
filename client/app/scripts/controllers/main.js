'use strict';

/**
 * @ngdoc function
 * @name uMasterApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the uMasterApp
 */
angular.module('uMasterApp')
  .controller('MainCtrl', function ($scope, Settings, umasterSocket, Script, $rootScope, AppStore, store, Profile, auth) {

    // Socket messages
    umasterSocket.on('script-accepted', function(script) {
      console.log(script);
      Script.one('run').one(script.name).customPOST({script: script}).then(function(data) {
        console.log(data);
      });
    });

    umasterSocket.on("register-complete", function(data) {
      $rootScope.connection = data;
    });
    // -----------------------------------------

    $scope.page = store.get('page');
    $scope.$on('page-change', function(event, data) {
      $scope.page = data;
      console.log("hey: " + data);
      store.set("page", data);
    });

    $scope.$on('updated-profile', function(event, data) {
      $scope.profile = Profile.details;
      console.log($scope.profile);
    });

    // get the client's version
    Settings.one('version').get().then(function(data) {
      $rootScope.clientVersion = data;
    }, function(response) {
      console.log(response);
    });

    $scope.navigate = function(path) {
      $scope.page = path;
      store.set('page', path);
    }

    $scope.logOut = function() {
      auth.signout();
      store.remove('profile');
      store.remove('token');
      $rootScope.loggedin = false;

      umasterSocket.emit('unregister', Profile.details);
      Profile.details = {};
    };
  });
