internal('application', ['app', 'hb.directive','ContactService'],
  function(app, directive, ContactService) {

    // :: PUBLIC API ::
    exports.boot = function() {
      document.body.insertAdjacentHTML("beforeEnd", '<application class="hb"></application>');
      app.bootstrap(document.body);
    };

    directive('application', function() {
      return {
        scope: true,
        tplUrl: 'application',
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
