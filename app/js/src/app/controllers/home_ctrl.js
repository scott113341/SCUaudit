app.controller('HomeCtrl', ['$scope', function($scope) {
  $scope.paste = '';

  $scope.$watch('paste', function(paste) {
    if (paste.length == 0) {
      console.log('naw dude');
      return;
    }
    else {
      console.log(paste);
    }
  });
}]);
