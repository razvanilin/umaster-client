'use strict';

describe('Controller: RegisterActivityCtrl', function () {

  // load the controller's module
  beforeEach(module('uMasterApp'));

  var RegisteractivityCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    RegisteractivityCtrl = $controller('RegisterActivityCtrl', {
      $scope: scope
      // place here mocked dependencies
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope).toBeDefined();
  });
});
