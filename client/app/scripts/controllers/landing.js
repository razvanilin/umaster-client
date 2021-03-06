'use strict';

/**
 * @ngdoc function
 * @name uMasterApp.controller:LandingCtrl
 * @description
 * # LandingCtrl
 * Controller of the uMasterApp
 */
angular.module('uMasterApp')
  .controller('LandingCtrl', function ($scope, $rootScope, User, Profile, umasterSocket, $window, store, Script, auth, AppStore, Template, ConfigGenerator) {

    if (store.get('profile')) {
      $scope.loading = true;
      // create or update the user

      User.one().customPOST(store.get('profile')).then(function(data) {

        Profile.details = data.user;
        Profile.details.type = "pc";

        $scope.$emit("updated-profile", "");

        console.log(Profile.details);

        // generate the templates
        ConfigGenerator.generate(function(err) {
          if (err) {
            console.log(err);
            return;
          }

          $rootScope.loggedin = true;
          $scope.$emit("page-change", "dashboard");

          umasterSocket.emit('register', Profile.details);
          $scope.loading = false;
        });

      }, function(response) {
        console.log(response);
        $scope.loading = false;
      });
    }

    $scope.signin = function() {
      $scope.loading = true;
      auth.signin({
        authParams: {
          scope: 'openid name email roles' // Specify the scopes you want to retrieve
        }
      }, function (profile, token) {

        // store the profile and token
        store.set('profile', profile);
        store.set('token', token);

        // create or update the user
        User.one().customPOST(profile).then(function(data) {

          Profile.details = data.user;
          // register the type of the profile
          Profile.details.type = "pc";

          $scope.$emit("profile-updated", "");
          // generate the templates
          ConfigGenerator.generate(function(err) {
            if (err) {
              console.log(err);
              return;
            }

            $rootScope.loggedin = true;
            umasterSocket.emit('register', Profile.details);
            $scope.loading = false;

            // refresh workaround to reset the socket factory settings
            $scope.$emit('page-change', 'dashboard');
            $window.location.reload();
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
