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

    var active_programs;

    active_programs = $scope.getActivePrograms();

    _.each(active_programs, function(program) {
      console.log(program);


    });
  };







  $scope.getActivePrograms = function() {
    var active_programs = [];

    // get 'Academic Program History' section
    var line_start, line_end;

    // get text from last 'Active in Program' section
    var r = /Active in Program\n((?:\s+[\d-]+\s:\s.+\n)+)/g;
    var matches = r.execs($scope.paste.string);
    console.log('matches', matches);

    // parse text from it
    var programs = matches.last()[1].split("\n").slice(0, -1);
    _.each(programs, function(program) {
      active_programs.push(program.match(/.+\s:\s(.+)/).last());
    });

    console.log('active_programs', active_programs);
    return active_programs;
  };
}]);
