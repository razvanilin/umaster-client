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

    $scope.showTemplates = function() {
      Template.one().get({user: Profile.details.email}).then(function(data) {
        $scope.templates = data;
        $scope.noTemplates = true;

        // check to see if there are any active templates and if not set a flag
        if (data.length > 0)
        for (var template in data) {
          if (data[template] && data[template].active) {
            $scope.noTemplates = false;
            break;
          }
        }
        console.log(data);
      }, function(response) {
        console.log(response);
      });
    }
    $scope.showTemplates();

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

          // $scope.templates.splice(index,1);
          temp.active = false;
          $scope.noTemplates = true;

          // check to see if there are any active templates and if not set a flag
          if ($scope.templates.length > 0)
          for (var template in $scope.templates) {
            if ($scope.templates[template].active) {
              $scope.noTemplates = false;
              break;
            }
          }
        });
      }, function(response) {
        console.log(response);
      });
    }

    $scope.activateTemplate = function(temp, index) {
      Template.one(temp._id).one('remove').get().then(function(data) {
        // generate the config file
        ConfigGenerator.generate(function(err) {
          if (err) {
            console.log(err);
            return;
          }

          temp.active = true;

          $scope.noDeletedTemplates = true;

          // check to see if there are any active templates and if not set a flag
          if ($scope.deletedTemplates.length > 0)
          for (var template in $scope.deletedTemplates) {
            if ($scope.deletedTemplates[template].active == false) {
              $scope.noDeletedTemplates = false;
              break;
            }
          }
        });
      }, function(response) {
        console.log(response);
      });
    }

    $scope.hideDeleted = function() {
      $scope.viewDeleted = false;
      $scope.showTemplates();
    }

    $scope.showDeleted = function() {
      $scope.viewDeleted = true;
      Template.one().get({user: Profile.details.email}).then(function(data) {
        $scope.deletedTemplates = data;
        $scope.noDeletedTemplates = true;

        // check to see if there are any active templates and if not set a flag
        if (data.length > 0)
        for (var template in data) {
          if (data[template].active == false) {
            $scope.noDeletedTemplates = false;
            break;
          }
        }
        console.log(data);
      }, function(response) {
        console.log(response);
      });
    }
  });
