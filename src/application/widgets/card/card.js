internal('card', ['hb.directive', 'query', 'ContactService', 'resolve'], function (directive, query, ContactService, resolve) {
    directive('card', function () {
        return {
            scope: true,
            tplUrl: 'widgets/card/card',
            link: ['scope', 'el', 'alias', 'attr', function (scope, el, alias, attr) {
              console.log('whois', alias, resolve(scope).get(alias.value));

              scope.contact = resolve(scope).get(alias.value);
              // add class by alias name
              query(el).addClass(alias.name);

              scope.update = function() {
                scope.contact.name += ' ( •_•)';
                // resolve(scope).set(alias.value, 'Goodbye.');
              };
            }]
        };
    });
});
