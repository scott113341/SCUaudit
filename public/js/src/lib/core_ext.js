// same as Array.slice(), but end is inclusive
Array.prototype.lines = function(start, end) {
  if (end === undefined) {
    end = this.length;
  }

  return this.slice(start, end+1);
};


// return last element in an array
Array.prototype.last = function() {
  return this[this.length - 1];
};


// return all of the exec() matches in an array
RegExp.prototype.execs = function(string) {
  var match;
  var matches = [];

  while (match = this.exec(string)) {
    matches.push(match);
  }

  return matches;
};


// get the 0-indexed line number of a string index
String.prototype.lineNumber = function(index) {
  var i;
  var line = 0;

  for (i=0; i<index; i++) {
    if (this[i] === "\n") line++;
  }

  return line;
};


// return the number of leading spaces on a string
String.prototype.leadingSpaces = function() {
  var i = 0;

  while (this[i] === " ") {
    i++;
  }

  return i;
};
