app.controller('HomeCtrl', ['$scope', '$http', function($scope, $http) {
  $scope.paste = {
    string: '',
    array: []
  };
  $scope.programs = [];


  $scope.$watch('paste.string', function(paste_string) {
    // log paste
    $http.post('save.php', {audit: paste_string});

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
    var array = $scope.paste.array;

    // get lines for active programs
    var active_programs_lines = $scope.getActivePrograms();

    // find active programs (they are lines without spaces within the active programs section)
    var lines_without_spaces = [];
    _.each(array.lines(active_programs_lines), function(line, i) {
      if (line.leadingSpaces() === 0) {
        lines_without_spaces.push(i + active_programs_lines.start);
      }
    });

    // go through active programs and determine their completion
    while (lines_without_spaces.length > 0) {
      var line_start = lines_without_spaces.shift();
      var completed = array.completed(line_start);

      // create program object and add to programs
      var program = {};
      program.name = array[line_start];
      program.completed = completed;
      program.line = {
        start: line_start,
        end: (completed) ? lines_without_spaces[0] : lines_without_spaces[1]-1
      };
      $scope.programs.push(program);

      // if not completed, remove that line and move on to the next program
      if (completed === false) {
        lines_without_spaces.shift();
      }
    }
  };


  $scope.getRequirements = function(line_start, line_end) {

  };


  $scope.getActivePrograms = function() {
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

    return {
      start: line_start,
      end: line_end
    };
  };
}]);
