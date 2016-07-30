'use strict';

describe('Controller: MainCtrl', function () {

  // load the controller's module
  beforeEach(module('uMasterApp'));

  var fauxScripts = [{
      args: [{active: false}],
      name: "Lock PC",
      script_file: "lock.sh",
      script_id: "lock"
  }];

  var MainCtrl,
    scope,
    httpBackend,
    AppStore;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope, $httpBackend, _AppStore_) {
    httpBackend = $httpBackend;
    AppStore = _AppStore_;
    var fauxVersion = "0.0.3";

    httpBackend.when('GET','http://localhost:8000/settings/version').respond(fauxVersion);
    httpBackend.when('GET','http://localhost:8000/script/local').respond(fauxScripts);
    httpBackend.when('GET','views/main.html').respond("something");


    scope = $rootScope.$new();
    MainCtrl = $controller('MainCtrl', {
      $scope: scope
      // place here mocked dependencies
    });
  }));

  afterEach(function() {
    httpBackend.verifyNoOutstandingExpectation();
    httpBackend.verifyNoOutstandingRequest();
  });

  it('should exist', function () {
    httpBackend.flush();

    expect(scope.clientVersion).toBeDefined();
    expect(scope.scriptsLoaded).toBeDefined();
    expect(AppStore.localScripts).toBeDefined();
  });
});
