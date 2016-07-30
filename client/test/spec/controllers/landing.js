'use strict';

describe('Controller: LandingCtrl', function () {

  // load the controller's module
  beforeEach(module('uMasterApp'));

  var LandingCtrl,
    scope,
    store,
    auth,
    httpBackend;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope, _store_, _auth_, $httpBackend) {
    scope = $rootScope.$new();
    store = _store_;
    auth = _auth_;
    httpBackend = $httpBackend

    httpBackend.when('POST', 'http://localhost:8000/user').respond("something");
    httpBackend.when('GET', 'views/main.html').respond("something");

    LandingCtrl = $controller('LandingCtrl', {
      $scope: scope
      // place here mocked dependencies
    });
  }));

  afterEach(function() {
    httpBackend.verifyNoOutstandingExpectation();
    httpBackend.verifyNoOutstandingRequest();
  });

  it('should not do anything if profile is not stored in the local store', function () {
    httpBackend.flush();
    expect(store).toBeDefined();

    if (store.get('profile')) {
      expect(scope.profile).toBeDefined();
      expect(scope.profile.type).toBe('pc');
    } else {
      expect(scope.profile).toBeUndefined();
    }
  });

  it('should populate the profile on authentication', function() {
    expect(auth).toBeDefined();
    expect(scope.signin).toBeDefined();
    scope.signin();

    httpBackend.flush();
    setTimeout(function() {
      it ('should be logged in', function() {
        expect(scope.profile).toBeDefined();
        expect(scope.loggedin).toBe(true);
      });
    });
  });
});
