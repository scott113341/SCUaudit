// same as Array.slice(), but end is inclusive
Array.prototype.lines = function(start, end) {
  return this.slice(start, end+1);
};
