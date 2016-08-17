'use strict';

/**
 * @ngdoc overview
 * @name uMasterApp
 * @description
 * # uMasterApp
 *
 * Main module of the application.
 */
angular
  .module('uMasterApp', [
    'restangular',
    'btford.socket-io',
    'auth0',
    'angular-storage',
    'angular-jwt',
    'ngRoute',
    'ngResource',
    'ui.materialize',
    'config',
    'ngFileUpload',
    'angular-uri'
  ])
  .config(function ($routeProvider, $httpProvider, RestangularProvider, authProvider, jwtInterceptorProvider, HOST) {
    RestangularProvider.setBaseUrl(HOST);

    jwtInterceptorProvider.tokenGetter = ['store', function(store) {
      // Return the saved token
      return store.get('token');
    }];

    $httpProvider.interceptors.push('jwtInterceptor');

    authProvider.init({
      domain: 'razvanilin.eu.auth0.com',
      clientID: 'cYRmkEJu68e2OuKKQj371CaPLR5ZYLio'
    });

    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl',
        controllerAs: 'main'
      })
      .otherwise({
        redirectTo: '/'
      });
  })
  .factory('AppStore', function() {
    var appStore = {
      localScripts: []
    };

    return appStore;
  })
  .factory('Profile', function() {
    var profile = {
      details: {}
    };

    return profile;
  })
  .factory('User', function(Restangular) {
    return Restangular.service('user');
  })
  .factory('Script', function(Restangular) {
    return Restangular.service('script');
  })
  .factory('Update', function(Restangular) {
    return Restangular.service('update');
  })
  .factory('Settings', function(Restangular) {
    return Restangular.service('settings');
  })
  .factory('Template', function(Restangular) {
    return Restangular.service('template');
  })
  .factory('umasterSocket', function(socketFactory, ENV, store) {
    var socketUrl;
    if (ENV == 'production') {
      socketUrl = "https://api.umaster.xyz";
    } else if (ENV == 'production-test') {
      socketUrl = "https://apidev.umaster.xyz";
    } else if (ENV == 'development') {
      socketUrl = "http://localhost:3031";
    }

    var socket;
    if (store.get('profile')) {
      socket = socketFactory({
        ioSocket: io.connect(socketUrl, {
          query: "email=" + store.get('profile').email + "&type=pc"
        })
      });
    } else {
      socket = socketFactory();
    }
    // connect the socket only if the user is logged in
    return socket;
  })
  .factory("ConfigGenerator", function($rootScope, umasterSocket, Template, Profile, Script, AppStore) {
    return {
      generate: function(callback) {
        Template.one().get({user: Profile.details.email, config: true}).then(function(data) {
          // load the local scripts configuration in the background
          Script.one('local').get().then(function(localScripts) {
            AppStore.localScripts = localScripts;
            $rootScope.scriptsLoaded = true;
            callback();
          }, function(response) {
            console.log(response);
            callback(response);
          });

        }, function(response) {
          console.log(response);
          callback(response);
        });
      }
    }
  })
  .run(function($rootScope, auth, store, jwtHelper, $location) {
    // This events gets triggered on refresh or URL change
    $rootScope.$on('$locationChangeStart', function() {
      var token = store.get('token');
      if (token) {
        if (!jwtHelper.isTokenExpired(token)) {
          if (!auth.isAuthenticated) {
            auth.authenticate(store.get('profile'), token);
          }
        } else {
          // Either show the login page or use the refresh token to get a new idToken
          $location.path('/');
        }
      }
    });
  });
