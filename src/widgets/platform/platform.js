internal('platform', ['hb.directive', 'ready', 'ContactService'],
  function(directive, ready, ContactService) {

    ready(function() {
      document.body.insertAdjacentHTML("beforeEnd", '<platform></platform>');
    });

    directive('platform', function() {
      return {
        scope: true,
        tplUrl: 'platform/platform',
        link: ['scope', 'el', 'attr', function(scope, el, attr) {
          scope.model = {
            title: attr.title,
            text: ContactService.data.title
          };

          scope.addWidget = function(widgetScope) {
            console.log('widget added', widgetScope);
          };
        }]
      };
    });
  });
