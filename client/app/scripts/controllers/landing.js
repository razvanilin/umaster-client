'use strict';

/**
 * @ngdoc function
 * @name uMasterApp.controller:LandingCtrl
 * @description
 * # LandingCtrl
 * Controller of the uMasterApp
 */
angular.module('uMasterApp')
  .controller('LandingCtrl', function ($scope, $rootScope, User, Profile, umasterSocket, $window, store, Script, auth) {

    if (store.get('profile')) {
      $scope.loading = true;
      // create or update the user

      User.one().customPOST({user: store.get('profile')}).then(function(user) {

        Profile.details = store.get('profile');
        Profile.details.type = "pc";

        console.log(Profile.details);
        $rootScope.loggedin = true;
        $scope.$emit("page-change", "dashboard");

        umasterSocket.emit('register', Profile.details);
        $scope.loading = false;

        Script.one().get({user: store.get('profile').email}).then(function(scripts) {
          $rootScope.scripts = scripts;
        }, function(response) {
          console.log(response);
        });

      }, function(response) {
        console.log(response);
        $scope.loading = false;
      });
    }

    $scope.signin = function() {
      $scope.loading = true;
      auth.signin({}, function (profile, token) {

        // create or update the user
        User.one().customPOST({user: profile}).then(function(user) {

          store.set('profile', profile);
          store.set('token', token);
          Profile.details = profile;
          console.log("profile");
          console.log(Profile.details);
          // register the type of the profile
          Profile.details.type = "pc";

          $rootScope.loggedin = true;
          umasterSocket.emit('register', Profile.details);
          $scope.loading = false;

          Script.one().get({user: profile.email}).then(function(scripts) {
            $rootScope.scripts = scripts;
            // refresh workaround to reset the socket factory settings
            $scope.$emit('page-change', 'dashboard');
            $window.location.reload();
          }, function(response) {
            console.log(response);
          });

        }, function(response) {
          console.log(response);
          $scope.loading = false;
        });
      }, function () {
        // Error callback
        $scope.loading = false;
      });
    };
  });
