app.controller('HomeCtrl', ['$scope', '$http', function($scope, $http) {
  // define models
  $scope.paste = {
    string: '',
    array: []
  };
  $scope.requirements = [];


  // watch for paste to start parsing
  $scope.$watch('paste.string', function(paste_string) {
    // log paste
//    $http.post('save.php', {audit: paste_string});

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
    console.log('active_programs_lines', active_programs_lines);

    $scope.requirements = [$scope.getRequirements(active_programs_lines)];
  };


  $scope.getRequirements = function(lines) {
    console.log("\n\n###### getRequirements() ######");
    console.log('lines', lines);

    // define global array, section array, and empty requirement object
    var array = $scope.paste.array;
    var section_array = array.lines(lines);
    var requirement = {};


    // get current indentation
    var indent_level = section_array[0].leadingSpaces();
    console.log('top_level', indent_level);


    // check if requirement is satisfied
    var satisfied = array.completed(lines.start);
    console.log('requirement ' + array[lines.start] + ' satisfied: ' + satisfied);


    // set requirement properties
    requirement.name = $scope.inProgress(array[lines.start]).name;
    requirement.satisfied = satisfied;
    requirement.in_progress = $scope.inProgress(array[lines.start]).in_progress;
    if (requirement.in_progress) requirement.satisfied = false;
    requirement.requirements = [];


    // get sub-section lines
    var sub_section_lines = {};
    sub_section_lines.start = lines.start + ((satisfied) ? 1 : 2);
    sub_section_lines.end = lines.end;
    console.log('sub_section_lines', sub_section_lines);


    // if next section is indented more, run getRequirements() on it
    var has_children = array[sub_section_lines.start].leadingSpaces() > indent_level;
    console.log('has_children', has_children);
    if (has_children) {
      console.log('line ' + sub_section_lines.start + ' is indented more');

      var sub_requirements = $scope.getRequirements(sub_section_lines);

      // if sub_requirements have no children
      if (sub_requirements === false) {
      }
      else {
        requirement.requirements = requirement.requirements.concat(sub_requirements);
      }
    }

    // else get all requirements on this level
    var level_requirements = $scope.getLevelRequirements({start: sub_section_lines.start-1, end: sub_section_lines.end});
    console.log('@@@@@@@@@@level_requirements', level_requirements);
    if (!has_children && level_requirements.length > 1) {
      console.log('multiple level_requirements, getting all requirements on this level');

      _.each(level_requirements, function(requirement_block) {
        console.log(requirement_block);

        console.log('here', requirement, requirement_block);

        if (requirement.constructor === Object) requirement = [];
        requirement.push($scope.getRequirements(requirement_block));
      });
    }

    // else if doesn't have children get
    else if (!has_children) {
      requirement.conditions = $scope.parseRequirement(sub_section_lines);
    }

    return requirement;
  };


  $scope.parseRequirement = function(section_lines) {
    console.log('parsing requirement');

    var array = $scope.paste.array;
    var parse = [];
    var requirements = [];

    _.each(array.lines(section_lines), function(line, i) {
      if (parse = $scope.parseRequiredActualNeeded(line)) {
        console.log(parse);
        requirements.push(parse);
      }
    });

    return requirements;
  };



  $scope.inProgress = function(name) {
    var regex = /\(IP\)/;

    return {
      name: name.replace(regex, '').trim(),
      in_progress: regex.test(name)
    };
  };




  $scope.getLevelRequirements = function(section_lines) {
    var array = $scope.paste.array;
    var offset = section_lines.start;
    section_lines = array.lines(section_lines);

    var requirements = [];

    // return nothing if this section has children
    var has_children = false;
    _.each(section_lines, function(line) {
      if (line.leadingSpaces() > section_lines[0].leadingSpaces()) has_children = true;
    });
    if (has_children) {
      console.log('this section has child requirements, quitting getLevelRequirements()');
      return requirements;
    }

    var this_requirement = {};
    var new_requirement = true;
    _.each(section_lines, function(line, i) {
      console.log('line ' + i, line);

      if (new_requirement) {
        this_requirement.start = i + offset;
      }

      new_requirement = false;


      var next_line = section_lines[i + 1];



      // end of requirement: line has 'required/actual/needed' && next line isn't && next line is not column headers
      if ($scope.parseRequiredActualNeeded(line) && !$scope.parseRequiredActualNeeded(next_line) && !/Term\s+Course\s+Description/.exec(next_line)) {
        console.log("line has 'required/actual/needed' && next line is not column headers");
        new_requirement = true;
      }

      // end of requirement: line is a taken course && next line is something else
      if ($scope.parseCourse(line) && !$scope.parseCourse(next_line)) {
        console.log('line is a taken course && next line is something else');
        new_requirement = true;
      }

      // end of requirement: out of lines
      if (i === section_lines.length - 1) {
        console.log('out of lines');
        new_requirement = true;
      }



      if (new_requirement) {
        this_requirement.end = i + offset;
        requirements.push(_.clone(this_requirement));
        this_requirement = {};
        console.log('end of requirement');
      }
    });

    return requirements;
  };




  $scope.parseRequiredActualNeeded = function(line) {
    var regex = /(Courses|Units)\s+\((.+?)\): ([\d\./]+)/;
    var course = regex.exec(line);

    if (course) {
      course = course.slice(1, 4);
      var requirement = {};
      requirement.type = course[0];
      requirement.metrics = course[1].split('/');
      requirement.values = _.map(course[2].split('/'), function(a) { return parseFloat(a); });

      return requirement;
    }
    else {
      return false;
    }
  };
  $scope.parseCourse = function(line) {
    var regex = /(Wtr|Fall|Spr)\s(\d{4})\s+(\w+)\s+(\w+)\s+.+?\s{2,}([\d\.]+)\s+([\w\-\+]+)/;
    var course = regex.exec(line);

    if (course) {
      return course.slice(1, 7);
    }
    else {
      return false;
    }
  };








  $scope.getActivePrograms = function() {
    var string = $scope.paste.string;
    var array = $scope.paste.array;

    // get line where 'Academic Advisement Report' starts
    var regex = /A C A D E M I C   A D V I S E M E N T   R E P O R T/;
    var line_start = regex.exec(string).index;
    line_start = string.lineNumber(line_start) + 2;

    // skip 'Report on Undergraduate Career'
    if (array[line_start]  === 'Report on Undergraduate Career') {
      line_start++;
      if (! array.completed(line_start + 1)) line_start++;
    }

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
