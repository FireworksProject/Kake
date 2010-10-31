function get_dir() {
    var id = 'kake@fireworksproject.com'
      , em = Components.classes['@mozilla.org/extensions/manager;1']
                 .getService(Components.interfaces.nsIExtensionManager)
      ;

    return em.getInstallLocation(id).getItemLocation(id);
}

test('[private] args_to_array()', function () {
    strictEqual( typeof args_to_array
               , 'function'
               , 'typeof args_to_array'
               );
    strictEqual( Object.prototype.toString.call(arguments)
               , '[object Object]'
               , 'Object.prototype.toString.call(arguments)'
               );
    strictEqual( Object.prototype.toString.call(args_to_array(arguments))
               , '[object Array]'
               , 'Object.prototype.toString.call(args_to_array(arguments))'
               );
});

test('[private] dump_out()', function () {
    var g_dump = dump, logger;

    strictEqual( typeof dumpout
               , 'function'
               , 'typeof dumpout'
               );

    // Change global dump.
    dump = function (str) {
        strictEqual( str
                   , 'TEST a 1  true  [object Object] [object nsXPCComponents] function () {\n}\n'
                   , 'logger("a", 1, null, true, [], {}, Components, function () {})'
                   );
    };

    logger = dumpout('TEST');
    logger('a', 1, null, true, [], {}, Components, function () {});

    // Put global dump back.
    dump = g_dump;
});

test('[private] make_logger()', function () {
    var g_dump = dump;

    strictEqual( typeof make_logger
               , 'function'
               , 'typeof make_logger'
               );

    var got_warning, got_debug, got_dumped;

    function reset() {
        got_warning = false; got_debug = false; got_dumped = false;
    }

    function warn(x) { got_warning = x; }

    function debug(x) { got_debug = x; }

    dump = function (x) { got_dumped = x; };

    var logger_a = make_logger({warn: warn, debug: debug});

    reset();
    logger_a.warn('x');
    strictEqual(got_warning, 'x', 'logger_a warning');
    strictEqual(got_debug, false, 'logger_a debug');
    strictEqual(got_dumped, false, 'logger_a dumped');

    reset();
    logger_a.debug('x');
    strictEqual(got_warning, false, 'logger_a warning');
    strictEqual(got_debug, 'x', 'logger_a debug');
    strictEqual(got_dumped, false, 'logger_a dumped');

    var logger_b = make_logger({warn: warn});

    reset();
    logger_b.warn('x');
    strictEqual(got_warning, 'x', 'logger_b warning');
    strictEqual(got_debug, false, 'logger_b debug');
    strictEqual(got_dumped, false, 'logger_b dumped');

    reset();
    logger_b.debug('x');
    strictEqual(got_warning, false, 'logger_b warning');
    strictEqual(got_debug, false, 'logger_b debug');
    strictEqual(got_dumped, 'DEBUG x\n', 'logger_b dumped');

    var logger_c = make_logger({debug: debug});

    reset();
    logger_c.warn('x');
    strictEqual(got_warning, false, 'logger_c warning');
    strictEqual(got_debug, false, 'logger_c debug');
    strictEqual(got_dumped, 'WARNING x\n', 'logger_c dumped');

    reset();
    logger_c.debug('x');
    strictEqual(got_warning, false, 'logger_c warning');
    strictEqual(got_debug, 'x', 'logger_c debug');
    strictEqual(got_dumped, false, 'logger_c dumped');

    var logger_d = make_logger();

    reset();
    logger_d.warn('x');
    strictEqual(got_warning, false, 'logger_d warning');
    strictEqual(got_debug, false, 'logger_d debug');
    strictEqual(got_dumped, 'WARNING x\n', 'logger_d dumped');

    reset();
    logger_d.debug('x');
    strictEqual(got_warning, false, 'logger_d warning');
    strictEqual(got_debug, false, 'logger_d debug');
    strictEqual(got_dumped, 'DEBUG x\n', 'logger_d dumped');

    // Put global dump back.
    dump = g_dump;
});

test('LoaderError', function () {
    strictEqual( typeof exports.LoaderError
               , 'function'
               , 'typeof exports.LoaderError'
               );

    var e = LoaderError('Ack!');
    ok( e instanceof exports.LoaderError
      , 'e instanceof exports.LoaderError'
      );
    strictEqual(e.name, 'LoaderError', 'e.name');
    strictEqual(e.message, 'Ack!', 'e.message');
    strictEqual( e.fileName
               , 'chrome://kake/content/kake-core/lib/loader.js'
               , 'e.fileName'
               );
    strictEqual(typeof e.lineNumber,  'number', 'e.lineNumber');
    strictEqual(e.constructor, exports.LoaderError, 'e.constructor');
    strictEqual( e.toString()
               , 'LoaderError: Ack!'
               , 'e.toString()'
               );
});

test('RequireError', function () {
    strictEqual( typeof exports.RequireError
               , 'function'
               , 'typeof exports.RequireError'
               );

    var e = RequireError('Ack!');
    ok( e instanceof exports.RequireError
      , 'e instanceof exports.RequireError'
      );
    strictEqual(e.name, 'RequireError', 'e.name');
    strictEqual(e.message, 'Ack!', 'e.message');
    strictEqual( e.fileName
               , 'chrome://kake/content/kake-core/lib/loader.js'
               , 'e.fileName'
               );
    strictEqual(typeof e.lineNumber,  'number', 'e.lineNumber');
    strictEqual(e.constructor, exports.RequireError, 'e.constructor');
    strictEqual( e.toString()
               , 'RequireError: Ack!'
               , 'e.toString()'
               );
});

test('strip_slashes', function () {
    strictEqual( typeof exports.strip_slashes
               , 'function'
               , 'typeof exports.strip_slashes'
               );

    try {
        exports.strip_slashes();
    } catch (e) {
        strictEqual( e.name
                   , 'TypeError'
                   , 'strip_slashes(undefined) throws TypeError'
                   );
    }
    try {
        exports.strip_slashes(null);
    } catch (e) {
        strictEqual( e.name
                   , 'TypeError'
                   , 'strip_slashes(null) throws TypeError'
                   );
    }
    try {
        exports.strip_slashes(1);
    } catch (e) {
        strictEqual( e.name
                   , 'TypeError'
                   , 'strip_slashes(1) throws TypeError'
                   );
    }
    strictEqual( exports.strip_slashes('')
               , ''
               , 'strip_slashes()'
               );
    strictEqual( exports.strip_slashes('no_slashes')
               , 'no_slashes'
               , 'strip_slashes()'
               );
    strictEqual( exports.strip_slashes('no_slashes')
               , 'no_slashes'
               , 'strip_slashes("no_slashes")'
               );
    strictEqual( exports.strip_slashes('one/slash')
               , 'one/slash'
               , 'strip_slashes("one/slash")'
               );
    strictEqual( exports.strip_slashes('//start_two')
               , 'start_two'
               , 'strip_slashes("//start_two")'
               );
    strictEqual( exports.strip_slashes('end_two//')
               , 'end_two'
               , 'strip_slashes("end_two//")'
               );
    strictEqual( exports.strip_slashes('/slashed/')
               , 'slashed'
               , 'strip_slashes("/slashed/")'
               );
    strictEqual( exports.strip_slashes('\\ok\\')
               , '\\ok\\'
               , 'strip_slashes("\\ok\\")'
               );
});

module('resolve()', 'Module id resolver.');

test('resolve() absolute absolute', function () {
    strictEqual( resolve('id', 'base')
               , 'id'
               , "resolve('id', 'base')"
               );
    strictEqual( resolve('a/id', 'base')
               , 'a/id'
               , "resolve('a/id', 'base')"
               );
    strictEqual( resolve('/a/id', 'base')
               , '/a/id'
               , "resolve('/a/id', 'base')"
               );
    strictEqual( resolve('/a/id/', 'base')
               , '/a/id/'
               , "resolve('/a/id/', 'base')"
               );
    strictEqual( resolve('id', '/base')
               , 'id'
               , "resolve('id', '/base')"
               );
    strictEqual( resolve('a/id', 'base/')
               , 'a/id'
               , "resolve('a/id', 'base/')"
               );
    strictEqual( resolve('/a/id', '/base/')
               , '/a/id'
               , "resolve('/a/id', '/base/')"
               );
    strictEqual( resolve('/a/id/', '/base/')
               , '/a/id/'
               , "resolve('/a/id/', '/base/')"
               );
});

test('resolve() absolute relative', function () {
    strictEqual( resolve('id', './base')
               , 'id'
               , "resolve('id', './base')"
               );
    strictEqual( resolve('a/id', '../base')
               , 'a/id'
               , "resolve('a/id', '../base')"
               );
    strictEqual( resolve('/a/id', 'base/.')
               , '/a/id'
               , "resolve('/a/id', 'base/.')"
               );
    strictEqual( resolve('/a/id/', 'base/..')
               , '/a/id/'
               , "resolve('/a/id/', 'base/..')"
               );
    strictEqual( resolve('id', '/base/../')
               , 'id'
               , "resolve('id', '/base/../')"
               );
    strictEqual( resolve('a/id', '../../base/')
               , 'a/id'
               , "resolve('a/id', '../../base/')"
               );
    strictEqual( resolve('/a/id', '/../../base/')
               , '/a/id'
               , "resolve('/a/id', '/../../base/')"
               );
    strictEqual( resolve('/a/id/', './../base/')
               , '/a/id/'
               , "resolve('/a/id/', './../base/')"
               );
});

test('resolve() relative relative', function () {
    strictEqual( resolve('.id', './base')
               , '.id'
               , "resolve('.id', './base')"
               );
    strictEqual( resolve('./id', '../base')
               , '../id'
               , "resolve('./id', '../base')"
               );
    strictEqual( resolve('../id', '../base/a/b')
               , '../base/id'
               , "resolve('../id', '../base/a/b')"
               );
    strictEqual( resolve('./../id/', '/base/a/b/')
               , 'base/id/'
               , "resolve('./../id/', '/base/a/b/')"
               );
    strictEqual( resolve('.././id', '../base/a/b/')
               , '../base/id'
               , "resolve('.././id', '../base/a/b/')"
               );
    strictEqual( resolve('../.id', './base/a/b/')
               , './base/.id'
               , "resolve('../.id', './base/a/b/')"
               );
});

test('resolve() relative absolute', function () {
    strictEqual( resolve('./id', 'base/a/b/c')
               , 'base/a/b/id'
               , "resolve('./id', 'base/a/b/c')"
               );
    strictEqual( resolve('../id', 'base/a/b/c')
               , 'base/a/id'
               , "resolve('../id', 'base/a/b/c')"
               );
    strictEqual( resolve('./../id', 'base/a/b/c')
               , 'base/a/id'
               , "resolve('./../id', 'base/a/b/c')"
               );
    strictEqual( resolve('../../id', 'base/a/b/c')
               , 'base/id'
               , "resolve('../../id', 'base/a/b/c')"
               );
    strictEqual( resolve('./../../id', 'base/a/b/c')
               , 'base/id'
               , "resolve('./../../id', 'base/a/b/c')"
               );
    strictEqual( resolve('../../../id', 'base/a/b/c')
               , 'id'
               , "resolve('../../../id', 'base/a/b/c')"
               );
    strictEqual( resolve('./../../../id', 'base/a/b/c')
               , 'id'
               , "resolve('./../../../id', 'base/a/b/c')"
               );
    strictEqual( resolve('../../../../id', 'base/a/b/c')
               , '../id'
               , "resolve('../../../../id', 'base/a/b/c')"
               );
    strictEqual( resolve('./../../../../id', 'base/a/b/c')
               , '../id'
               , "resolve('./../../../../id', 'base/a/b/c')"
               );
});

module('[private] find_and_fetch', 'File locator and reader.');

test('Invalid file extension.', function () {
    var f = make_find_and_fetch('TEST');
    try {
        f({id: 'file.js'});
        ok(false, 'Expected an error.');
    } catch (e) {
        strictEqual(e.name, 'TypeError', 'Threw a type error.');
    }
});

test('Missing URI protocol.', function () {
    var f = make_find_and_fetch('TEST')
      , base = get_dir()
      , warning, debug
      , logger = { warn: function (x) { warning = x; }
                 , debug: function (x) { debug = x; }
                 }
      , r
      ;

      base.append('install.rdf');

      try {
          // base.path should have `file://` prefix.
          r = f({id: 'foo', logger: logger, paths: [base.path]});
          ok(false, 'expected an error');
      } catch (e) {
          ok(e instanceof TypeError, 'e instanceof TypeError');
      }
      strictEqual(typeof r, 'undefined', 'typeof r');
      strictEqual(typeof warning, 'undefined', 'typeof warning');
      strictEqual(typeof debug, 'undefined', 'typeof debug');
});

test('File not found -- not a dir.', function () {
    var f = make_find_and_fetch('TEST')
      , base = get_dir()
      , warning, debug
      , logger = { warn: function (x) { warning = x; }
                 , debug: function (x) { debug = x; }
                 }
      , r
      ;

      base.append('install.rdf');

      try {
          r = f({id: 'foo', logger: logger, paths: ['file://'+ base.path]});
          ok(false, 'expected an error');
      } catch (e) {
          ok(e instanceof exports.LoaderError, 'e instanceof exports.LoaderError');
      }
      strictEqual(typeof r, 'undefined', 'typeof r');
      strictEqual(typeof warning, 'undefined', 'typeof warning');

      // We get a debug message for this.
      strictEqual(typeof debug, 'string', 'typeof debug');
});

test('File not found.', function () {
    var f = make_find_and_fetch('TEST')
      , base = get_dir()
      , warning, debug
      , logger = { warn: function (x) { warning = x; }
                 , debug: function (x) { debug = x; }
                 }
      , r
      ;

      try {
          r = f({id: 'foo', logger: logger, paths: ['file://'+ base.path]});
          ok(false, 'expected an error');
      } catch (e) {
          ok(e instanceof exports.LoaderError, 'e instanceof exports.LoaderError');
      }
      strictEqual(typeof r, 'undefined', 'typeof r');
      strictEqual(typeof warning, 'undefined', 'typeof warning');

      // We get a debug message for this.
      strictEqual(typeof debug, 'string', 'typeof debug');
});

test('File found and read.', function () {
    var f = make_find_and_fetch('TEST')
      , base = get_dir()
      , warning, debug
      , logger = { warn: function (x) { warning = x; }
                 , debug: function (x) { debug = x; }
                 }
      , r
      ;

      base.append('packages');

      r = f({id: 'kake-test/lib/loader', logger: logger, paths: ['file://'+ base.path]});
      strictEqual(typeof r.text, 'string', 'typeof r.text');
      strictEqual(typeof r.uri, 'string', 'typeof r.uri');
      strictEqual(typeof warning, 'undefined', 'typeof warning');
      strictEqual(typeof debug, 'undefined', 'typeof debug');
});

test('Path priority.', function () {
    var f = make_find_and_fetch('TEST')
      , base = get_dir()
      , warning, debug
      , logger = { warn: function (x) { warning = x; }
                 , debug: function (x) { debug = x; }
                 }
      , r
      , paths
      ;

      base.append('packages');
      paths = [ 'file://' + base.path

              // This path would normally throw an error except that it is
              // second priority to the first path.
              , base.path
              ];

      r = f({id: 'kake-test/lib/loader', logger: logger, paths: paths});
      strictEqual(typeof r.text, 'string', 'typeof r.text');
      strictEqual(typeof r.uri, 'string', 'typeof r.uri');
      strictEqual(typeof warning, 'undefined', 'typeof warning');
      strictEqual(typeof debug, 'undefined', 'typeof debug');

      // Move the good path to second priority.
      paths[1] = paths[0];

      // The JS file will not be found in this path.
      base.append('kake-test');
      paths[0] = 'file://' + base.path;

      r = f({id: 'kake-test/lib/loader', logger: logger, paths: paths});
      strictEqual(typeof r.text, 'string', 'typeof r.text');
      strictEqual(typeof r.uri, 'string', 'typeof r.uri');
      strictEqual(typeof warning, 'undefined', 'typeof warning');
      strictEqual(typeof debug, 'undefined', 'typeof debug');
});

module('evaluate()', 'The module factory factory.');

test('returns a factory function', function () {
    strictEqual(typeof evaluate(), 'function', "typeof evaluate()");
});

test('factory function returns `undefined`', function () {
    strictEqual(typeof evaluate()(), 'undefined', "typeof evaluate()()");
});

test('injects must meet .hasOwnProperty() test', function () {
    var factory
      , inject
      , text = ("export.push = typeof push;" +
                "export.pop = typeof pop;");
      ;

    factory = evaluate(text);

    inject = [];
    inject.export = {};

    // The push and pop methods, and the length property will not be injected,
    // but export will.
    ok(!inject.hasOwnProperty('toString'), "!inject.hasOwnProperty('toString')");
    ok(inject.hasOwnProperty('export'), "inject.hasOwnProperty('export')");

    factory(inject);

    strictEqual(inject.export.push, 'undefined', "inject.export.push");
    strictEqual(inject.export.pop, 'undefined', "inject.export.pop");
});

test('Available globals in a sandbox.', function () {
    var factory
      , inject
      , text = ("export.hasOwnProperty = typeof hasOwnProperty;" +
                "export.toString = typeof toString;" +
                "export.dump = typeof dump;" +
                "export.Components = typeof Components;");
      ;

    factory = evaluate(text);

    inject = {};
    inject.export = {};
    factory(inject);

    strictEqual( inject.export.hasOwnProperty
               , 'function'
               , "inject.export.hasOwnProperty"
               );
    strictEqual( inject.export.toString
               , 'function'
               , "inject.export.toString"
               );
    strictEqual( inject.export.dump
               , 'function'
               , "inject.export.dump"
               );
    strictEqual( inject.export.Components
               , 'object'
               , "inject.export.Components"
               );
});

test('Syntax error in module text.', function () {
    var text = ("'empty';\n" +
                "(1 + 1);\n" +
                "// Syntax error:\n" +
                "function () {");
    try {
        evaluate(text, 'fabricated.js', 1)();
        ok(false, 'Expected a thrown error.');
    } catch (e) {
        strictEqual( e.name
                   , 'SyntaxError'
                   , 'Error name'
                   );
        strictEqual( e.message
                   , 'missing } after function body'
                   , 'Error message'
                   );
        strictEqual( e.fileName
                   , 'fabricated.js'
                   , 'File name'
                   );
        strictEqual( e.lineNumber
                   , 4
                   , 'Line number.'
                   );
    }
});

test('Execution error thrown from module.', function () {
    var text = ("'empty';\n" +
                "(1 + 1);\n" +
                "// Exec error:\n" +
                "export.exec = function () { throw new Error(); }")
      , export = {}
      ;

    evaluate(text, 'fabricated.js', 1)({export: export});
    try {
        export.exec();
        ok(false, 'Expected a thrown error.');
    } catch (e) {
        strictEqual( e.name
                   , 'Error'
                   , 'Error name'
                   );
        strictEqual( e.fileName
                   , 'fabricated.js'
                   , 'File name'
                   );
        strictEqual( e.lineNumber
                   , 4
                   , 'Line number.'
                   );
    }
});

test('Default parameters.', function () {
    var text = ("// Exec error:\n" +
                "export.exec = function () { throw new Error(); }")
      , export = {}
      ;

    // Explicit params.
    evaluate(text, 'fabricated.js', 5)({export: export});
    try {
        export.exec();
        ok(false, 'Expected a thrown error.');
    } catch (e) {
        strictEqual( e.name
                   , 'Error'
                   , 'Error name'
                   );
        strictEqual( e.fileName
                   , 'fabricated.js'
                   , 'File name'
                   );
        strictEqual( e.lineNumber
                   , 6
                   , 'Line number.'
                   );
    }

    // Default params.
    export = {};
    evaluate(text)({export: export});
    try {
        export.exec();
        ok(false, 'Expected a thrown error.');
    } catch (e) {
        strictEqual( e.name
                   , 'Error'
                   , 'Error name'
                   );
        strictEqual( e.fileName
                   , '<text>'
                   , 'File name'
                   );
        strictEqual( e.lineNumber
                   , 2
                   , 'Line number.'
                   );
    }
});

module('loader object');

test('methods', function () {
    var loader = exports.loader();

    strictEqual(typeof loader.load, 'function', "typeof loader.load");
    strictEqual(typeof loader.reload, 'function', "typeof loader.reload");
    strictEqual(typeof loader.find, 'function', "typeof loader.find");
    strictEqual(typeof loader.evaluate, 'function', "typeof loader.evaluate");
    strictEqual(typeof loader.resolve, 'function', "typeof loader.resolve");
});

// TODO: make_find_and_fetch() should be stubbed out for this test.
test('.find() Invalid file extension.', function () {
    var loader = exports.loader();
    try {
        loader.find('file.js');
        ok(false, 'Expected an error.');
    } catch (e) {
        strictEqual(e.name, 'TypeError', 'Threw a type error.');
    }
});

// TODO: make_find_and_fetch() should be stubbed out for this test.
test('.find() Missing URI protocol.', function () {
    var loader
      , base = get_dir()
      , warning, debug
      , logger = { warn: function (x) { warning = x; }
                 , debug: function (x) { debug = x; }
                 }
      , r
      ;

      base.append('install.rdf');
      // This will throw; base.path should have `file://` prefix.
      loader = exports.loader({logger: logger, paths: [base.path]});

      try {
          r = loader.find('foo');
          ok(false, 'expected an error');
      } catch (e) {
          ok(e instanceof TypeError, 'e instanceof TypeError');
      }
      strictEqual(typeof r, 'undefined', 'typeof r');

      // This error is not logged.
      strictEqual(typeof warning, 'undefined', 'typeof warning');
      strictEqual(typeof debug, 'undefined', 'typeof debug');
});

// TODO: make_find_and_fetch() should be stubbed out for this test.
test('.find() File not found -- not a dir.', function () {
    var loader
      , base = get_dir()
      , warning, debug
      , logger = { warn: function (x) { warning = x; }
                 , debug: function (x) { debug = x; }
                 }
      , r
      ;

      base.append('install.rdf');
      loader = exports.loader({logger: logger, paths: ['file://'+ base.path]});

      r = loader.find('foo');
      strictEqual(r, null, 'value of r');

      // We get a debug message for this.
      strictEqual(typeof debug, 'string', 'typeof debug');
      strictEqual(typeof warning, 'undefined', 'typeof warning');
});

// TODO: make_find_and_fetch() should be stubbed out for this test.
test('.find() File not found.', function () {
    var loader
      , base = get_dir()
      , warning, debug
      , logger = { warn: function (x) { warning = x; }
                 , debug: function (x) { debug = x; }
                 }
      , r
      ;

      loader = exports.loader({logger: logger, paths: ['file://'+ base.path]});
      r = loader.find('foo');
      strictEqual(r, null, 'value of r');

      // We get a debug message for this.
      strictEqual(typeof debug, 'string', 'typeof debug');
      strictEqual(typeof warning, 'undefined', 'typeof warning');
});

// TODO: make_find_and_fetch() should be stubbed out for this test.
test('.find() File found and read.', function () {
    var loader
      , base = get_dir()
      , warning, debug
      , logger = { warn: function (x) { warning = x; }
                 , debug: function (x) { debug = x; }
                 }
      , r
      ;

      base.append('packages');
      loader = exports.loader({logger: logger, paths: ['file://'+ base.path]});

      r = loader.find('kake-test/lib/loader');
      strictEqual(typeof r, 'string', 'typeof r');
      strictEqual(typeof warning, 'undefined', 'typeof warning');
      strictEqual(typeof debug, 'undefined', 'typeof debug');
});

// TODO: make_find_and_fetch() should be stubbed out for this test.
test('.find() Path priority.', function () {
    var loader
      , base = get_dir()
      , warning, debug
      , logger = { warn: function (x) { warning = x; }
                 , debug: function (x) { debug = x; }
                 }
      , uria, urib
      , paths
      ;

      base.append('packages');
      paths = [ 'file://' + base.path

              // This path would normally throw an error except that it is
              // second priority to the first path.
              , base.path
              ];

      loader = exports.loader({logger: logger, paths: paths});

      uria = loader.find('kake-test/lib/loader');
      strictEqual(typeof uria, 'string', 'typeof uri');
      strictEqual(typeof warning, 'undefined', 'typeof warning');
      strictEqual(typeof debug, 'undefined', 'typeof debug');
      warning = false;
      debug = false;

      // Move the good path to second priority.
      paths[1] = paths[0];

      // The JS file will not be found in this path.
      base.append('kake-test');
      paths[0] = 'file://' + base.path;

      // We have to recreate the loader with the new paths object.
      loader = exports.loader({logger: logger, paths: paths});

      urib = loader.find('kake-test/lib/loader');
      strictEqual(uria, urib, 'uria === urib');
      strictEqual(typeof warning, 'boolean', 'typeof warning');
      strictEqual(typeof debug, 'boolean', 'typeof debug');
});

// TODO: Test loader.load and loader.reload.

module('[private] make_require');

test('returns a function', function () {
    strictEqual( typeof make_require()
               , 'function'
               , "typeof make_require()"
               );
});

test('require() throws on non-string argument.', function () {
    strictEqual( typeof make_require()
               , 'function'
               , "typeof make_require()"
               );

    try {
        make_require()();
        ok(false, 'expected an error');
    } catch (e_undefined) {
        ok( e_undefined instanceof TypeError
          , "e_undefined instanceof TypeError"
          );
    }
    try {
        make_require()({});
        ok(false, 'expected an error');
    } catch (e_object) {
        ok( e_object instanceof TypeError
          , "e_object instanceof TypeError"
          );
    }
    try {
        make_require()(1);
        ok(false, 'expected an error');
    } catch (e_number) {
        ok( e_number instanceof TypeError
          , "e_number instanceof TypeError"
          );
    }
    try {
        make_require()(false);
        ok(false, 'expected an error');
    } catch (e_bool) {
        ok( e_bool instanceof TypeError
          , "e_bool instanceof TypeError"
          );
    }
    try {
        make_require()(null);
        ok(false, 'expected an error');
    } catch (e_null) {
        ok( e_null instanceof TypeError
          , "e_null instanceof TypeError"
          );
    }
});

test('require() throws when module cannot be found.', function () {
    var req = make_require( null // base
                          // resolve
                          , function () {}
                          // load
                          , function () { return {module: null}; }
                          );

    try {
        req('');
        ok(false, 'expected a thrown error.');
    } catch (e) {
        ok( e instanceof exports.RequireError
          , "e instanceof exports.RequireError"
          );
    }
});

test('require() returns exported module.', function () {
    var mod = {}
      , r
      , req = make_require( null // base
                          // resolve
                          , function () {}
                          // load
                          , function () { return {module: mod}; }
                          );

    r = req('');
    strictEqual(r, mod, 'returns exported module');
});

module('runtime');

test('returns a function', function () {
    strictEqual( typeof exports.runtime()
               , 'function'
               , "typeof exports.runtime()"
               );
});

test('returns cached module', function () {
    var run
      , r
      , foo = {}
      , opts = { modules: {foo: foo} }
      ;

    run = exports.runtime(opts);

    // foo would normally not be found on the non-existant path,
    // but since we pre-cached it, we're good to go.
    r = run('foo');
    strictEqual(r.module, foo, 'r.module === foo');
    strictEqual(r.message, 'OK', "r.message === 'ok'");
});

test('module loading error', function () {
    var run
      , r
      , foo = {}
      , warning, debug
      , logger = { warn: function (x) { warning = x; }
                 , debug: function (x) { debug = x; }
                 }
      , loader = { load: function () { throw new Error('message'); } }
      , opts = { modules: {foo: foo}
               , logger: logger
               , loader: loader
               }
      ;

    run = exports.runtime(opts);

    r = run('bar'); // bar is not cached.
    strictEqual(r.module, null, 'r.module === null');
    strictEqual(r.message, 'message', "r.message === 'message'");

    // Got debug and warning messages.
    strictEqual(typeof warning, 'string', "typeof warning");
    strictEqual(typeof debug, 'string', "typeof debug");

    // No caching.
    strictEqual( typeof opts.modules.bar
               , 'undefined'
               , 'module was not cached.'
               );
});

test('initialization error', function () {
    var run
      , r
      , foo = {}
      , warning, debug
      , logger = { warn: function (x) { warning = x; }
                 , debug: function (x) { debug = x; }
                 }
      , loader = { load: function () {
                             return function () { throw new Error('message'); }
                         }
                 }
      , opts = { modules: {foo: foo}
               , logger: logger
               , loader: loader
               }
      ;

    run = exports.runtime(opts);

    r = run('bar'); // bar is not cached.
    strictEqual(r.module, null, 'r.module === null');
    strictEqual(r.message, 'message', "r.message === 'message'");

    // Got debug and warning messages.
    strictEqual(typeof warning, 'string', "typeof warning");
    strictEqual(typeof debug, 'string', "typeof debug");

    // No caching.
    strictEqual( typeof opts.modules.bar
               , 'undefined'
               , 'module was not cached.'
               );
});

test('success', function () {
    var run
      , r
      , foo = {}
      , warning, debug
      , logger = { warn: function (x) { warning = x; }
                 , debug: function (x) { debug = x; }
                 }
      , loader = { load: function () {
                             return function (inject) {
                                inject.exports.a = 1;
                             }
                         }
                 }
      , opts = { modules: {foo: foo}
               , logger: logger
               , loader: loader
               }
      ;

    run = exports.runtime(opts);

    r = run('bar'); // bar is not cached.
    strictEqual(r.module.a, 1, 'r.module.a === 1');
    strictEqual(r.message, 'OK', "r.message === 'OK'");

    // No debug and warning messages.
    strictEqual(typeof warning, 'undefined', "typeof warning");
    strictEqual(typeof debug, 'undefined', "typeof debug");

    // Cached.
    strictEqual( typeof opts.modules.bar
               , 'object'
               , 'module was cached.'
               );
});

