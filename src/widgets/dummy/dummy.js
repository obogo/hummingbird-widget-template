internal('dummy', ['hb.directive', 'query', 'ContactService'], function (directive, query, ContactService) {
    directive('dummy', function () {
        return {
            scope: true,
            tplUrl: 'dummy/dummy',
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
