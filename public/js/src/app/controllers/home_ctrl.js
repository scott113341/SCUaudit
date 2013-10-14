app.controller('HomeCtrl', ['$scope', '$http', function($scope, $http) {
  // define models
  $scope.requirements = [];
  $scope.paste = {
    string: '',
    array: []
  };
  var string, array;


  // watch for paste to start parsing
  $scope.$watch('paste.string', function(paste_string) {
    // log paste
//    $http.post('save.php', {audit: paste_string});

    // make paste array
    $scope.paste.array = paste_string.split("\n");

    // assign variables
    string = $scope.paste.string;
    array = $scope.paste.array;

    if (paste_string.length === 0) {
      console.log('no paste detected');
    }
    else {
      $scope.parseAudit();
    }
  });


  // do magic
  $scope.parseAudit = function() {
    // get lines for active programs
    var active_programs_lines = $scope.getActivePrograms();
    console.log('active_programs_lines', active_programs_lines);

    _.each(active_programs_lines, function(lines) {
      $scope.requirements.push($scope.getRequirements(lines));
    });
  };





  ////////////////
  // big parsing methods
  // these methods do all of the heavy lifting audit parsing

  // method that recursively gets requirements from between two lines
  $scope.getRequirements = function(lines) {
    console.log("\n\n###### getRequirements() ######");
    console.log('lines', lines);

    // define global array, section array, and empty requirement object
    var section_array = array.lines(lines);
    var requirement = {};

    // get current indentation
    var indent_level = section_array[0].leadingSpaces();
    console.log('top_level', indent_level);

    // check if requirement is satisfied
    var satisfied = !$scope.notSatisfiedLine(array[lines.start + 1]);
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

    // else if doesn't have children parse the requirement
    else if (!has_children) {
      requirement.conditions = $scope.parseRequirement(sub_section_lines).conditions;
      requirement.courses = $scope.parseRequirement(sub_section_lines).courses;
    }

    return requirement;
  };


  // method that parses a last-level requirement, returning all of the conditions
  // and courses for that requirement
  $scope.parseRequirement = function(section_lines) {
    console.log('parsing requirement');

    var parse = [];
    var requirement = {};

    requirement.conditions = [];
    requirement.courses = [];

    _.each(array.lines(section_lines), function(line, i) {
      if (parse = $scope.parseRequiredActualNeeded(line)) {
        console.log(parse);
        requirement.conditions.push(parse);
      }

      else if (parse = $scope.parseCourse(line)) {
        console.log(parse);
        requirement.courses.push(parse);
      }
    });

    return requirement;
  };


  // method that returns an array of all of the line boundaries for top-level requirements
  $scope.getActivePrograms = function() {
    var active_programs = [];

    // get line where 'Academic Advisement Report' starts
    var regex = /A C A D E M I C   A D V I S E M E N T   R E P O R T/;
    var line_start = regex.exec(string).index;
    line_start = string.lineNumber(line_start) + 2;

    // skip 'Report on Undergraduate Career'
    if (array[line_start]  === 'Report on Undergraduate Career') {
      line_start++;
      if (! $scope.notSatisfiedLine(array[line_start + 1])) line_start++;
    }

    // get line where it ends
    regex = /_{10,}\nReturn/;
    var line_end = regex.exec(string).index;
    line_end = string.lineNumber(line_end) - 1;

    // go through lines and find sections
    var lines = array.lines(line_start, line_end);
    var section_line_start = line_start;
    var section_line_end = line_start;
    _.each(lines, function(line, i) {
      // if this line has no indent
      // and it isn't a 'Requirements Not Satisfied' line
      // and it's not the first line
      if ((line.leadingSpaces() === 0 && !$scope.notSatisfiedLine(line) && i > 0) || i === lines.length-1) {
        active_programs.push({
          start: section_line_start,
          end: section_line_end - ((i === lines.length-1) ? 0 : 1)
        });
        section_line_start = section_line_end;
      }
      section_line_end++;
    });

    return active_programs;
  };


  // method that returns all of the requirements at a certain level
  $scope.getLevelRequirements = function(section_lines) {
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





  ////////////////
  // line-parsing methods
  // these methods parse or detect the format of single lines
  $scope.notSatisfiedLine = function(line) {
    return /Not Satisfied/.test(line);
  };


  $scope.parseRequiredActualNeeded = function(line) {
    var regex = /(Courses|Units|GPA)\s+\((.+?)\): ([\d\./]+)/;
    var course = regex.exec(line);

    if (course) {
      course = course.slice(1, 4);
      var requirement = {};
      requirement.type = course[0];
      requirement.metrics = course[1].split('/');
      requirement.values = _.map(course[2].split('/'), function(a) { return parseFloat(a); });
      requirement.show = (requirement.type === 'GPA') ? false : true;

      return requirement;
    }
    else {
      return false;
    }
  };


  $scope.parseCourse = function(line) {
    // TODO add summer
    var regex = /(Wtr|Fall|Spr)\s(\d{4})\s+(\w+)\s+(\w+)\s+.+?\s{2,}([\d\.]+)\s+([\w\-\+]+)/;
    var course = regex.exec(line);

    if (course) {
      course = course.slice(1, 7);

      var quarter = function(q) {
        if (q === 'Wtr') return 'Winter';
        if (q === 'Spr') return 'Spring';
        // TODO add summer
        else return q;
      };

      return {
        quarter: quarter(course[0]),
        year: parseInt(course[1]),
        name: course[2] + ' ' + course[3],
        units: parseFloat(course[4]),
        grade: course[5]
      };
    }
    else {
      return false;
    }
  };


  $scope.inProgress = function(name) {
    var regex = /\(IP\)/;

    return {
      name: name.replace(regex, '').trim(),
      in_progress: regex.test(name)
    };
  };
}]);
