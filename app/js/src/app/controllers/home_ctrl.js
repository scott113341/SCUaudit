app.controller('HomeCtrl', ['$scope', function($scope) {
  $scope.paste = {
    string: '',
    array: []
  };

  $scope.$watch('paste.string', function(paste_string) {
    // make paste array
    $scope.paste.array = paste_string.split("\n");
    $scope.paste.array.unshift('firstline');

    if (paste_string.length === 0) {
      console.log('no paste detected');
    }
    else {
      $scope.parseAudit();
    }
  });

  $scope.parseAudit = function() {
    var paste = $scope.paste;

    var a = paste.array.lines(22, 24);

    console.log(a);
  };







  $scope.getActivePrograms = function() {
    // get 'Academic Program History' section
    var line_start, line_end;



  };
}]);
