internal('dummer', ['hb.directive', 'query', 'ContactService'], function (directive, query, ContactService) {
    directive('dummer', function () {
        return {
            scope: true,
            tplUrl: 'dummer/dummer',
            link: ['scope', 'el', 'alias', 'attr', function (scope, el, alias, attr) {
              // add class by alias name
              query(el).addClass(alias.name);

              // setup model
              if(!scope.model) {
                scope.model = {
                  title: attr.title,
                  text: ContactService.data
                };
              }
            }]
        };
    });
});
