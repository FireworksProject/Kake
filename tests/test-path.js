/**
 * @fileOverview 
 * @author Kris Walker <kris@kixx.name>
 *
 * Copyright (c) 2010 The Fireworks Project <www.fireworksproject.com>
 * Some rights are reserved, but licensed to you under the MIT license.
 * See MIT-LICENSE or http://opensource.org/licenses/mit-license.php
 * for more information.
 * 
 * Prior art:
 * John Resig - http://ejohn.org/ - MIT Licensed
 * Rick Strahl - http://www.west-wind.com/Weblog/posts/509108.aspx
 */

/*jslint
  laxbreak: true
, onevar: true
, undef: true
, nomen: true
, eqeqeq: true
, plusplus: true
, bitwise: true
, regexp: true
, newcap: true
, immed: true
, strict: false
*/

/*global require: false, exports: true, console: false */

dump('\n');
console.log('starting', __url__);

var path = require('future/path')
  , url = require('url')
  ;

exports.constructor_with_new = function (test) {
    var p = new path.Path();
    test.assert( p instanceof path.Path
               , 'new path.Path() is instanceof path.Path');
};

exports.constructor_without_new = function (test) {
    var p = path.Path();
    test.assert( p instanceof path.Path
               , 'path.Path() is instanceof path.Path');
};

exports.constructor_invalid_args = function (test) {
    test.assertRaises(
          function () {
              var p = path.Path({});
          }
        , 'Invalid path.Path() type [object Object]'
        , 'path.Path([object Object])'
        );
    test.assertRaises(
          function () {
              var p = path.Path([]);
          }
        , 'Invalid path.Path() type [object Array]'
        , 'path.Path([object Array])'
        );
    test.assertRaises(
          function () {
              var p = path.Path(function () {});
          }
        , 'Invalid path.Path() type [object Function]'
        , 'path.Path([object Function])'
        );
    test.assertRaises(
          function () {
              var p = path.Path(true);
          }
        , 'Invalid path.Path() type [object Boolean]'
        , 'path.Path([object Boolean])'
        );
};

exports.toString_values = function (test) {
    var p = path.Path().toString();
    test.assert(p === '', 'path.Path().toString() === ""');
    p = path.Path(null).toString();
    test.assert(p === '', 'path.Path("").toString() === ""');
    p = path.Path(false).toString();
    test.assert(p === '', 'path.Path("").toString() === ""');
    p = path.Path('').toString();
    test.assert(p === '', 'path.Path("").toString() === ""');
    p = path.Path('foo').toString();
    test.assert(p === 'foo', 'path.Path("foo").toString() === "foo"');
};

exports.parent_invalid_path = function (test) {
    test.assertRaises(
          function () {
              var p = path.Path().parent();
          }
        , 'unrecognized child path: ""'
        , 'path.Path().parent()'
        );
    test.assertRaises(
          function () {
              var p = path.Path('foo').parent();
          }
        , 'unrecognized child path: "foo"'
        , 'path.Path("foo").parent()'
        );
};

exports.parent_this_path = function (test) {
    var this_path = url.toFilename(__url__)
      , p = path.Path(this_path).parent()
      ;

    test.assertEqual( this_path.slice(p.toString().length +1)
                    , 'test-path.js'
                    , 'this_path.slice(p.length) === "test-path.js"'
                    );
};

exports.parent_root = function (test) {
    var i = 0
      , p = path.Path(url.toFilename(__url__))
      ;

    while (p && i < 100) {
        p = p.parent();
        i += 1;
    }

    test.assert(p === null, 'path.Path(root).parent() === null');
};

exports.join_invalid_path = function (test) {
    test.assertRaises(
          function () {
              var p = path.Path().join();
          }
        , 'unrecognized path(s): " "'
        , 'path.Path().join()'
        );
    test.assertRaises(
          function () {
              var p = path.Path().join('foo');
          }
        , 'unrecognized path(s): " foo"'
        , 'path.Path().join()'
        );
    test.assertRaises(
          function () {
              var p = path.Path('foo').join();
          }
        , 'unrecognized path(s): "foo "'
        , 'path.Path().join()'
        );
    test.assertRaises(
          function () {
              var p = path.Path('foo').join('bar');
          }
        , 'unrecognized path(s): "foo bar"'
        , 'path.Path().join()'
        );
    test.assertRaises(
          function () {
              var p = path.Path('foo').join('bar', 'baz');
          }
        , 'unrecognized path(s): "foo bar baz"'
        , 'path.Path().join()'
        );
    test.assertRaises(
          function () {
              var p = path.Path('foo').join('bar', {});
          }
        , 'unrecognized path(s): "foo bar [object Object]"'
        , 'path.Path().join()'
        );
};

exports.join_this_path = function (test) {
    var this_path = path.Path(url.toFilename(__url__))
      , p = this_path.parent().join('test-path.js')
      ;

    test.assertEqual(this_path.toString(), p.toString(), 'join this path');
};

exports.exists_invalid_path = function (test) {
    test.assert(path.Path().exists() === false,
                'path.Path().exists() === false');
    test.assert(path.Path('').exists() === false,
                'path.Path("").exists() === false');
    test.assert(path.Path(null).exists() === false,
                'path.Path(null).exists() === false');
    test.assert(path.Path(false).exists() === false,
                'path.Path(false).exists() === false');
};

exports.mkpath_invalid = function (test) {
    var this_path = path.Path(url.toFilename(__url__));
    test.assertRaises(
          function () {
              this_path.mkpath();
          }
        , 'The path already exists and is not a directory: '+ this_path
        , 'this_path.mkpath()'
        );
};

exports.mkpath_exists = function (test) {
    var this_path = path.Path(url.toFilename(__url__))
      , p = this_path.parent().mkpath()
      ;

    test.assertEqual( p.toString()
                    , this_path.parent().toString()
                    , 'create existing path'
                    );
};

exports.mkpath_create = function (test) {
    var this_path = path.Path(url.toFilename(__url__))
      , p = this_path.parent().join('testing_mkpath').mkpath()
      , now = new Date().getTime()
      , created = p.mtime().getTime()
      , diff = now - created
      ;

    p.rm();
    if (diff >= 7000) {
      console.debug('mkpath() now created diff', now, created, diff);
    }
    test.assert(diff < 7000, 'mkpath() time_now - mtime');
};

exports.rm_invalid = function (test) {
    test.assert( path.Path().rm() instanceof path.Path
               , 'path.Path().rm()'
               );
    
    var some_invalid_path = path.Path(url.toFilename(__url__))
                                .parent()
                                .join('foo')
                                ;
    test.assert( some_invalid_path.rm() instanceof path.Path
               , 'some_invalid_path.rm()'
               );
};

exports.mkpath_rm = function (test) {
    var new_path = path.Path(url.toFilename(__url__))
                       .parent()
                       .join('foo')
                       .mkpath()
                       ;

    test.assert(new_path.exists(), 'new_path.exists()');
    test.assert( new_path.rm() instanceof path.Path
               , 'new_path.rm()'
               );
    test.assert(!new_path.exists(), '!new_path.exists()');
};

exports.read_invalid = function (test) {
    test.assertRaises(
          function () {
              path.Path().read();
          }
        , 'unrecognized path: ""'
        , 'path.Path("").read()'
        );
    test.assertRaises(
          function () {
              path.Path('foo').read();
          }
        , 'unrecognized path: "foo"'
        , 'path.Path("foo").read() undefined path.'
        );
};

exports.write_invalid = function (test) {
    var parent_path = path.Path(url.toFilename(__url__)).parent();

    test.assertRaises(
          function () {
              parent_path.join('foo', 'baz').write('hello world');
          }
        , 'path does not exist: '+ parent_path.join('foo', 'baz')
        , '.write() path does not exist.'
        );
};

exports.write_read_rm = function (test) {
    var parent_path = path.Path(url.toFilename(__url__)).parent()
      , this_path = parent_path.join('foo').write('hello world')
      , text = this_path.read()
      ;

    this_path.rm();
    test.assertEqual( text
                    , 'hello world'
                    , 'this_path.read() === "hello world"'
                    );
};

exports.run_invalid = function (test) {
    var this_path = path.Path(url.toFilename(__url__)).parent();

    test.assertRaises(
          function () {
              this_path.join('foo').run();
          }
        , 'path does not exist: '+ this_path.join('foo')
        , '.run() path does not exist.'
        );

    test.assertRaises(
          function () {
              this_path.run();
          }
        , 'typeof .run() callback ["undefined"] !== "function"'
        , '.run() expects a callback function'
        );
};

exports.run_dir = function (test) {
    var this_path = path.Path(url.toFilename(__url__)).parent();

    test.waitUntilDone(3000);
    this_path.run(function (err) {
        test.assertEqual( err.message
                        , 'not a file: "'+ this_path +'"'
                        , 'tried to run a directory'
                        );
        test.done();
    });
};

exports.run_noexec = function (test) {
    var this_path = path.Path(url.toFilename(__url__));

    test.waitUntilDone(3000);
    this_path.run(function (err) {
        test.assertEqual( err.message
                        , 'execute permission denied: "'+ this_path +'"'
                        , 'tried to run a directory'
                        );
        test.done();
    });
};

exports.run_with_args = function (test) {
    var this_path = path.Path(url.toFilename(__url__))
                        .parent()
                        .join('pathrun.sh')
                        ;

    test.waitUntilDone(3000);
    this_path.run(['foo', 2], function (err, rv) {
        test.assertEqual(typeof err, 'undefined', 'no error is detected');
        test.assertEqual( rv 
                        , this_path +'\nfoo\n2\n'
                        , 'echo arguments'
                        );
        test.done();
    });
};

exports.run_without_args = function (test) {
    var this_path = path.Path(url.toFilename(__url__))
                        .parent()
                        .join('pathrun.sh')
                        ;

    test.waitUntilDone(3000);
    this_path.run(function (err, rv) {
        test.assertEqual(typeof err, 'undefined', 'no error is detected');
        test.assertEqual( rv 
                        , this_path +'\n\n\n'
                        , 'echo arguments'
                        );
        test.done();
    });
};

