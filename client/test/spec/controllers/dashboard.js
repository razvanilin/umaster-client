'use strict';

describe('Controller: DashboardCtrl', function () {

  // load the controller's module
  beforeEach(module('uMasterApp'));

  var DashboardCtrl,
    scope,
    store,
    Profile,
    httpBackend;

  var scriptName = "testScript";


  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope, $httpBackend, _store_, _Profile_) {
    store = _store_;
    Profile = _Profile_;
    httpBackend = $httpBackend;
    httpBackend.when('GET', 'views/main.html').respond("something");

    scope = $rootScope.$new();
    DashboardCtrl = $controller('DashboardCtrl', {
      $scope: scope
      // place here mocked dependencies
    });
  }));

  afterEach(function() {
    httpBackend.verifyNoOutstandingExpectation();
    httpBackend.verifyNoOutstandingRequest();
  });

  it('should empty the store and log out', function () {
    httpBackend.flush();
    scope.logOut();
    expect(store.get('profile')).toBeNull();
    expect(store.get('token')).toBeNull();
    expect(scope.loggedin).toBeFalsy();
    expect(Profile.details).toEqual({});
  });

  it('should delete the script', function() {
    httpBackend.flush();
    // create a mock array on the scope
    Profile.details = {email: "raz@raz.com"};
    // initiate the script deletion
    scope.deleteScript(scriptName);
    // listen for the POST request and respond with an empty array (to mock the deletion)
    httpBackend.when('POST', 'http://localhost:8000/script/'+scriptName+'/remove', {user: Profile.details.email}).respond([]);
    httpBackend.flush();
    expect(scope.scripts.length).toEqual(0);
  });

});
