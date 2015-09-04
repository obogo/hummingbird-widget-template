/* global internal */
define('app', ['module', 'dispatcher', 'ready', 'loader', 'findScriptUrls', 'forEach'],
  function(module, dispatcher, ready, loader, findScriptUrls, forEach) {

    var app = dispatcher(module('app'));

    app.preLink = function(el, directive) {
      if (directive.alias.name.indexOf('hb-') === -1 && directive.alias.name.indexOf('-') !== -1) {
        el.classList.add(directive.alias.name);
      }
    };

    var assets = ['dummer.css'];
    var urls = findScriptUrls(/dummer(\.min)?\.js$/i);
    if (urls.length) {
      var scriptUrl = urls[0].substring(0, urls[0].lastIndexOf('/'));
      var len = assets.length;
      for (var i = 0; i < len; i += 1) {
        assets[i] = scriptUrl + '/' + assets[i];
      }

      loader.load(assets, function() {
        ready(function() {
          var el = document.querySelector('dummer');
          if (el) {
            el.setAttribute('ng-non-bindable', '');
            app.bootstrap(el);
          }
        });
      });
    }

    return app;
  });
