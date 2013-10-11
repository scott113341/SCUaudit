app.directive('satisfiedLabel', function() {
  return {
    template: '<span class="label"></span>',
    replace: true,

    link: function(scope, element, attrs) {
      var satisfied = scope.$eval(attrs.satisfiedLabel);
      var label_class = (satisfied) ? 'label-success' : 'label-danger';
      var label_text  = (satisfied) ? 'Complete' : 'Incomplete';

      element
        .addClass(label_class)
        .text(label_text);
    }
  }
});
