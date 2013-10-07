app.controller('HomeCtrl', ['$scope', function($scope) {
  $scope.paste = {
    string: '',
    array: []
  };

  $scope.$watch('paste.string', function(paste_string) {
    // make paste array
    $scope.paste.array = paste_string.split("\n");

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






    $scope.mcgee();
  };


  $scope.mcgee = function() {
    var string = $scope.paste.string;
    var array = $scope.paste.array;

    // get line where 'Academic Advisement Report' starts
    var regex = /A C A D E M I C   A D V I S E M E N T   R E P O R T/;
    var line_start = regex.exec(string).index;
    line_start = string.lineNumber(line_start) + 2;

    // get line where it ends
    regex = /_{10,}\nReturn/;
    var line_end = regex.exec(string).index;
    line_end = string.lineNumber(line_end) - 1;

    console.log(line_start, line_end);

    console.log(array.lines(line_start, line_end));
  };










  $scope.getActivePrograms = function() {
    var active_programs = [];

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
