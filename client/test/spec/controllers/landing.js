'use strict';

describe('Controller: LandingCtrl', function () {

  // load the controller's module
  beforeEach(module('uMasterApp'));

  var LandingCtrl,
    scope,
    store,
    auth,
    Profile,
    httpBackend;

  var fauxUser = {
    email: "raz@raz.com",
    profile: {
      firstname: "raz",
      lastname: "raz"
    }
  }

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope, _store_, _auth_, $httpBackend, _Profile_) {
    scope = $rootScope.$new();
    store = _store_;
    auth = _auth_;
    Profile = _Profile_;
    httpBackend = $httpBackend;

    httpBackend.when('GET', 'views/main.html').respond("something");
    auth.authenticate(store.get('profile'), store.get('token'));

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
      expect(Profile.details.email).toEqual("raz@raz.com");
      expect(Profile.details.type).toBe('pc');
    } else {
      expect(Profile.details).toEqual({});
    }
  });

  it('should populate the profile on authentication', function() {
    httpBackend.flush();
    expect(auth).toBeDefined();
    expect(scope.signin).toBeDefined();
    scope.signin();

    httpBackend.when('POST', 'http://localhost:8000/user', fauxUser).respond(fauxUser);
    //httpBackend.flush();

    //setTimeout(function() {
      //it ('should be logged in', function() {
        expect(Profile.details.email).toEqual("raz@raz.com");
        expect(scope.loggedin).toBe(true);
    //  });
    //});
  });
});
