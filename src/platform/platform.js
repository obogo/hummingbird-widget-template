internal('platform', ['app', 'hb.directive','ContactService'],
  function(app, directive, ContactService) {

    // :: PUBLIC API ::
    exports.boot = function() {
      document.body.insertAdjacentHTML("beforeEnd", '<platform class="obogo"></platform>');
      app.bootstrap(document.body);
    };

    directive('platform', function() {
      return {
        scope: true,
        tplUrl: 'platform',
        link: ['scope', 'el', 'attr', function(scope, el, attr) {
          scope.model = {
            title: attr.title,
            text: ContactService.data.title,
            list: [
              { name: "John Smith"},
              { name: "Jane Doe"},
            ]
          };

          scope.addWidget = function(widgetScope) {
            console.log('widget added', widgetScope);
          };

          delete exports.$$;
        }]
      };
    });
  });
