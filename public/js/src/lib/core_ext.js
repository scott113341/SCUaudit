// same as Array.slice(), but end is inclusive
Array.prototype.lines = function(start, end) {
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
