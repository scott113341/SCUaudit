app.directive('inProgressLabel', function() {
  return {
    template: '<span class="label">In Progress</span>',
    replace: true,

    link: function(scope, element, attrs) {
      var in_progress = scope.$eval(attrs.inProgressLabel);

      if (in_progress) {
        element.addClass('label-warning');
      }
      else {
        element.hide();
      }
    }
  }
});
