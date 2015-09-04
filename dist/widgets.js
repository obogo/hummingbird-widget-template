(function(exports, global) {
    global["obogo"] = exports;
    var $$ = exports.$$ || function(name) {
        if (!$$[name]) {
            $$[name] = {};
        }
        return $$[name];
    };
    var cache = $$("c");
    var internals = $$("i");
    var pending = $$("p");
    exports.$$ = $$;
    var toArray = function(args) {
        return Array.prototype.slice.call(args);
    };
    var _ = function(name) {
        var args = toArray(arguments);
        var val = args[1];
        if (typeof val === "function") {
            this.c[name] = val();
        } else {
            cache[name] = args[2];
            cache[name].$inject = val;
            cache[name].$internal = this.i;
        }
    };
    var define = function() {
        _.apply({
            i: false,
            c: exports
        }, toArray(arguments));
    };
    var internal = function() {
        _.apply({
            i: true,
            c: internals
        }, toArray(arguments));
    };
    var resolve = function(name, fn) {
        pending[name] = true;
        var injections = fn.$inject;
        var args = [];
        var injectionName;
        for (var i in injections) {
            if (injections.hasOwnProperty(i)) {
                injectionName = injections[i];
                if (cache[injectionName]) {
                    if (pending.hasOwnProperty(injectionName)) {
                        throw new Error('Cyclical reference: "' + name + '" referencing "' + injectionName + '"');
                    }
                    resolve(injectionName, cache[injectionName]);
                    delete cache[injectionName];
                }
            }
        }
        if (!exports[name] && !internals[name]) {
            for (var n in injections) {
                injectionName = injections[n];
                args.push(exports.hasOwnProperty(injectionName) && exports[injectionName] || internals.hasOwnProperty(injectionName) && internals[injectionName]);
            }
            if (fn.$internal) {
                internals[name] = fn.apply(null, args) || name;
            } else {
                exports[name] = fn.apply(null, args) || name;
            }
        }
        Object.defineProperty(exports, "$$", {
            enumerable: false,
            writable: false
        });
        delete pending[name];
    };
    //! node_modules/hbjs/src/utils/validators/isFunction.js
    internal("isFunction", function() {
        var isFunction = function(val) {
            return typeof val === "function";
        };
        return isFunction;
    });
    //! src/widgets/bootstrap.js
    internal("app", [ "module", "dispatcher", "ready", "loader", "findScriptUrls", "forEach" ], function(module, dispatcher, ready, loader, findScriptUrls, forEach) {
        var name = "widgets";
        var app = dispatcher(module("app"));
        app.preLink = function(el, directive) {
            if (directive.alias.name.indexOf("hb-") === -1 && directive.alias.name.indexOf("-") !== -1) {
                el.classList.add(directive.alias.name);
                el.setAttribute("ng-non-bindable", "");
            }
        };
        var assets = [ name + ".css" ];
        var urls = findScriptUrls(new RegExp(name + "(.min)?.js$"), "i");
        if (urls.length) {
            var scriptUrl = urls[0].substring(0, urls[0].lastIndexOf("/"));
            var len = assets.length;
            for (var i = 0; i < len; i += 1) {
                assets[i] = scriptUrl + "/" + assets[i];
            }
            loader.load(assets, function() {
                ready(function() {
                    app.bootstrap(document.body);
                });
            });
        }
        return app;
    });
    //! node_modules/hbjs/src/hb/directives/model.js
    internal("hbd.model", [ "hb.directive", "resolve", "query", "hb.debug", "throttle" ], function(directive, resolve, query, debug, throttle) {
        directive("hbModel", function() {
            var $ = query;
            return {
                link: [ "scope", "el", "alias", function(scope, el, alias) {
                    var $el = $(el);
                    scope.$watch(alias.value, setValue);
                    function getProp() {
                        if (el.hasOwnProperty("value") || el.__proto__.hasOwnProperty("value")) {
                            return "value";
                        } else if (el.hasOwnProperty("innerText") || el.__proto__.hasOwnProperty("innerText")) {
                            return "innerText";
                        }
                    }
                    function setValue(value) {
                        value = value === undefined ? "" : value;
                        el[getProp()] = value;
                    }
                    function getValue() {
                        return el[getProp()] || "";
                    }
                    function eventHandler(evt) {
                        resolve(scope).set(alias.value, getValue());
                        var change = el.getAttribute("hb-change");
                        if (change) {
                            scope.$eval(change);
                        }
                        scope.$apply();
                    }
                    $el.bind("change keyup blur input onpropertychange", throttle(eventHandler, 10));
                    scope.$on("$destroy", function() {
                        $el.unbindAll();
                    });
                } ]
            };
        });
    });
    //! node_modules/hbjs/src/utils/query/event/bind.js
    internal("query.bind", [ "query" ], function(query) {
        query.fn.bind = query.fn.on = function(events, handler) {
            events = events.match(/\w+/gim);
            var i = 0, event, len = events.length;
            while (i < len) {
                event = events[i];
                this.each(function(index, el) {
                    if (el.attachEvent) {
                        el["e" + event + handler] = handler;
                        el[event + handler] = function() {
                            el["e" + event + handler](window.event);
                        };
                        el.attachEvent("on" + event, el[event + handler]);
                    } else {
                        el.addEventListener(event, handler, false);
                    }
                    if (!el.eventHolder) {
                        el.eventHolder = [];
                    }
                    el.eventHolder[el.eventHolder.length] = [ event, handler ];
                });
                i += 1;
            }
            return this;
        };
    });
    //! node_modules/hbjs/src/utils/query/query.js
    internal("query", function() {
        function Query(selector, context) {
            this.init(selector, context);
        }
        var queryPrototype = Query.prototype = Object.create(Array.prototype);
        var eqRx = /:eq\((\d+)\)$/;
        function parseEQFilter(scope, selector) {
            var match, count;
            match = selector.indexOf(":eq(");
            if (match !== -1) {
                match = selector.match(eqRx);
                selector = selector.replace(eqRx, "");
                count = match[1] !== undefined ? Number(match[1]) : -1;
                var nodes = scope.context.querySelectorAll(selector);
                if (count !== undefined) {
                    if (nodes[count]) {
                        scope.push(nodes[count]);
                    }
                    return true;
                }
            }
            return false;
        }
        queryPrototype.selector = "";
        function getElementClass(context) {
            var win = window;
            if (context) {
                if (context.parentWindow) {
                    win = context.parentWindow;
                } else if (context.defaultWindow) {
                    win = context.defaultWindow;
                }
            }
            return win.Element;
        }
        queryPrototype.init = function(selector, context) {
            this.context = context;
            var ElementClass = getElementClass(context);
            if (typeof selector === "string") {
                if (selector.substr(0, 1) === "<" && selector.substr(selector.length - 1, 1) === ">") {
                    this.parseHTML(selector);
                } else {
                    this.parseSelector(selector, context);
                }
            } else if (selector instanceof Array) {
                this.parseArray(selector);
            } else if (selector instanceof ElementClass) {
                this.parseElement(selector);
            }
        };
        queryPrototype.parseHTML = function(html) {
            var container = document.createElement("div");
            container.innerHTML = html;
            this.length = 0;
            this.parseArray(container.children);
        };
        queryPrototype.parseSelector = function(selector, context) {
            var ElementClass = getElementClass(context);
            var i, nodes, len;
            this.selector = selector;
            if (context instanceof ElementClass) {
                this.context = context;
            } else if (context instanceof Query) {
                this.context = context[0];
            } else if (context.nodeType === 9) {
                this.context = context;
            } else {
                this.context = document;
            }
            if (!parseEQFilter(this, selector)) {
                nodes = this.context.querySelectorAll(selector);
                len = nodes.length;
                i = 0;
                this.length = 0;
                while (i < len) {
                    this.push(nodes[i]);
                    i += 1;
                }
            }
        };
        queryPrototype.parseArray = function(list) {
            var ElementClass = (this.context.parentWindow || this.context.defaultView).Element;
            var i = 0, len = list.length;
            this.length = 0;
            while (i < len) {
                if (list[i] instanceof ElementClass) {
                    this.push(list[i]);
                }
                i += 1;
            }
        };
        queryPrototype.parseElement = function(element) {
            this.length = 0;
            this.push(element);
        };
        queryPrototype.toString = function() {
            if (this.length) {
                return this[0].outerHTML;
            }
        };
        queryPrototype.each = function(fn) {
            var i = 0, len = this.length, result;
            while (i < len) {
                result = fn.apply(this[i], [ i, this[i] ]);
                if (result === false) {
                    break;
                }
                i += 1;
            }
            return this;
        };
        var query = function(selector, context) {
            for (var n in query.fn) {
                if (query.fn.hasOwnProperty(n)) {
                    queryPrototype[n] = query.fn[n];
                    delete query.fn[n];
                }
            }
            return new Query(selector, context);
        };
        query.fn = {};
        return query;
    });
    //! node_modules/hbjs/src/utils/query/focus/focus.js
    //! pattern /("|')query\1/
    internal("query.focus", [ "query" ], function(query) {
        query.fn.focus = function(val) {
            this.each(function(index, el) {
                el.focus();
            });
            return this;
        };
    });
    //! node_modules/hbjs/src/utils/query/focus/select.js
    //! pattern /("|')query\1/
    //! import query.val
    internal("query.cursor", [ "query" ], function(query) {
        query.fn.getCursorPosition = function() {
            if (this.length === 0) {
                return -1;
            }
            return query(this, this.context).getSelectionStart();
        };
        query.fn.setCursorPosition = function(position) {
            if (this.length === 0) {
                return this;
            }
            return query(this, this.context).setSelection(position, position);
        };
        query.fn.getSelection = function() {
            if (this.length === 0) {
                return -1;
            }
            var s = query(this, this.context).getSelectionStart();
            var e = query(this, this.context).getSelectionEnd();
            return this[0].value.substring(s, e);
        };
        query.fn.getSelectionStart = function() {
            if (this.length === 0) {
                return -1;
            }
            var input = this[0];
            var pos = input.value.length;
            if (input.createTextRange) {
                var r = document.selection.createRange().duplicate();
                r.moveEnd("character", input.value.length);
                if (r.text === "") {
                    pos = input.value.length;
                }
                pos = input.value.lastIndexOf(r.text);
            } else if (typeof input.selectionStart !== "undefined") {
                pos = input.selectionStart;
            }
            return pos;
        };
        query.fn.getSelectionEnd = function() {
            if (this.length === 0) {
                return -1;
            }
            var input = this[0];
            var pos = input.value.length;
            if (input.createTextRange) {
                var r = document.selection.createRange().duplicate();
                r.moveStart("character", -input.value.length);
                if (r.text === "") {
                    pos = input.value.length;
                }
                pos = input.value.lastIndexOf(r.text);
            } else if (typeof input.selectionEnd !== "undefined") {
                pos = input.selectionEnd;
            }
            return pos;
        };
        query.fn.setSelection = function(selectionStart, selectionEnd) {
            if (this.length === 0) {
                return this;
            }
            var input = this[0];
            if (input.createTextRange) {
                var range = input.createTextRange();
                range.collapse(true);
                range.moveEnd("character", selectionEnd);
                range.moveStart("character", selectionStart);
                range.select();
            } else if (input.setSelectionRange) {
                input.setSelectionRange(selectionStart, selectionEnd);
            }
            return this;
        };
        query.fn.setSelectionRange = function(range) {
            var element = query(this, this.context);
            switch (range) {
              case "start":
                element.setSelection(0, 0);
                break;

              case "end":
                element.setSelection(element.val().length, element.val().length);
                break;

              case true:
              case "all":
                element.setSelection(0, element.val().length);
                break;
            }
        };
        query.fn.select = function() {
            this.setSelectionRange(true);
        };
    });
    //! node_modules/hbjs/src/utils/query/modify/val.js
    internal("query.val", [ "query" ], function(query) {
        query.fn.val = function(value) {
            var el, result, i, len, options;
            if (this.length) {
                el = this[0];
                if (arguments.length) {
                    el.value = value;
                } else {
                    if (el.nodeName === "SELECT" && el.multiple) {
                        result = [];
                        i = 0;
                        options = el.options;
                        len = options.length;
                        while (i < len) {
                            if (options) {
                                result.push(options[i].value || options[0].text);
                            }
                        }
                        return result.length === 0 ? null : result;
                    }
                    return el.value;
                }
            }
        };
    });
    //! node_modules/hbjs/src/utils/query/mutate/replace.js
    //! pattern /(\w+|\))\.replace\(/
    //! pattern /("|')query\1/
    internal("query.replace", [ "query" ], function(query) {
        query.fn.replace = function(val) {
            if (this.length) {
                var el = this[0];
                if (arguments.length > 0) {
                    this.each(function(index, el) {
                        el.innerHTML = val;
                    });
                }
                return el.innerHTML;
            }
        };
    });
    //! node_modules/hbjs/src/utils/query/event/unbind.js
    internal("query.unbind", [ "query" ], function(query) {
        query.fn.unbind = query.fn.off = function(events, handler) {
            if (arguments.length === 1) {
                this.unbindAll(events);
            } else {
                events = events.match(/\w+/gim);
                var i = 0, event, len = events.length;
                while (i < len) {
                    event = events[i];
                    this.each(function(index, el) {
                        if (el.detachEvent) {
                            el.detachEvent("on" + event, el[event + handler]);
                            el[event + handler] = null;
                        } else {
                            el.removeEventListener(event, handler, false);
                        }
                    });
                    i += 1;
                }
            }
            return this;
        };
    });
    //! node_modules/hbjs/src/utils/query/event/unbindAll.js
    internal("query.unbindAll", [ "query" ], function(query) {
        query.fn.unbindAll = function(event) {
            var scope = this;
            scope.each(function(index, el) {
                if (el.eventHolder) {
                    var removed = 0, handler;
                    for (var i = 0; i < el.eventHolder.length; i++) {
                        if (!event || el.eventHolder[i][0] === event) {
                            event = el.eventHolder[i][0];
                            handler = el.eventHolder[i][1];
                            if (el.detachEvent) {
                                el.detachEvent("on" + event, el[event + handler]);
                                el[event + handler] = null;
                            } else {
                                el.removeEventListener(event, handler, false);
                            }
                            el.eventHolder.splice(i, 1);
                            removed += 1;
                            i -= 1;
                        }
                    }
                }
            });
            return scope;
        };
    });
    //! node_modules/hbjs/src/hb/utils/directive.js
    internal("hb.directive", [ "hb.val" ], function(val) {
        return val;
    });
    //! node_modules/hbjs/src/hb/utils/val.js
    internal("hb.val", function() {
        var cache = {};
        var val = function(name, fn) {
            if (typeof fn === "undefined") {
                return cache[name];
            }
            cache[name] = fn;
        };
        val.init = function(app) {
            for (var name in cache) {
                app.val(name, cache[name]);
            }
        };
        return val;
    });
    //! node_modules/hbjs/src/utils/data/resolve.js
    internal("resolve", [ "isUndefined" ], function(isUndefined) {
        function Resolve(data) {
            this.data = data || {};
        }
        var proto = Resolve.prototype;
        proto.get = function(path, delimiter) {
            path = path || "";
            var arr = path.split(delimiter || "."), space = "", i = 0, len = arr.length;
            var data = this.data;
            while (i < len) {
                space = arr[i];
                data = data[space];
                if (data === undefined) {
                    break;
                }
                i += 1;
            }
            return data;
        };
        proto.set = function(path, value, delimiter) {
            if (isUndefined(path)) {
                throw new Error('Resolve requires "path"');
            }
            var arr = path.split(delimiter || "."), space = "", i = 0, len = arr.length - 1;
            var data = this.data;
            while (i < len) {
                space = arr[i];
                if (data[space] === undefined) {
                    data = data[space] = {};
                } else {
                    data = data[space];
                }
                i += 1;
            }
            if (arr.length > 0) {
                data[arr.pop()] = value;
            }
            return this.data;
        };
        proto.clear = function() {
            var d = this.data;
            for (var e in d) {
                if (d.hasOwnProperty(e)) {
                    delete d[e];
                }
            }
        };
        proto.path = function(path) {
            return this.set(path, {});
        };
        var resolve = function(data) {
            return new Resolve(data);
        };
        return resolve;
    });
    //! node_modules/hbjs/src/utils/validators/isUndefined.js
    internal("isUndefined", function() {
        var isUndefined = function(val) {
            return typeof val === "undefined";
        };
        return isUndefined;
    });
    //! node_modules/hbjs/src/hb/debug/debug.js
    internal("hb.debug", function() {
        var errors = {
            E0: "",
            E1: "",
            E2: "",
            E3: "",
            E4: "",
            E5: "",
            E6a: "",
            E6b: "",
            E7: "",
            E8: "",
            E9: "",
            E10: "",
            E11: "",
            E12: ""
        };
        var fn = function() {};
        var statItem = {
            clear: fn,
            next: fn,
            inc: fn,
            dec: fn
        };
        var db = {
            log: fn,
            info: fn,
            warn: fn,
            error: fn,
            stat: function() {
                return statItem;
            },
            getStats: fn,
            flushStats: fn
        };
        for (var i in errors) {
            errors[i] = i;
        }
        return {
            register: function() {
                return db;
            },
            liveStats: fn,
            getStats: fn,
            logStats: fn,
            stats: fn,
            errors: errors
        };
    });
    //! node_modules/hbjs/src/utils/async/throttle.js
    internal("throttle", function() {
        var throttle = function(func, threshhold, scope) {
            threshhold = threshhold || 250;
            var last, deferTimer;
            return function() {
                var context = scope || this;
                var now = +new Date(), args = arguments;
                if (last && now < last + threshhold) {
                    clearTimeout(deferTimer);
                    deferTimer = setTimeout(function() {
                        last = now;
                        func.apply(context, args);
                    }, threshhold);
                } else {
                    last = now;
                    func.apply(context, args);
                }
            };
        };
        return throttle;
    });
    //! node_modules/hbjs/src/hb/directives/events.js
    //! pattern /hb\-(click|mousedown|mouseup|keydown|keyup|touchstart|touchend|touchmove|animation\-start|animation\-end)\=/
    internal("hbd.events", [ "hb", "hb.val", "each" ], function(hb, val, each) {
        var UI_EVENTS = "click mousedown mouseup mouseover mouseout keydown keyup touchstart touchend touchmove".split(" ");
        var pfx = [ "webkit", "moz", "MS", "o", "" ];
        var ANIME_EVENTS = "AnimationStart AnimationEnd".split(" ");
        function onAnime(element, eventType, callback) {
            for (var p = 0; p < pfx.length; p++) {
                if (!pfx[p]) {
                    eventType = eventType.toLowerCase();
                }
                element.addEventListener(pfx[p] + eventType, callback, false);
            }
        }
        function offAnime(element, eventType, callback) {
            for (var p = 0; p < pfx.length; p++) {
                if (!pfx[p]) {
                    eventType = eventType.toLowerCase();
                }
                element.addEventListener(pfx[p] + eventType, callback, false);
            }
        }
        each(ANIME_EVENTS, function(eventName) {
            val("hb" + eventName, [ "$app", function($app) {
                return {
                    link: [ "scope", "el", "alias", function(scope, el, alias) {
                        var bindOnce = scope.$isBindONce(alias.value);
                        function unlisten() {
                            offAnime(el, eventName, handle);
                        }
                        function handle(evt) {
                            if (evt.currentTarget.nodeName.toLowerCase() === "a") {
                                evt.preventDefault();
                            }
                            scope.$event = evt;
                            bindOnce && unlisten();
                            if (evt.target === el) {
                                $app.interpolate(scope, alias.value);
                                scope.$apply();
                            }
                            return false;
                        }
                        onAnime(el, eventName, handle);
                        scope.$on("$destroy", unlisten);
                    } ]
                };
            } ], "event");
        });
        each(UI_EVENTS, function(eventName) {
            val("hb" + eventName.charAt(0).toUpperCase() + eventName.substr(1), [ "$app", function($app) {
                return {
                    link: [ "scope", "el", "alias", function(scope, el, alias) {
                        var bindOnce = scope.$isBindOnce(alias.value);
                        function unlisten() {
                            hb.off(el, eventName, handle);
                        }
                        function handle(evt) {
                            if (evt.currentTarget.nodeName.toLowerCase() === "a") {
                                evt.preventDefault();
                            }
                            scope.$event = evt;
                            bindOnce && unlisten();
                            $app.interpolate(scope, alias.value);
                            scope.$apply();
                            return false;
                        }
                        hb.on(el, eventName, handle);
                        scope.$on("$destroy", unlisten);
                    } ]
                };
            } ], "event");
        });
    });
    //! node_modules/hbjs/src/hb/hb.js
    internal("hb", function() {
        var hb = {
            debug: {},
            plugins: {},
            filters: {},
            errors: {},
            directives: {}
        };
        var ON_STR = "on";
        hb.on = function(el, eventName, handler) {
            if (el.attachEvent) {
                el.attachEvent(ON_STR + eventName, el[eventName + handler]);
            } else {
                el.addEventListener(eventName, handler, false);
            }
        };
        hb.off = function(el, eventName, handler) {
            if (el.detachEvent) {
                el.detachEvent(ON_STR + eventName, el[eventName + handler]);
            } else {
                el.removeEventListener(eventName, handler, false);
            }
        };
        return hb;
    });
    //! node_modules/hbjs/src/utils/array/each.js
    internal("each", function() {
        function applyMethod(scope, method, item, index, list, extraArgs, all) {
            var args = all ? [ item, index, list ] : [ item ];
            return method.apply(scope, args.concat(extraArgs));
        }
        var each = function(list, method) {
            var i = 0, len, result, extraArgs;
            if (arguments.length > 2) {
                extraArgs = Array.prototype.slice.apply(arguments);
                extraArgs.splice(0, 2);
            }
            if (list && list.length && list.hasOwnProperty(0)) {
                len = list.length;
                while (i < len) {
                    result = applyMethod(this.scope, method, list[i], i, list, extraArgs, this.all);
                    if (result !== undefined) {
                        return result;
                    }
                    i += 1;
                }
            } else if (!(list instanceof Array) && list.length === undefined) {
                for (i in list) {
                    if (list.hasOwnProperty(i) && (!this.omit || !this.omit[i])) {
                        result = applyMethod(this.scope, method, list[i], i, list, extraArgs, this.all);
                        if (result !== undefined) {
                            return result;
                        }
                    }
                }
            }
            return list;
        };
        return each;
    });
    //! node_modules/hbjs/src/hb/utils/compiler.js
    internal("hb.compiler", [ "each", "fromDashToCamel" ], function(each, fromDashToCamel) {
        function Compiler($app) {
            var ID = $app.name + "-id";
            var injector = $app.injector;
            var interpolator = $app.interpolator;
            var self = this;
            var bindParseRx;
            function extend(target, source) {
                var args = Array.prototype.slice.call(arguments, 0), i = 1, len = args.length, item, j;
                while (i < len) {
                    item = args[i];
                    for (j in item) {
                        if (item.hasOwnProperty(j)) {
                            target[j] = source[j];
                        }
                    }
                    i += 1;
                }
                return target;
            }
            function removeComments(el, parent) {
                if (el) {
                    if (el.nodeType === 8) {
                        parent.removeChild(el);
                    } else if (el.childNodes) {
                        each(el.childNodes, removeComments, el);
                    }
                } else {
                    return true;
                }
            }
            function cleanBindOnce(str, scope, watchId) {
                str = str.trim();
                str = scope.$handleBindOnce && scope.$handleBindOnce(str, null, watchId) || str;
                return str;
            }
            function parseBinds(str, o, watchId) {
                if (str && o) {
                    bindParseRx = bindParseRx || new RegExp($app.bindingMarkup[0] + "(.*?)" + $app.bindingMarkup[1], "mg");
                    str = str.replace(bindParseRx, function(a, b) {
                        var r = interpolator.invoke(o, cleanBindOnce(b, o, watchId), true);
                        return typeof r === "string" || typeof r === "number" ? r : typeof r === "object" ? JSON.stringify(r, null, 2) : "";
                    });
                }
                return str;
            }
            function invokeLink(directive, el) {
                var scope = $app.findScope(el);
                injector.invoke(directive.options.link, scope, {
                    scope: scope,
                    el: el,
                    attr: getAttributes(el),
                    alias: directive.alias
                });
            }
            function getAttributes(el) {
                var attr = {}, i;
                for (i = 0; i < el.attributes.length; i += 1) {
                    var at = el.attributes[i];
                    var key = fromDashToCamel((at.name || at.localName || at.nodeName).replace(/^data\-/, ""));
                    attr[key] = at.value;
                }
                return attr;
            }
            function unlink() {
                if (this.$id) {
                    delete $app.elements[this.$id];
                }
            }
            function link(el, scope) {
                if (el) {
                    el.setAttribute(ID, scope.$id);
                    $app.elements[scope.$id] = el;
                    scope.$on("$destroy", unlink);
                    el.scope = scope;
                }
            }
            function findDirectives(el, scope) {
                var attributes = el.attributes, attrs = [ {
                    name: el.nodeName.toLowerCase(),
                    value: ""
                } ], attr, returnVal = [], i, len = attributes.length, name, directiveFn, leftovers = [];
                for (i = 0; i < len; i += 1) {
                    attr = attributes[i];
                    attrs.push({
                        name: attr.name,
                        value: el.getAttribute(attr.name)
                    });
                }
                len = attrs.length;
                for (i = 0; i < len; i += 1) {
                    attr = attrs[i];
                    name = attr ? attr.name.split("-").join("") : "";
                    directiveFn = injector.val(name);
                    if (directiveFn) {
                        returnVal.push({
                            options: injector.invoke(directiveFn),
                            alias: {
                                name: attr.name,
                                value: attr.value
                            }
                        });
                    } else if (attr.value && attr.value.indexOf($app.bindingMarkup[0]) !== -1) {
                        leftovers.push(attr);
                    }
                }
                len = leftovers.length;
                for (i = 0; i < len; i += 1) {
                    attr = leftovers[i];
                    el.setAttribute(attr.name, parseBinds(attr.value, el.scope || scope));
                }
                return returnVal;
            }
            function createChildScope(parentScope, el, isolated, data) {
                var scope = parentScope.$new(isolated);
                link(el, scope);
                extend(scope, data);
                return scope;
            }
            function createWatchers(node, scope) {
                if (node.nodeType === 3) {
                    if (node.nodeValue.indexOf($app.bindingMarkup[0]) !== -1 && !hasNodeWatcher(scope, node)) {
                        var value = node.nodeValue;
                        var watchId = scope.$watch(function() {
                            return parseBinds(value, scope, watchId);
                        }, function(newVal) {
                            if (newVal === undefined || newVal === null || newVal + "" === "NaN") {
                                newVal = "";
                            }
                            node.nodeValue = newVal;
                        });
                        scope.$w[0].node = node;
                    }
                } else if (!node.getAttribute(ID) && node.childNodes.length) {
                    each(node.childNodes, createWatchers, scope);
                }
            }
            function hasNodeWatcher(scope, node) {
                var i = 0, len = scope.$w.length;
                while (i < len) {
                    if (scope.$w[i].node === node) {
                        return true;
                    }
                    i += 1;
                }
                return false;
            }
            function compile(el, scope) {
                if (!el.compiled) {
                    el.compiled = true;
                    each(el.childNodes, removeComments, el);
                    var directives = findDirectives(el, scope), links = [];
                    if (directives && directives.length) {
                        each(directives, compileDirective, el, scope, links);
                        each(links, invokeLink, el);
                    }
                }
                if (el) {
                    scope = el.scope || scope;
                    var i = 0, len = el.children.length;
                    while (i < len) {
                        if (!el.children[i].compiled) {
                            compile(el.children[i], scope);
                        }
                        i += 1;
                    }
                    if (el.getAttribute(ID)) {
                        compileWatchers(el, scope);
                    }
                }
                return el;
            }
            function compileWatchers(el, scope) {
                each(el.childNodes, createWatchers, scope);
            }
            function compileDirective(directive, el, parentScope, links) {
                var options = directive.options, scope;
                if (!el.scope && options.scope) {
                    scope = createChildScope(parentScope, el, typeof directive.options.scope === "object", directive.options.scope);
                }
                if (options.tpl) {
                    el.innerHTML = typeof options.tpl === "string" ? options.tpl : injector.invoke(options.tpl, scope || el.scope, {
                        scope: scope || el.scope,
                        el: el,
                        alias: directive.alias
                    });
                }
                if (options.tplUrl) {
                    el.innerHTML = $app.val(typeof options.tplUrl === "string" ? options.tplUrl : injector.invoke(options.tplUrl, scope || el.scope, {
                        scope: scope || el.scope,
                        el: el,
                        alias: directive.alias
                    }));
                }
                if ($app.preLink) {
                    $app.preLink(el, directive);
                }
                links.push(directive);
            }
            self.link = link;
            self.compile = compile;
            self.parseBinds = parseBinds;
            self.preLink = null;
        }
        return function(module) {
            return new Compiler(module);
        };
    });
    //! node_modules/hbjs/src/utils/formatters/fromDashToCamel.js
    internal("fromDashToCamel", function() {
        var rx = /-([a-z])/g;
        function fn(g) {
            return g[1].toUpperCase();
        }
        return function(str) {
            return str.replace(rx, fn);
        };
    });
    //! node_modules/hbjs/src/hb/scope.js
    internal("hb.scope", [ "hb.debug", "apply" ], function(debug, apply) {
        var DESTROY = "$destroy";
        var EMIT = "$emit";
        var BROADCAST = "$broadcast";
        var prototype = "prototype";
        var err = "error";
        var winConsole = console;
        var counter = 0;
        var watchCounter = 0;
        var destroying = {};
        var unwatching = [];
        var watchers = {};
        var db = debug.register("scope");
        var scopeCountStat = db.stat("scope count");
        var watchCount = db.stat("watch count");
        var digestStat = db.stat("$digest");
        var ignoreStat = db.stat("$ignore", "#CCC");
        var intv;
        var intvMax = 10;
        function toArgsArray(args) {
            return Array[prototype].slice.call(args, 0) || [];
        }
        function every(list, fn) {
            var returnVal = false;
            var i = 0, len = list.length;
            while (i < len) {
                if (fn(list[i])) {
                    returnVal = true;
                }
                i += 1;
            }
            return returnVal;
        }
        function isEqual(newValue, oldValue, deep) {
            if (deep) {
                return JSON.stringify(newValue) === oldValue;
            }
            return newValue === oldValue || typeof newValue === "number" && typeof oldValue === "number" && isNaN(newValue) && isNaN(oldValue);
        }
        function countScopes(scope) {
            var c = 1;
            for (var i = 0, len = scope.$c.length; i < len; i += 1) {
                c += countScopes(scope.$c[i]);
            }
            return c;
        }
        function execWatchers(scope) {
            if (scope.$$ignore) {
                ignoreStat.inc(countScopes(scope));
                return false;
            }
            digestStat.inc();
            var newValue, oldValue;
            var i = scope.$w.length;
            var watcher;
            var dirty = false;
            while (i--) {
                watcher = scope.$w[i];
                if (watcher && !watcher.dead) {
                    newValue = watcher.watchFn(scope);
                    oldValue = watcher.last;
                    if (newValue !== undefined && watcher.unwatchOnValue) {
                        unwatch(watcher.id);
                    }
                    if (!isEqual(newValue, oldValue, watcher.deep) || oldValue === initWatchVal) {
                        scope.$r.$lw = watcher;
                        watcher.last = watcher.deep ? JSON.stringify(newValue) : newValue;
                        if (scope.$benchmark) {
                            scope.$benchmark.watch(watcher, scope, newValue, oldValue === initWatchVal ? newValue : oldValue);
                        } else {
                            watcher.listenerFn(newValue, oldValue === initWatchVal ? newValue : oldValue, scope);
                        }
                        if (oldValue === initWatchVal) {
                            watcher.last = oldValue = undefined;
                        }
                        dirty = true;
                    } else if (scope.$r.$lw === watcher) {
                        return dirty;
                    }
                }
            }
            return dirty;
        }
        function destroyChildren(scope, children) {
            if (children[0]) {
                children.pop()[DESTROY]();
                setTimeout(function() {
                    destroyChildren(scope, children);
                });
            } else {
                finalizeDestroy(scope);
            }
        }
        function finalizeDestroy(scope) {
            var i, $id = scope.$id, wl = scope.$w.length;
            for (i = 0; i < wl; i += 1) {
                unwatch(scope.$w[i].id);
            }
            scope.$w.length = 0;
            for (i in scope.$l) {
                if (scope.$l.hasOwnProperty(i)) {
                    scope.$l[i].length = 0;
                }
            }
            for (i in scope) {
                if (scope.hasOwnProperty(i)) {
                    scope[i] = null;
                    delete scope[i];
                }
            }
            delete destroying[$id];
            scopeCountStat.dec();
        }
        function unwatchWatcher(scope, watcher) {
            if (!watcher.dead) {
                delete watchers[watcher.id];
                watcher.dead = true;
                watcher.scope = scope;
                unwatching.push(watcher);
                if (!intv) {
                    intv = setInterval(onInterval);
                }
            }
        }
        function onInterval() {
            var watcher, scope, i, index;
            for (i = 0; i < intvMax && i < unwatching.length; i += 1) {
                watcher = unwatching.shift();
                scope = watcher.scope;
                watchCount.dec();
                if (scope && scope.$w && scope.$w.length && (index = scope.$w.indexOf(watcher)) !== -1) {
                    if (index !== -1) {
                        scope.$w.splice(index, 1);
                        scope.$r.$lw = null;
                        scope = null;
                        delete watcher.scope;
                        watcher = null;
                    }
                }
            }
            if (!unwatching.length) {
                clearInterval(intv);
                intv = 0;
            }
        }
        function isBindOnce(str) {
            return !!(str && str[0] === ":" && str[1] === ":");
        }
        function handleBindOnce(context, property, watchId) {
            var type = typeof context;
            var str = type === "string" ? context : context[property];
            if (isBindOnce(str)) {
                str = str.substr(2, str.length);
                watchId && unwatch(watchId);
            }
            if (type !== "string") {
                context[property] = str;
            }
            return str;
        }
        function unwatchAfterValue() {
            this.unwatchOnValue = true;
        }
        function stringWatchInterceptor(str) {
            return handleBindOnce(str, null, unwatchAfterValue, this);
        }
        function strWatcher() {
            var s = this.scope;
            return s.$interpolate(s, this.expr, true);
        }
        function unwatch(watchId) {
            var w = watchers[watchId];
            if (w) {
                unwatchWatcher(w.scope, w);
            }
        }
        function generateId() {
            return (counter += 1).toString(36);
        }
        function initWatchVal() {}
        function Scope(interpolate) {
            var self = this;
            self.$id = generateId();
            self.$w = [];
            self.$lw = null;
            self.$aQ = [];
            self.$pQ = [];
            self.$r = self;
            self.$c = [];
            self.$l = {};
            self.$ph = null;
            self.$interpolate = interpolate;
            scopeCountStat.inc();
        }
        var scopePrototype = Scope.prototype;
        scopePrototype.$isBindOnce = isBindOnce;
        scopePrototype.$handleBindOnce = handleBindOnce;
        scopePrototype.$watchOnce = function(watchFn, listenFn, deep) {
            var watchId;
            if (typeof watchFn === "string") {
                return this.$watch("::" + watchFn, listenFn, deep);
            } else {
                watchId = this.$watch(function() {
                    unwatch(watchId);
                    apply(watchFn, this, arguments);
                }, listenFn, deep);
            }
        };
        scopePrototype.$unwatch = unwatch;
        scopePrototype.$watch = function(watchFn, listenerFn, deep) {
            var self = this, watcher;
            if (!watchFn) {
                return;
            }
            watcher = {
                id: watchCounter += 1,
                scope: self,
                expr: "",
                watchFn: watchFn,
                listenerFn: listenerFn || function() {},
                deep: !!deep,
                last: initWatchVal
            };
            if (typeof watchFn === "string") {
                watcher.expr = stringWatchInterceptor.call(watcher, watchFn);
                if (!watcher.expr) {
                    return;
                }
                watcher.watchFn = strWatcher;
            }
            self.$w.unshift(watcher);
            self.$r.$lw = null;
            self.$lw = null;
            watchers[watcher.id] = watcher;
            watchCount.inc();
            return watcher.id;
        };
        scopePrototype.$$digestOnce = function() {
            return this.$$scopes(execWatchers);
        };
        scopePrototype.$$getPhase = function() {
            return this.$r.$ph;
        };
        scopePrototype.$digest = function() {
            var ttl = 10;
            var dirty;
            var self = this;
            if (self.$$getPhase()) {
                return;
            }
            self.$r.$lw = null;
            self.$$beginPhase();
            do {
                while (self.$aQ.length) {
                    try {
                        var asyncTask = self.$aQ.shift();
                        asyncTask.scope.$eval(asyncTask.exp);
                    } catch (e) {
                        winConsole[err](e);
                    }
                }
                dirty = self.$$digestOnce();
                if ((dirty || self.$aQ.length) && !ttl--) {
                    self.$$clearPhase();
                    throw "10its";
                }
            } while (dirty || self.$aQ.length);
            while (self.$pQ.length) {
                try {
                    self.$pQ.shift()();
                } catch (e) {
                    winConsole[err](e);
                }
            }
            self.$$clearPhase();
        };
        scopePrototype.$eval = function(expr, locals) {
            var self = this;
            return self.$interpolate(locals || self, expr, true);
        };
        scopePrototype.$apply = function(expr) {
            var self = this;
            if (self.$r.$ph) {
                self.$r.$$apply_pending = {
                    expr: expr
                };
                return;
            }
            if (!self.$isIgnored()) {
                try {
                    if (expr) {
                        return self.$eval(expr);
                    }
                } finally {
                    self.$r.$digest();
                }
            }
            if (self.$r.$$apply_pending) {
                setTimeout(applyLater.bind(self));
            }
        };
        function applyLater() {
            if (this.$r.$$apply_pending) {
                var pend = this.$r.$$apply_pending;
                delete this.$r.$$apply_pending;
                this.$apply(pend.expr);
            }
        }
        scopePrototype.$evalAsync = function(expr) {
            var self = this;
            if (!self.$ph && !self.$aQ.length) {
                setTimeout(function() {
                    if (self.$aQ.length) {
                        self.$r.$digest();
                    }
                }, 0);
            }
            self.$aQ.push({
                scope: self,
                exp: expr
            });
        };
        scopePrototype.$$beginPhase = function() {
            this.$r.$ph = true;
            digestStat.next();
            ignoreStat.next();
        };
        scopePrototype.$$clearPhase = function() {
            this.$r.$ph = null;
        };
        scopePrototype.$$postDigest = function(fn) {
            this.$pQ.push(fn);
        };
        scopePrototype.$new = function(isolated) {
            var child, self = this;
            if (isolated) {
                child = new Scope(self.$interpolate);
                child.$r = self.$r;
                child.$aQ = self.$aQ;
                child.$pQ = self.$pQ;
            } else {
                var ChildScope = function() {};
                ChildScope.prototype = self;
                child = new ChildScope();
                scopeCountStat.inc();
            }
            self.$c.push(child);
            child.$id = generateId();
            child.$w = [];
            child.$l = {};
            child.$c = [];
            child.$p = self;
            return child;
        };
        scopePrototype.$isIgnored = function() {
            var self = this;
            var ignored = self.$$ignore, scope = self;
            while (!ignored && scope.$p) {
                scope = scope.$p;
                ignored = scope.$$ignore;
            }
            return !!ignored;
        };
        scopePrototype.$ignore = function(enabled, childrenOnly) {
            var self = this;
            if (enabled !== undefined) {
                every(self.$c, function(scope) {
                    scope.$$ignore = enabled;
                });
                if (!childrenOnly) {
                    self.$$ignore = enabled;
                }
                if (!enabled && !self.$isIgnored()) {
                    self.$digest();
                }
            }
        };
        scopePrototype.$ignoreEvents = function(enabled, childrenOnly) {
            var self = this;
            if (enabled !== undefined) {
                every(self.$c, function(scope) {
                    scope.$$ignoreEvents = enabled;
                });
                if (!childrenOnly) {
                    self.$$ignoreEvents = enabled;
                }
            }
        };
        scopePrototype.$$scopes = function(fn) {
            var self = this;
            var dirty = fn(self);
            var childrenDirty = every(self.$c, function(child) {
                return child.$$scopes(fn);
            });
            return dirty || childrenDirty;
        };
        scopePrototype[DESTROY] = function() {
            if (destroying[this.$id]) {
                return;
            }
            var self = this;
            var $id = self.$id;
            if (self === self.$r) {
                return;
            }
            destroying[$id] = true;
            self[BROADCAST](DESTROY);
            var siblings = self.$p.$c;
            var indexOfThis = siblings.indexOf(self);
            if (indexOfThis >= 0) {
                siblings.splice(indexOfThis, 1);
                destroyChildren(self, self.$c.slice());
            }
        };
        scopePrototype.$on = function(eventName, listener) {
            var self = this;
            var listeners = self.$l[eventName];
            if (!listeners) {
                self.$l[eventName] = listeners = [];
            }
            listeners.push(listener);
            return function() {
                var index = listeners.indexOf(listener);
                if (index >= 0) {
                    listeners[index] = null;
                }
            };
        };
        scopePrototype.$emit = function(eventName) {
            var self = this;
            if (self.$$ignoreEvents && self.eventName !== DESTROY) {
                return;
            }
            apply(db.log, db, [ EMIT ].concat(arguments));
            var propagationStopped = false;
            var event = {
                name: eventName,
                targetScope: self,
                stopPropagation: function() {
                    propagationStopped = true;
                },
                preventDefault: function() {
                    event.defaultPrevented = true;
                }
            };
            var additionalArgs = toArgsArray(arguments);
            additionalArgs.shift();
            var listenerArgs = [ event ].concat(additionalArgs);
            var scope = self;
            do {
                event.currentScope = scope;
                scope.$$fire(eventName, listenerArgs);
                scope = scope.$p;
            } while (scope && !propagationStopped);
            return event;
        };
        scopePrototype.$broadcast = function(eventName) {
            var self = this;
            if (self.$$ignoreEvents && self.eventName !== DESTROY) {
                return;
            }
            apply(db.log, db, [ BROADCAST ].concat(arguments));
            var event = {
                name: eventName,
                targetScope: self,
                preventDefault: function() {
                    event.defaultPrevented = true;
                }
            };
            var additionalArgs = toArgsArray(arguments);
            additionalArgs.shift();
            var listenerArgs = [ event ].concat(additionalArgs);
            if (eventName === DESTROY) {
                self.$$fire(eventName, listenerArgs);
                return event;
            }
            self.$$scopes(function(scope) {
                event.currentScope = scope;
                scope.$$fire(eventName, listenerArgs);
                return true;
            });
            return event;
        };
        scopePrototype.$$fire = function(eventName, listenerArgs) {
            var listeners = this.$l[eventName] || [];
            var i = 0;
            while (i < listeners.length) {
                if (listeners[i] === null) {
                    listeners.splice(i, 1);
                } else {
                    apply(listeners[i], this, listenerArgs);
                    i++;
                }
            }
            return event;
        };
        return function(interpolate) {
            return new Scope(interpolate);
        };
    });
    //! node_modules/hbjs/src/utils/data/apply.js
    internal("apply", function() {
        return function(func, scope, args) {
            args = args || [];
            switch (args.length) {
              case 0:
                return func.call(scope);

              case 1:
                return func.call(scope, args[0]);

              case 2:
                return func.call(scope, args[0], args[1]);

              case 3:
                return func.call(scope, args[0], args[1], args[2]);

              case 4:
                return func.call(scope, args[0], args[1], args[2], args[3]);

              case 5:
                return func.call(scope, args[0], args[1], args[2], args[3], args[4]);

              case 6:
                return func.call(scope, args[0], args[1], args[2], args[3], args[4], args[5]);
            }
            return func.apply(scope, args);
        };
    });
    //! node_modules/hbjs/src/utils/patterns/injector.js
    internal("injector", [ "isFunction", "toArray", "functionArgs", "apply" ], function(isFunction, toArray, functionArgs, apply) {
        var string = "string", func = "function", proto = Injector.prototype;
        function functionOrArray(fn) {
            var f;
            if (fn instanceof Array) {
                fn = fn.concat();
                f = fn.pop();
                f.$inject = fn;
                fn = f;
            }
            return fn;
        }
        function construct(constructor, args) {
            function F() {
                return apply(constructor, this, args);
            }
            F.prototype = constructor.prototype;
            return new F();
        }
        function Injector() {
            this.registered = {};
            this.preProcessor = null;
        }
        proto.val = function(name, value) {
            var n = name.toLowerCase(), override;
            if (value !== undefined) {
                this.registered[n] = value;
            } else if (this.preProcessor) {
                override = this.preProcessor(name, this.registered[n]);
                if (override !== undefined) {
                    this.registered[n] = override;
                }
            }
            return this.registered[n];
        };
        proto.invoke = function(fn, scope, locals) {
            fn = functionOrArray(fn);
            return apply(fn, scope, this.prepareArgs(fn, locals, scope));
        };
        proto.instantiate = function(fn, locals) {
            fn = functionOrArray(fn);
            return construct(fn, this.prepareArgs(fn, locals));
        };
        proto.prepareArgs = function(fn, locals, scope) {
            if (!fn.$inject) {
                fn.$inject = functionArgs(fn);
            }
            var args = fn.$inject ? fn.$inject.slice() : [], i, len = args.length;
            for (i = 0; i < len; i += 1) {
                this.getInjection(args[i], i, args, locals, scope);
            }
            return args;
        };
        proto.getArgs = functionArgs;
        proto.getInjection = function(type, index, list, locals, scope) {
            var result, cacheValue;
            if (locals && locals[type]) {
                result = locals[type];
            } else if ((cacheValue = this.val(type)) !== undefined) {
                result = cacheValue;
            }
            if (result === undefined) {
                console.warn("Injection not found for " + type);
                throw new Error("Injection not found for " + type);
            }
            if (result instanceof Array && typeof result[0] === string && typeof result[result.length - 1] === func) {
                result = this.invoke(result.concat(), scope);
            }
            list[index] = result;
        };
        return function() {
            var injector = new Injector();
            if (arguments.length && isFunction(arguments[0])) {
                return apply(injector.invoke, injector, toArray(arguments));
            }
            return injector;
        };
    });
    //! node_modules/hbjs/src/hb/module.js
    /*!
 import hbd.app
 import hbd.model
 import hbd.events
 import hb.directive
 */
    internal("module", [ "hb", "hb.compiler", "hb.scope", "hb.val", "injector", "interpolator", "removeHTMLComments", "each", "ready", "hb.debug", "hb.eventStash" ], function(hb, compiler, scope, val, injector, interpolator, removeHTMLComments, each, ready, debug, events) {
        events.RESIZE = "resize";
        var modules = {};
        function Module(name) {
            var self = this;
            self.name = name;
            var rootEl;
            var bootstraps = [];
            var _injector = this.injector = injector();
            var _interpolator = this.interpolator = interpolator(_injector);
            var _compiler = compiler(self);
            var compile = _compiler.compile;
            var interpolate = _interpolator.invoke;
            var injectorVal = _injector.val.bind(_injector);
            var rootScope = scope(interpolate);
            rootScope.$ignoreInterpolateErrors = true;
            window.addEventListener("resize", function() {
                rootScope && rootScope.$broadcast(events.RESIZE);
            });
            injectorVal("$rootScope", rootScope);
            _injector.preProcessor = function(key, value) {
                if (value && value.isClass) {
                    return _injector.instantiate(value);
                }
            };
            function findScope(el) {
                if (!el) {
                    return null;
                }
                if (el.scope) {
                    return el.scope;
                }
                return findScope(el.parentNode);
            }
            function bootstrap(el) {
                if (el) {
                    val.init(this);
                    self.element(el);
                    while (bootstraps.length) {
                        _injector.invoke(bootstraps.shift(), self);
                    }
                    rootScope.$broadcast(events.HB_READY, self);
                    rootScope.$apply();
                }
            }
            function addChild(parentEl, htmlStr, overrideScope, data, prepend) {
                if (!htmlStr) {
                    return;
                }
                if (parentEl !== rootEl && rootEl.contains && !rootEl.contains(parentEl)) {
                    throw new Error(debug.errors.E12, rootEl);
                }
                var scope = overrideScope || findScope(parentEl), child;
                if (prepend) {
                    parentEl.insertAdjacentHTML("afterbegin", removeHTMLComments(htmlStr));
                    child = parentEl.children[0];
                } else {
                    parentEl.insertAdjacentHTML("beforeend", removeHTMLComments(htmlStr));
                    child = parentEl.children[parentEl.children.length - 1];
                }
                return compileEl(child, overrideScope || scope, !!overrideScope, data);
            }
            function compileEl(el, scope, sameScope, data) {
                var s = sameScope && scope || scope.$new(), i;
                if (data) {
                    for (i in data) {
                        if (data.hasOwnProperty(i)) {
                            s[i] = data[i];
                        }
                    }
                }
                _compiler.link(el, s);
                compile(el, scope);
                return el;
            }
            function removeChild(childEl) {
                var list;
                if (childEl.scope) {
                    childEl.scope.$destroy();
                    childEl.scope = null;
                } else {
                    list = childEl.querySelectorAll(name + "-id");
                    each(list, removeChild);
                }
                childEl.remove();
            }
            function element(el) {
                if (typeof el !== "undefined") {
                    rootEl = el;
                    _compiler.link(rootEl, rootScope);
                    compile(rootEl, rootScope);
                }
                return rootEl;
            }
            function service(name, ClassRef) {
                if (ClassRef === undefined) {
                    return injectorVal(name);
                }
                ClassRef.isClass = true;
                return injectorVal(name, ClassRef);
            }
            self.bindingMarkup = [ "{{", "}}" ];
            self.elements = {};
            self.bootstrap = bootstrap;
            self.findScope = findScope;
            self.addChild = addChild;
            self.removeChild = removeChild;
            self.compile = compileEl;
            self.interpolate = interpolate;
            self.invoke = _injector.invoke.bind(_injector);
            self.element = element;
            self.val = injectorVal;
            self.factory = injectorVal;
            self.service = service;
            self.template = injectorVal;
            self.parseBinds = function(scope, str) {
                return _compiler.parseBinds(str, scope);
            };
        }
        return function(name, forceNew) {
            if (!name) {
                throw debug.errors.E8;
            }
            var app = modules[name] = !forceNew && modules[name] || new Module(name);
            if (!app.val("$app")) {
                app.val("$app", app);
                app.val("$window", window);
                setTimeout(function() {
                    ready(function() {
                        var el = document.querySelector("[" + name + "-app]");
                        if (el) {
                            app.bootstrap(el);
                        }
                    });
                });
            }
            return app;
        };
    });
    //! node_modules/hbjs/src/utils/formatters/toArray.js
    internal("toArray", [ "isArguments", "isArray", "isUndefined" ], function(isArguments, isArray, isUndefined) {
        var toArray = function(value) {
            if (isArguments(value)) {
                return Array.prototype.slice.call(value, 0) || [];
            }
            try {
                if (isArray(value)) {
                    return value;
                }
                if (!isUndefined(value)) {
                    return [].concat(value);
                }
            } catch (e) {}
            return [];
        };
        return toArray;
    });
    //! node_modules/hbjs/src/utils/validators/isArguments.js
    internal("isArguments", [ "toString" ], function(toString) {
        var isArguments = function(value) {
            var str = String(value);
            var isArguments = str === "[object Arguments]";
            if (!isArguments) {
                isArguments = str !== "[object Array]" && value !== null && typeof value === "object" && typeof value.length === "number" && value.length >= 0 && (!value.callee || toString.call(value.callee) === "[object Function]");
            }
            return isArguments;
        };
        return isArguments;
    });
    //! node_modules/hbjs/src/utils/validators/isArray.js
    internal("isArray", function() {
        Array.prototype.__isArray = true;
        Object.defineProperty(Array.prototype, "__isArray", {
            enumerable: false,
            writable: true
        });
        var isArray = function(val) {
            return val ? !!val.__isArray : false;
        };
        return isArray;
    });
    //! node_modules/hbjs/src/utils/parsers/functionArgs.js
    internal("functionArgs", function() {
        var rx1 = /\(.*?\)/;
        var rx2 = /([\$\w])+/gm;
        return function(fn) {
            var str = (fn || "") + "";
            return str.match(rx1)[0].match(rx2) || [];
        };
    });
    //! node_modules/hbjs/src/hb/utils/interpolator.js
    internal("interpolator", [ "each", "removeLineBreaks", "removeExtraSpaces", "apply" ], function(each, removeLineBreaks, removeExtraSpaces, apply) {
        function Interpolator(injector) {
            var self = this;
            var ths = "this";
            var filters = [];
            var strRefRx = /('|").*?[^\\]\1/g;
            var strRefRepRx = /(\.?[a-zA-Z\$\_]+\w?\b)(?!\s?\:)/g;
            var parseRx = /("|')?\w+\s?\1?\|\s?\w+/;
            var fixStrRefChar = "~*";
            var fixStrRefScope;
            var fixStrRefMatches = [];
            var fixStrRefCount;
            var errorHandler = function(er, extraMessage, data) {
                if (window.console && console.warn) {
                    console.warn(extraMessage + "\n" + er.message + "\n" + (er.stack || er.stacktrace || er.backtrace), data);
                }
            };
            function setErrorHandler(fn) {
                errorHandler = fn;
            }
            function interpolateError(er, scope, str, errorHandler) {
                if (errorHandler) {
                    errorHandler(er, 'Error evaluating: "' + str + '" against %o', scope);
                }
            }
            function replaceLookupStrDepth(str) {
                if (str.charAt(0) === ".") {
                    return str;
                }
                return lookupStrDepth(str, fixStrRefScope);
            }
            function swapStringMatchOut(str) {
                var result = fixStrRefChar + fixStrRefCount;
                fixStrRefMatches.push(str);
                fixStrRefCount += 1;
                return result;
            }
            function fixStrReferences(str, scope) {
                var i, len;
                fixStrRefCount = 0;
                fixStrRefMatches.length = 0;
                fixStrRefScope = scope;
                str = str.replace(strRefRx, swapStringMatchOut);
                str = str.replace(strRefRepRx, replaceLookupStrDepth);
                for (i = 0, len = fixStrRefMatches.length; i < len; i += 1) {
                    str = str.split(fixStrRefChar + i).join(fixStrRefMatches[i]);
                }
                return str;
            }
            function lookupStrDepth(str, scope) {
                str = str.trim();
                if (scope[str] === undefined && scope.hasOwnProperty(str)) {
                    delete scope[str];
                }
                var bool = str.toLowerCase();
                if (bool !== "true" && bool !== "false") {
                    return ths + "." + str;
                }
                return str;
            }
            function parseFilter(str, scope) {
                if (str.indexOf("|") !== -1 && str.match(parseRx)) {
                    str = str.replace("||", "~~");
                    var parts = str.trim().split("|");
                    parts[1] = parts[1].replace("~~", "||");
                    each.call({
                        all: true
                    }, parts, trimStrings);
                    parts[1] = parts[1].split(":");
                    var filterName = parts[1].shift().split("-").join(""), filter = injector.val(filterName), args;
                    if (!filter) {
                        return parts[0];
                    } else {
                        args = parts[1];
                    }
                    each.call({
                        all: true
                    }, args, injector.getInjection, scope);
                    return {
                        filter: function(value) {
                            args.unshift(value);
                            return apply(injector.invoke(filter, scope, {
                                alias: filterName
                            }), scope, args);
                        },
                        str: parts[0]
                    };
                }
                return undefined;
            }
            function interpolate(scope, str, ignoreErrors) {
                var fn = Function, result, filter, i, len;
                if (str === null || str === undefined) {
                    return;
                }
                for (i = 0, len = filters.length; i < len; i += 1) {
                    str = filters[i](str);
                }
                if (!str) {
                    return;
                }
                filter = parseFilter(str, scope);
                if (filter) {
                    str = filter.str;
                }
                str = fixStrReferences(str, scope);
                result = apply(new fn("var result; try { result = " + str + "; } catch(er) { result = er; } finally { return result; }"), scope);
                if (result) {
                    if (typeof result === "object" && (result.hasOwnProperty("stack") || result.hasOwnProperty("stacktrace") || result.hasOwnProperty("backtrace"))) {
                        if (!ignoreErrors) {
                            interpolateError(result, scope, str, errorHandler);
                        }
                        result = undefined;
                    }
                }
                return filter ? filter.filter(result) : result;
            }
            function trimStrings(str, index, list) {
                list[index] = str && str.trim();
            }
            function addFilter(fn) {
                filters.push(fn);
            }
            function removeFilter(fn) {
                var index = filters.indexOf(fn);
                if (index !== -1) {
                    filters.splice(index, 1);
                }
            }
            self.addFilter = addFilter;
            self.removeFilter = removeFilter;
            self.invoke = interpolate;
            self.setErrorHandler = setErrorHandler;
            self.addFilter(removeLineBreaks);
            self.addFilter(removeExtraSpaces);
        }
        return function(injector) {
            return new Interpolator(injector);
        };
    });
    //! node_modules/hbjs/src/utils/formatters/removeLineBreaks.js
    internal("removeLineBreaks", function() {
        var removeLineBreaks = function(str) {
            str = str + "";
            return str.replace(/(\r\n|\n|\r)/gm, "");
        };
        return removeLineBreaks;
    });
    //! node_modules/hbjs/src/utils/formatters/removeExtraSpaces.js
    internal("removeExtraSpaces", function() {
        var removeExtraSpaces = function(str) {
            str = str + "";
            return str.replace(/\s+/g, " ");
        };
        return removeExtraSpaces;
    });
    //! node_modules/hbjs/src/utils/formatters/removeHTMLComments.js
    internal("removeHTMLComments", function() {
        var removeHTMLComments = function(htmlStr) {
            htmlStr = htmlStr + "";
            return htmlStr.replace(/<!--[\s\S]*?-->/g, "");
        };
        return removeHTMLComments;
    });
    //! node_modules/hbjs/src/utils/browser/ready.js
    internal("ready", function() {
        var callbacks = [], win = window, doc = document, ADD_EVENT_LISTENER = "addEventListener", REMOVE_EVENT_LISTENER = "removeEventListener", ATTACH_EVENT = "attachEvent", DETACH_EVENT = "detachEvent", DOM_CONTENT_LOADED = "DOMContentLoaded", ON_READY_STATE_CHANGE = "onreadystatechange", COMPLETE = "complete", READY_STATE = "readyState";
        var ready = function(callback) {
            callbacks.push(callback);
            if (doc[READY_STATE] === COMPLETE) {
                setTimeout(invokeCallbacks);
            }
        };
        var DOMContentLoaded;
        function invokeCallbacks() {
            var i = 0, len = callbacks.length;
            while (i < len) {
                callbacks[i]();
                i += 1;
            }
            callbacks.length = 0;
        }
        if (doc[ADD_EVENT_LISTENER]) {
            DOMContentLoaded = function() {
                doc[REMOVE_EVENT_LISTENER](DOM_CONTENT_LOADED, DOMContentLoaded, false);
                invokeCallbacks();
            };
        } else if (doc.attachEvent) {
            DOMContentLoaded = function() {
                if (doc[READY_STATE] === COMPLETE) {
                    doc[DETACH_EVENT](ON_READY_STATE_CHANGE, DOMContentLoaded);
                    invokeCallbacks();
                }
            };
        }
        if (doc[READY_STATE] === COMPLETE) {
            setTimeout(invokeCallbacks, 1);
        }
        if (doc[ADD_EVENT_LISTENER]) {
            doc[ADD_EVENT_LISTENER](DOM_CONTENT_LOADED, DOMContentLoaded, false);
            win[ADD_EVENT_LISTENER]("load", invokeCallbacks, false);
        } else if (doc[ATTACH_EVENT]) {
            doc[ATTACH_EVENT](ON_READY_STATE_CHANGE, DOMContentLoaded);
            win[ATTACH_EVENT]("onload", invokeCallbacks);
        }
        return ready;
    });
    //! node_modules/hbjs/src/hb/eventStash.js
    internal("hb.eventStash", function() {
        var events = new function EventStash() {}();
        events.HB_READY = "hb::ready";
        return events;
    });
    //! node_modules/hbjs/src/utils/async/dispatcher.js
    internal("dispatcher", [ "apply" ], function(apply) {
        function Event(type) {
            this.type = event;
            this.defaultPrevented = false;
            this.propagationStopped = false;
            this.immediatePropagationStopped = false;
        }
        Event.prototype.preventDefault = function() {
            this.defaultPrevented = true;
        };
        Event.prototype.stopPropagation = function() {
            this.propagationStopped = true;
        };
        Event.prototype.stopImmediatePropagation = function() {
            this.immediatePropagationStopped = true;
        };
        Event.prototype.toString = function() {
            return this.type;
        };
        var dispatcher = function(target, scope, map) {
            target = target || {};
            var listeners = {};
            function off(event, callback) {
                var index, list;
                list = listeners[event];
                if (list) {
                    if (callback) {
                        index = list.indexOf(callback);
                        if (index !== -1) {
                            list.splice(index, 1);
                        }
                    } else {
                        list.length = 0;
                    }
                }
            }
            function on(event, callback) {
                listeners[event] = listeners[event] || [];
                listeners[event].push(callback);
                return function() {
                    off(event, callback);
                };
            }
            function once(event, callback) {
                function fn() {
                    off(event, fn);
                    apply(callback, scope || target, arguments);
                }
                return on(event, fn);
            }
            function getListeners(event, strict) {
                var list, a = "*";
                if (event || strict) {
                    list = [];
                    if (listeners[a]) {
                        list = listeners[a].concat(list);
                    }
                    if (listeners[event]) {
                        list = listeners[event].concat(list);
                    }
                    return list;
                }
                return listeners;
            }
            function removeAllListeners() {
                listeners = {};
            }
            function fire(callback, args) {
                return callback && apply(callback, target, args);
            }
            function dispatch(event) {
                var list = getListeners(event, true), len = list.length, i, event = new Event(arguments[0]);
                if (len) {
                    arguments[0] = event;
                    for (i = 0; i < len; i += 1) {
                        if (!event.immediatePropagationStopped) {
                            fire(list[i], arguments);
                        }
                    }
                }
                return event;
            }
            if (scope && map) {
                target.on = scope[map.on] && scope[map.on].bind(scope);
                target.off = scope[map.off] && scope[map.off].bind(scope);
                target.once = scope[map.once] && scope[map.once].bind(scope);
                target.dispatch = target.fire = scope[map.dispatch].bind(scope);
            } else {
                target.on = on;
                target.off = off;
                target.once = once;
                target.dispatch = target.fire = dispatch;
            }
            target.getListeners = getListeners;
            target.removeAllListeners = removeAllListeners;
            return target;
        };
        return dispatcher;
    });
    //! node_modules/hbjs/src/utils/browser/loader.js
    internal("loader", [ "toArray" ], function(toArray) {
        return function(doc) {
            var env, head, pending = {}, pollCount = 0, queue = {
                css: [],
                js: []
            }, styleSheets = doc.styleSheets;
            function createNode(name, attrs) {
                var node = doc.createElement(name), attr;
                for (attr in attrs) {
                    if (attrs.hasOwnProperty(attr)) {
                        node.setAttribute(attr, attrs[attr]);
                    }
                }
                return node;
            }
            function finish(type) {
                var p = pending[type], callback, urls;
                if (p) {
                    callback = p.callback;
                    urls = p.urls;
                    urls.shift();
                    pollCount = 0;
                    if (!urls.length) {
                        callback && callback.call(p.context, p.obj);
                        pending[type] = null;
                        queue[type].length && load(type);
                    }
                }
            }
            function getEnv() {
                var ua = navigator.userAgent;
                env = {
                    async: doc.createElement("script").async === true
                };
                (env.webkit = /AppleWebKit\//.test(ua)) || (env.ie = /MSIE|Trident/.test(ua)) || (env.opera = /Opera/.test(ua)) || (env.gecko = /Gecko\//.test(ua)) || (env.unknown = true);
            }
            function load(type, urls, callback, obj, context) {
                var _finish = function() {
                    finish(type);
                }, isCSS = type === "css", nodes = [], i, len, node, p, pendingUrls, url;
                env || getEnv();
                if (urls) {
                    urls = typeof urls === "string" ? [ urls ] : urls.concat();
                    if (isCSS || env.async || env.gecko || env.opera) {
                        queue[type].push({
                            urls: urls,
                            callback: callback,
                            obj: obj,
                            context: context
                        });
                    } else {
                        for (i = 0, len = urls.length; i < len; ++i) {
                            queue[type].push({
                                urls: [ urls[i] ],
                                callback: i === len - 1 ? callback : null,
                                obj: obj,
                                context: context
                            });
                        }
                    }
                }
                if (pending[type] || !(p = pending[type] = queue[type].shift())) {
                    return;
                }
                head || (head = doc.head || doc.getElementsByTagName("head")[0]);
                pendingUrls = p.urls.concat();
                if (!pendingUrls.length && p.callback) {
                    p.callback();
                }
                for (i = 0, len = pendingUrls.length; i < len; ++i) {
                    url = pendingUrls[i];
                    if (isCSS) {
                        node = env.gecko ? createNode("style") : createNode("link", {
                            href: url,
                            rel: "stylesheet"
                        });
                    } else {
                        node = createNode("script", {
                            src: url
                        });
                        node.async = false;
                    }
                    node.className = "lazyload";
                    node.setAttribute("charset", "utf-8");
                    if (env.ie && !isCSS && "onreadystatechange" in node && !("draggable" in node)) {
                        node.onreadystatechange = function() {
                            if (/loaded|complete/.test(node.readyState)) {
                                node.onreadystatechange = null;
                                _finish();
                            }
                        };
                    } else if (isCSS && (env.gecko || env.webkit)) {
                        if (env.webkit) {
                            p.urls[i] = node.href;
                            pollWebKit();
                        } else {
                            node.innerHTML = '@import "' + url + '";';
                            pollGecko(node);
                        }
                    } else {
                        node.onload = node.onerror = _finish;
                    }
                    nodes.push(node);
                }
                for (i = 0, len = nodes.length; i < len; ++i) {
                    head.appendChild(nodes[i]);
                }
            }
            function pollGecko(node) {
                var hasRules;
                try {
                    hasRules = !!node.sheet.cssRules;
                } catch (ex) {
                    pollCount += 1;
                    if (pollCount < 200) {
                        setTimeout(function() {
                            pollGecko(node);
                        }, 50);
                    } else {
                        hasRules && finish("css");
                    }
                    return;
                }
                finish("css");
            }
            function pollWebKit() {
                var css = pending.css, i;
                if (css) {
                    i = styleSheets.length;
                    while (--i >= 0) {
                        if (styleSheets[i].href === css.urls[0]) {
                            finish("css");
                            break;
                        }
                    }
                    pollCount += 1;
                    if (css) {
                        if (pollCount < 200) {
                            setTimeout(pollWebKit, 50);
                        } else {
                            finish("css");
                        }
                    }
                }
            }
            return {
                css: function(urls, callback, obj, context) {
                    load("css", urls, callback, obj, context);
                },
                js: function(urls, callback, obj, context) {
                    load("js", urls, callback, obj, context);
                },
                load: function(urls, callback) {
                    var count = 0;
                    urls = toArray(urls);
                    var len = urls ? urls.length : 0;
                    function incCount() {
                        if (++count === urls.length) {
                            callback();
                        }
                    }
                    if (len) {
                        for (var i = 0; i < len; i++) {
                            var url = urls[i];
                            if (/.js\?|.js$/im.test(url)) {
                                this.js(url, incCount);
                            } else if (/.css\?|.css/im.test(url)) {
                                this.css(url, incCount);
                            } else {
                                console.warn("Unknown type: " + url);
                            }
                        }
                    } else {
                        callback();
                    }
                }
            };
        }(window.document);
    });
    //! node_modules/hbjs/src/utils/browser/findScriptUrls.js
    internal("findScriptUrls", [], function() {
        return function(pattern) {
            var type = typeof pattern, i, tags = document.querySelectorAll("script"), matches = [], src;
            for (i = 0; i < tags.length; i++) {
                src = tags[i].src || "";
                if (type === "string") {
                    if (src.indexOf(pattern) !== -1) {
                        matches.push(src);
                    }
                } else if (pattern.test(src)) {
                    matches.push(src);
                }
            }
            return matches;
        };
    });
    //! src/widgets/dummer/dummer.js
    internal("dummer", [ "hb.directive", "query", "ContactService" ], function(directive, query, ContactService) {
        directive("dummer", function() {
            return {
                scope: true,
                tplUrl: "907981bd_tpl0",
                link: [ "scope", "el", "alias", "attr", function(scope, el, alias, attr) {
                    query(el).addClass(alias.name);
                    if (!scope.model) {
                        scope.model = {
                            title: attr.title,
                            text: ContactService.data
                        };
                    }
                } ]
            };
        });
    });
    //! node_modules/hbjs/src/utils/query/modify/addClass.js
    internal("query.addClass", [ "query" ], function(query) {
        query.fn.addClass = function(className) {
            var $el;
            this.each(function(index, el) {
                $el = query(el);
                if (!$el.hasClass(className)) {
                    el.className += " " + className;
                }
            });
            return this;
        };
    });
    //! node_modules/hbjs/src/utils/query/modify/hasClass.js
    internal("query.hasClass", [ "query" ], function(query) {
        query.fn.hasClass = function(className) {
            var returnVal = false;
            this.each(function(index, el) {
                if (!returnVal) {
                    if (el.classList) {
                        returnVal = el.classList.contains(className);
                    } else {
                        returnVal = new RegExp("(^| )" + className + "( |$)", "gi").test(el.className);
                    }
                    if (returnVal) {
                        return false;
                    }
                }
            });
            return returnVal;
        };
    });
    //! src/shared/services/ContactService.js
    internal("ContactService", [ "http" ], function(http) {
        var scope = this;
        scope.data = {
            title: "It's the end of the world as we know it."
        };
        return scope;
    });
    //! node_modules/hbjs/src/utils/ajax/http.js
    internal("http", [ "extend" ], function(extend) {
        var serialize = function(obj) {
            var str = [];
            for (var p in obj) if (obj.hasOwnProperty(p)) {
                str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
            }
            return str.join("&");
        };
        var win = window, CORSxhr = function() {
            var xhr;
            if (win.XMLHttpRequest && "withCredentials" in new win.XMLHttpRequest()) {
                xhr = win.XMLHttpRequest;
            } else if (win.XDomainRequest) {
                xhr = win.XDomainRequest;
            }
            return xhr;
        }(), methods = [ "head", "get", "post", "put", "delete" ], i, methodsLength = methods.length, result = {};
        function Request(options) {
            this.init(options);
        }
        function getRequestResult(that) {
            var headers = parseResponseHeaders(this.getAllResponseHeaders());
            var response = this.responseText.trim();
            var start;
            var end;
            if (response) {
                start = response[0];
                end = response[response.length - 1];
            }
            if (response && (start === "{" && end === "}") || start === "[" && end === "]") {
                response = response ? JSON.parse(response.replace(/\/\*.*?\*\//g, "")) : response;
            }
            return {
                data: response,
                request: {
                    method: that.method,
                    url: that.url,
                    data: that.data,
                    headers: that.headers
                },
                headers: headers,
                status: this.status
            };
        }
        Request.prototype.init = function(options) {
            var that = this;
            that.xhr = new CORSxhr();
            that.method = options.method;
            that.url = options.url;
            that.success = options.success;
            that.error = options.error;
            that.data = options.data;
            that.headers = options.headers;
            if (options.credentials === true) {
                that.xhr.withCredentials = true;
            }
            that.send();
            return that;
        };
        Request.prototype.send = function() {
            var that = this;
            if (that.method === "GET" && that.data) {
                var concat = that.url.indexOf("?") > -1 ? "&" : "?";
                that.url += concat + serialize(that.data);
            } else {
                that.data = JSON.stringify(that.data);
            }
            if (that.success !== undefined) {
                that.xhr.onload = function() {
                    var result = getRequestResult.call(this, that), self = this;
                    function onLoad() {
                        if (self.status >= 200 && self.status < 400) {
                            that.success.call(self, result);
                        } else if (that.error !== undefined) {
                            that.error.call(self, result);
                        }
                    }
                    if (this.onloadInterceptor) {
                        this.onloadInterceptor(onLoad, result);
                    } else {
                        onLoad();
                    }
                };
            }
            if (that.error !== undefined) {
                that.xhr.error = function() {
                    var result = getRequestResult.call(this, that);
                    that.error.call(this, result);
                };
            }
            that.xhr.open(that.method, that.url, true);
            if (that.headers !== undefined) {
                that.setHeaders();
            }
            that.xhr.send(that.data, true);
            return that;
        };
        Request.prototype.setHeaders = function() {
            var that = this, headers = that.headers, key;
            for (key in headers) {
                if (headers.hasOwnProperty(key)) {
                    that.xhr.setRequestHeader(key, headers[key]);
                }
            }
            return that;
        };
        function parseResponseHeaders(str) {
            var list = str.split("\n");
            var headers = {};
            var parts;
            var i = 0, len = list.length;
            while (i < len) {
                parts = list[i].split(": ");
                if (parts[0] && parts[1]) {
                    parts[0] = parts[0].split("-").join("").split("");
                    parts[0][0] = parts[0][0].toLowerCase();
                    headers[parts[0].join("")] = parts[1];
                }
                i += 1;
            }
            return headers;
        }
        function addDefaults(options, defaults) {
            return extend(options, defaults);
        }
        function handleInterceptor(options) {
            return !!(result.intercept && result.intercept(options, Request));
        }
        for (i = 0; i < methodsLength; i += 1) {
            (function() {
                var method = methods[i];
                result[method] = function(url, success, error) {
                    var options = {};
                    if (url === undefined) {
                        throw new Error("CORS: url must be defined");
                    }
                    if (typeof url === "object") {
                        options = url;
                    } else {
                        if (typeof success === "function") {
                            options.success = success;
                        }
                        if (typeof error === "function") {
                            options.error = error;
                        }
                        options.url = url;
                    }
                    options.method = method.toUpperCase();
                    addDefaults(options, result.defaults);
                    if (handleInterceptor(options)) {
                        return;
                    }
                    return new Request(options).xhr;
                };
            })();
        }
        result.intercept = null;
        result.defaults = {
            headers: {}
        };
        return result;
    });
    //! node_modules/hbjs/src/utils/data/extend.js
    internal("extend", [ "toArray" ], function(toArray) {
        var extend = function(target, source) {
            var args = toArray(arguments), i = 1, len = args.length, item, j;
            var options = this || {}, copy;
            if (!target && source && typeof source === "object") {
                target = {};
            }
            while (i < len) {
                item = args[i];
                for (j in item) {
                    if (item.hasOwnProperty(j)) {
                        if (j === "length" && target instanceof Array) {} else if (target[j] && typeof target[j] === "object" && !item[j] instanceof Array) {
                            target[j] = extend.apply(options, [ target[j], item[j] ]);
                        } else if (item[j] instanceof Array) {
                            copy = options && options.concat ? (target[j] || []).concat(item[j]) : item[j];
                            if (options && options.arrayAsObject) {
                                if (!target[j]) {
                                    target[j] = {
                                        length: copy.length
                                    };
                                }
                                if (target[j] instanceof Array) {
                                    target[j] = extend.apply(options, [ {}, target[j] ]);
                                }
                            } else {
                                target[j] = target[j] || [];
                            }
                            if (copy.length) {
                                target[j] = extend.apply(options, [ target[j], copy ]);
                            }
                        } else if (item[j] && typeof item[j] === "object") {
                            if (options.objectAsArray && typeof item[j].length === "number") {
                                if (!(target[j] instanceof Array)) {
                                    target[j] = extend.apply(options, [ [], target[j] ]);
                                }
                            }
                            target[j] = extend.apply(options, [ target[j] || {}, item[j] ]);
                        } else if (options.override !== false || target[j] === undefined) {
                            target[j] = item[j];
                        }
                    }
                }
                i += 1;
            }
            return target;
        };
        return extend;
    });
    //! src/widgets/dummer/label/label.js
    internal("dummerLabel", [ "hb.directive", "resolve" ], function(directive, resolve) {
        directive("dummerLabel", function() {
            return {
                scope: true,
                tplUrl: "907981bd_tpl1",
                link: [ "scope", "el", "alias", function(scope, el, alias) {
                    scope.$watch(alias.value, function(newVal) {
                        scope.text = newVal;
                    });
                    scope.update = function() {
                        resolve(scope).set(alias.value, "Goodbye.");
                    };
                } ]
            };
        });
    });
    //! src/widgets/dummy/dummy.js
    internal("dummy", [ "hb.directive", "query", "ContactService" ], function(directive, query, ContactService) {
        directive("dummy", function() {
            return {
                scope: true,
                tplUrl: "907981bd_tpl2",
                link: [ "scope", "el", "alias", "attr", function(scope, el, alias, attr) {
                    query(el).addClass(alias.name);
                    if (!scope.model) {
                        scope.model = {
                            title: attr.title,
                            text: ContactService.data
                        };
                    }
                } ]
            };
        });
    });
    //! src/widgets/dummy/label/label.js
    internal("dummyLabel", [ "hb.directive", "resolve" ], function(directive, resolve) {
        directive("dummyLabel", function() {
            return {
                scope: true,
                tplUrl: "907981bd_tpl3",
                link: [ "scope", "el", "alias", function(scope, el, alias) {
                    scope.$watch(alias.value, function(newVal) {
                        scope.text = newVal;
                    });
                    scope.update = function() {
                        resolve(scope).set(alias.value, "Goodbye.");
                    };
                } ]
            };
        });
    });
    //! node_modules/hbjs/src/hb/directives/cloak.js
    //! pattern /hb\-cloak(\s|\=|>)/
    internal("hbd.cloak", [ "hb.directive", "hb.eventStash" ], function(directive, events) {
        directive("hbCloak", function() {
            return {
                link: [ "scope", "el", "alias", function(scope, el, alias) {
                    scope.$on(events.HB_READY, function() {
                        el.removeAttribute(alias.name);
                    });
                } ]
            };
        });
    });
    //! .tmp_templates/templates_0.js
    internal("templates_0", [ "app" ], function(app) {
        app.template("907981bd_tpl0", "<div>{{model}}</div><div dummer-label=model.text hb-click=update()></div>");
        app.template("907981bd_tpl1", "<div>He said: {{text}}!!!</div>");
        app.template("907981bd_tpl2", "<div>{{model}}</div><div dummy-label=model.text hb-click=update()></div>");
        app.template("907981bd_tpl3", "<div>You said: {{title}} {{text}}</div>");
    });
    for (var name in cache) {
        resolve(name, cache[name]);
    }
})(this["obogo"] || {}, function() {
    return this;
}());