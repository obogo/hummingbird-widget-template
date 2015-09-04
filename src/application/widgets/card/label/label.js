internal('cardLabel', ['hb.directive'], function (directive) {
    directive('cardLabel', function () {
        return {
            scope: true,
            tplUrl: "widgets/card/label/label",
            link: ['scope', 'el', 'alias', function (scope, el, alias) {
                scope.$watch(alias.value, function(newVal){
                  scope.text = newVal;
                });
            }]
        };
    });
});
