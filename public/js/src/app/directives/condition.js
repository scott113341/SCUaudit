app.directive('condition', function() {
  return {
    templateUrl: 'condition.html',
    replace: true,

    link: function(scope, element, attrs) {
      scope.$eval(attrs.condition);

      // calculate width
      var required = scope.condition.values[0];
      var actual   = scope.condition.values[1];
      var width    = actual / required * 100;

      // set scope models
      scope.percent  = width;

      // calculate label class
      var label_class;
      switch (true) {
        case (width === 0):
          label_class = 'progress-bar-danger';
          width = 5; // for 0% done, show a little bit of label
          break;
        case (width >= 100):
          label_class = 'progress-bar-success';
          break;
        default:
          label_class = 'progress-bar-warning';
      }

      // apply styling
      element.find('.progress-bar').css('width', width + '%');
      element.find('.progress-bar').addClass(label_class);
    }
  }
});
