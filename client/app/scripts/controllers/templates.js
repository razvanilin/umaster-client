'use strict';

/**
 * @ngdoc function
 * @name uMasterApp.controller:TemplatesCtrl
 * @description
 * # TemplatesCtrl
 * Controller of the uMasterApp
 */
angular.module('uMasterApp')
  .controller('TemplatesCtrl', function ($scope, Profile, Template, ConfigGenerator) {
    $scope.templates = [];

    Template.one().get({user: Profile.details.email}).then(function(data) {
      $scope.templates = data;
      console.log(data);
    }, function(response) {
      console.log(response);
    });

    $scope.editTemplate = function(temp) {
      $scope.edit = true;
      $scope.template = temp;
      $scope.navigate('register-activity');
    }

    $scope.deleteTemplate = function(temp, index) {
      Template.one(temp._id).one('remove').get().then(function(data) {
        // generate the config file
        ConfigGenerator.generate(function(err) {
          if (err) {
            console.log(err);
            return;
          }

          $scope.templates.splice(index,1);
        });
      }, function(response) {
        console.log(response);
      });
    }
  });
