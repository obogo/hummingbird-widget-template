internal('dummerLabel', ['hb.directive', 'resolve'], function (directive, resolve) {
    directive('dummerLabel', function () {
        return {
            scope: true,
            tplUrl: "dummer/label/label",
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
