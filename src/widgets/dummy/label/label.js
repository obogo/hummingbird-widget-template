internal('dummyLabel', ['hb.directive', 'resolve'], function (directive, resolve) {
    directive('dummyLabel', function () {
        return {
            scope: true,
            tplUrl: "dummy/label/label",
            link: ['scope', 'el', 'alias', function (scope, el, alias) {
                scope.$watch(alias.value, function(newVal){
                  scope.text = newVal;
                });

                scope.update = function() {
                  resolve(scope).set(alias.value, 'Goodbye.');
                };
            }]
        };
    });
});
