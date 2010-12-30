/**
 * @fileOverview 
 * @author Kris Walker <kris@kixx.name>
 *
 * Copyright (c) 2010 The Fireworks Project <www.fireworksproject.com>
 * Some rights are reserved, but licensed to you under the MIT license.
 * See MIT-LICENSE or http://opensource.org/licenses/mit-license.php
 * for more information.
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

/*global require: false, exports: true, console: false, dump: false */

dump('\n');
console.log('starting', __url__);

var msettings = require('build-kit/settings');

exports.constructor_has_2_names = function (test) {
    test.assertEqual( typeof msettings.make_Settings
                    , 'function'
                    , 'typeof msettings.make_Settings == "function"'
                    );
    test.assertEqual( typeof msettings.makeSettings
                    , 'function'
                    , 'typeof msettings.makeSettings == "function"'
                    );
    test.assert( msettings.make_Settings === msettings.makeSettings
               , 'msettings.make_Settings === msettings.makeSettings'
               );
};

exports.declare_invalid_key = function (test) {
    var settings = msettings.make_Settings();

    test.assertRaises(
          function () { settings.declare(); }
        , 'typeof key [undefined] !== "string"'
        , 'settings.declare(undefined)'
        );

    test.assertRaises(
          function () { settings.declare({}); }
        , 'typeof key [undefined] !== "string"'
        , 'settings.declare({})'
        );

    test.assertRaises(
          function () { settings.declare({key: null}); }
        , 'typeof key [object] !== "string"'
        , 'settings.declare({key: null})'
        );

    test.assertRaises(
          function () { settings.declare({key: false}); }
        , 'typeof key [boolean] !== "string"'
        , 'settings.declare({key: false})'
        );

    test.assertRaises(
          function () { settings.declare({key: 0}); }
        , 'typeof key [number] !== "string"'
        , 'settings.declare({key: 0})'
        );

    test.assertRaises(
          function () { settings.declare({key: function () {}}); }
        , 'typeof key [function] !== "string"'
        , 'settings.declare({key: function () {}})'
        );

    test.assertRaises(
          function () { settings.declare({key: []}); }
        , 'typeof key [object] !== "string"'
        , 'settings.declare({key: []})'
        );

    test.assertRaises(
          function () { settings.declare({key: {}}); }
        , 'typeof key [object] !== "string"'
        , 'settings.declare({key: {}})'
        );
};

exports.declare_invalid_setting_type = function (test) {
    var settings = msettings.make_Settings();

    test.assertRaises(
          function () { settings.declare({key: '', type: null}); }
        , 'typeof type [object] !== "string"'
        , 'settings.declare({type: null})'
        );

    test.assertRaises(
          function () { settings.declare({key: '', type: false}); }
        , 'typeof type [boolean] !== "string"'
        , 'settings.declare({type: false})'
        );

    test.assertRaises(
          function () { settings.declare({key: '', type: 0}); }
        , 'typeof type [number] !== "string"'
        , 'settings.declare({type: 0})'
        );

    test.assertRaises(
          function () { settings.declare({key: '', type: function () {}}); }
        , 'typeof type [function] !== "string"'
        , 'settings.declare({type: function () {}})'
        );

    test.assertRaises(
          function () { settings.declare({key: '', type: []}); }
        , 'typeof type [object] !== "string"'
        , 'settings.declare({type: []})'
        );

    test.assertRaises(
          function () { settings.declare({key: '', type: {}}); }
        , 'typeof type [object] !== "string"'
        , 'settings.declare({type: {}})'
        );

    test.assertRaises(
          function () { settings.declare({key: '', type: 'foo'}); }
        , 'Invalid setting type [foo].'
        , 'settings.declare({type: {}})'
        );
};

exports.make_declaration = function (test) {
    var settings = msettings.make_Settings()
      , foo
      ;

    settings.declare({key: 'foo', type: 'string'});
    foo = JSON.parse(settings.spec('foo'));

    test.assertEqual(foo.key, 'foo', 'foo.key');
    test.assertEqual(foo.type, 'string', 'foo.typeof');
    test.assertEqual(typeof foo.value, 'undefined', 'typeof foo.value');
};

exports.set_invalid_key = function (test) {
    var settings = msettings.make_Settings();

    test.assertRaises(
          function () { settings.set(); }
        , 'typeof key [undefined] !== "string"'
        , 'settings.set()'
        );

    test.assertRaises(
          function () { settings.set(null); }
        , 'typeof key [object] !== "string"'
        , 'settings.set(null)'
        );

    test.assertRaises(
          function () { settings.set(false); }
        , 'typeof key [boolean] !== "string"'
        , 'settings.set(false)'
        );

    test.assertRaises(
          function () { settings.set(0); }
        , 'typeof key [number] !== "string"'
        , 'settings.set(0)'
        );

    test.assertRaises(
          function () { settings.set(function () {}); }
        , 'typeof key [function] !== "string"'
        , 'settings.set(function () {})'
        );

    test.assertRaises(
          function () { settings.set([]); }
        , 'typeof key [object] !== "string"'
        , 'settings.set([])'
        );

    test.assertRaises(
          function () { settings.set({}); }
        , 'typeof key [object] !== "string"'
        , 'settings.set({})'
        );
};

exports.set_undeclared_key = function (test) {
    var settings = msettings.make_Settings();

    test.assertRaises(
          function () { settings.set('foo'); }
        , '"foo" has not been declared'
        , 'settings.set("foo")'
        );
};

exports.set_invalid_type = function (test) {
    var settings = msettings.make_Settings()
      , foo_string
      , foo_file
      , foo_dir
      , foo_number
      ;

    settings.declare({key: 'foo_string', type: 'string'});
    settings.declare({key: 'foo_file', type: 'filepath'});
    settings.declare({key: 'foo_dir', type: 'folderpath'});
    settings.declare({key: 'foo_number', type: 'number'});

    // string type
    test.assertRaises(
          function () { settings.set('foo_string'); }
        , 'Invalid setting type [undefined] for key "foo_string"'
        , 'settings.set("foo_string")'
        );

    test.assertRaises(
          function () { settings.set('foo_string', null); }
        , 'Invalid setting type [object] for key "foo_string"'
        , 'settings.set("foo_string", null)'
        );

    test.assertRaises(
          function () { settings.set('foo_string', true); }
        , 'Invalid setting type [boolean] for key "foo_string"'
        , 'settings.set("foo_string", true)'
        );

    test.assertRaises(
          function () { settings.set('foo_string', 9); }
        , 'Invalid setting type [number] for key "foo_string"'
        , 'settings.set("foo_string", 9)'
        );

    test.assertRaises(
          function () { settings.set('foo_string', function () {}); }
        , 'Invalid setting type [function] for key "foo_string"'
        , 'settings.set("foo_string", function () {})'
        );

    test.assertRaises(
          function () { settings.set('foo_string', []); }
        , 'Invalid setting type [object] for key "foo_string"'
        , 'settings.set("foo_string", [])'
        );

    test.assertRaises(
          function () { settings.set('foo_string', {}); }
        , 'Invalid setting type [object] for key "foo_string"'
        , 'settings.set("foo_string", {})'
        );

    // folderpath type
    test.assertRaises(
          function () { settings.set('foo_dir'); }
        , 'Invalid setting type [undefined] for key "foo_dir"'
        , 'settings.set("foo_dir")'
        );

    test.assertRaises(
          function () { settings.set('foo_dir', null); }
        , 'Invalid setting type [object] for key "foo_dir"'
        , 'settings.set("foo_dir", null)'
        );

    test.assertRaises(
          function () { settings.set('foo_dir', true); }
        , 'Invalid setting type [boolean] for key "foo_dir"'
        , 'settings.set("foo_dir", true)'
        );

    test.assertRaises(
          function () { settings.set('foo_dir', 9); }
        , 'Invalid setting type [number] for key "foo_dir"'
        , 'settings.set("foo_dir", 9)'
        );

    test.assertRaises(
          function () { settings.set('foo_dir', function () {}); }
        , 'Invalid setting type [function] for key "foo_dir"'
        , 'settings.set("foo_dir", function () {})'
        );

    test.assertRaises(
          function () { settings.set('foo_dir', []); }
        , 'Invalid setting type [object] for key "foo_dir"'
        , 'settings.set("foo_dir", [])'
        );

    test.assertRaises(
          function () { settings.set('foo_dir', {}); }
        , 'Invalid setting type [object] for key "foo_dir"'
        , 'settings.set("foo_dir", {})'
        );

    // filepath type
    test.assertRaises(
          function () { settings.set('foo_file'); }
        , 'Invalid setting type [undefined] for key "foo_file"'
        , 'settings.set("foo_file")'
        );

    test.assertRaises(
          function () { settings.set('foo_file', null); }
        , 'Invalid setting type [object] for key "foo_file"'
        , 'settings.set("foo_file", null)'
        );

    test.assertRaises(
          function () { settings.set('foo_file', true); }
        , 'Invalid setting type [boolean] for key "foo_file"'
        , 'settings.set("foo_file", true)'
        );

    test.assertRaises(
          function () { settings.set('foo_file', 9); }
        , 'Invalid setting type [number] for key "foo_file"'
        , 'settings.set("foo_file", 9)'
        );

    test.assertRaises(
          function () { settings.set('foo_file', function () {}); }
        , 'Invalid setting type [function] for key "foo_file"'
        , 'settings.set("foo_file", function () {})'
        );

    test.assertRaises(
          function () { settings.set('foo_file', []); }
        , 'Invalid setting type [object] for key "foo_file"'
        , 'settings.set("foo_file", [])'
        );

    test.assertRaises(
          function () { settings.set('foo_file', {}); }
        , 'Invalid setting type [object] for key "foo_file"'
        , 'settings.set("foo_file", {})'
        );

    // number type
    test.assertRaises(
          function () { settings.set('foo_number'); }
        , 'Invalid setting type [undefined] for key "foo_number"'
        , 'settings.set("foo_number")'
        );

    test.assertRaises(
          function () { settings.set('foo_number', null); }
        , 'Invalid setting type [object] for key "foo_number"'
        , 'settings.set("foo_number", null)'
        );

    test.assertRaises(
          function () { settings.set('foo_number', true); }
        , 'Invalid setting type [boolean] for key "foo_number"'
        , 'settings.set("foo_number", true)'
        );

    test.assertRaises(
          function () { settings.set('foo_number', '9'); }
        , 'Invalid setting type [string] for key "foo_number"'
        , 'settings.set("foo_number", "9")'
        );

    test.assertRaises(
          function () { settings.set('foo_number', function () {}); }
        , 'Invalid setting type [function] for key "foo_number"'
        , 'settings.set("foo_number", function () {})'
        );

    test.assertRaises(
          function () { settings.set('foo_number', []); }
        , 'Invalid setting type [object] for key "foo_number"'
        , 'settings.set("foo_number", [])'
        );

    test.assertRaises(
          function () { settings.set('foo_number', {}); }
        , 'Invalid setting type [object] for key "foo_number"'
        , 'settings.set("foo_number", {})'
        );

    foo_string = JSON.parse(settings.spec('foo_string'));
    foo_file = JSON.parse(settings.spec('foo_file'));
    foo_dir = JSON.parse(settings.spec('foo_dir'));
    foo_number = JSON.parse(settings.spec('foo_number'));

    test.assertEqual(typeof foo_string.value, 'undefined', 'typeof foo_string.value');
    test.assertEqual(typeof foo_file.value, 'undefined', 'typeof foo_file.value');
    test.assertEqual(typeof foo_dir.value, 'undefined', 'typeof foo_dir.value');
    test.assertEqual(typeof foo_number.value, 'undefined', 'typeof foo_number.value');
};

exports.get_undeclared_key = function (test) {
    var settings = msettings.make_Settings();

    test.assertRaises(
          function () { settings.get('foo'); }
        , '"foo" has not been declared'
        , 'settings.get("foo")'
        );
};

exports.set_and_get = function (test) {
    var settings = msettings.make_Settings()
      , foo_string
      , foo_file
      , foo_dir
      , foo_number
      , all
      ;

    settings.declare({key: 'foo_string', type: 'string'});
    settings.declare({key: 'foo_file', type: 'filepath'});
    settings.declare({key: 'foo_dir', type: 'folderpath'});
    settings.declare({key: 'foo_number', type: 'number'});

    test.assertEqual( typeof settings.get('foo_string')
                    , 'undefined'
                    , 'settings.get("foo_string") === undefined'
                    );
    test.assertEqual( typeof settings.get('foo_file')
                    , 'undefined'
                    , 'settings.get("foo_file") === undefined'
                    );
    test.assertEqual( typeof settings.get('foo_dir')
                    , 'undefined'
                    , 'settings.get("foo_dir") === undefined'
                    );
    test.assertEqual( typeof settings.get('foo_number')
                    , 'undefined'
                    , 'settings.get("foo_number") === undefined'
                    );

    foo_string = JSON.parse(settings.spec('foo_string'));
    foo_file = JSON.parse(settings.spec('foo_file'));
    foo_dir = JSON.parse(settings.spec('foo_dir'));
    foo_number = JSON.parse(settings.spec('foo_number'));

    test.assertEqual( foo_string.key
                    , 'foo_string'
                    , 'settings.spec() foo_string.key'
                    );
    test.assertEqual( foo_string.type
                    , 'string'
                    , 'settings.spec() foo_string.type'
                    );
    test.assertEqual( foo_dir.key
                    , 'foo_dir'
                    , 'settings.spec() foo_dir.key'
                    );
    test.assertEqual( foo_dir.type
                    , 'folderpath'
                    , 'settings.spec() foo_dir.type'
                    );
    test.assertEqual( foo_file.key
                    , 'foo_file'
                    , 'settings.spec() foo_file.key'
                    );
    test.assertEqual( foo_file.type
                    , 'filepath'
                    , 'settings.spec() foo_file.type'
                    );
    test.assertEqual( foo_number.key
                    , 'foo_number'
                    , 'settings.spec() foo_number.key'
                    );
    test.assertEqual( foo_number.type
                    , 'number'
                    , 'settings.spec() foo_number.type'
                    );

    all = JSON.parse(settings.all());

    test.assertEqual( all.foo_string.key
                    , 'foo_string'
                    , 'settings.spec() all.foo_string.key'
                    );
    test.assertEqual( all.foo_string.type
                    , 'string'
                    , 'settings.spec() all.foo_string.type'
                    );
    test.assertEqual( all.foo_dir.key
                    , 'foo_dir'
                    , 'settings.spec() all.foo_dir.key'
                    );
    test.assertEqual( all.foo_dir.type
                    , 'folderpath'
                    , 'settings.spec() all.foo_dir.type'
                    );
    test.assertEqual( all.foo_file.key
                    , 'foo_file'
                    , 'settings.spec() all.foo_file.key'
                    );
    test.assertEqual( all.foo_file.type
                    , 'filepath'
                    , 'settings.spec() all.foo_file.type'
                    );
    test.assertEqual( all.foo_number.key
                    , 'foo_number'
                    , 'settings.spec() all.foo_number.key'
                    );
    test.assertEqual( all.foo_number.type
                    , 'number'
                    , 'settings.spec() all.foo_number.type'
                    );

    settings.set('foo_string', 'foo string');
    settings.set('foo_file', 'foo file');
    settings.set('foo_dir', 'foo dir');
    settings.set('foo_number', 9);

    test.assertEqual( settings.get('foo_string')
                    , 'foo string'
                    , 'settings.get("foo_string") === "foo string"'
                    );
    test.assertEqual( settings.get('foo_file')
                    , 'foo file'
                    , 'settings.get("foo_file") === "foo file"'
                    );
    test.assertEqual( settings.get('foo_dir')
                    , 'foo dir'
                    , 'settings.get("foo_dir") === "foo dir"'
                    );
    test.assertEqual( settings.get('foo_number')
                    , 9
                    , 'settings.get("foo_number") === 9'
                    );

    foo_string = JSON.parse(settings.spec('foo_string'));
    foo_file = JSON.parse(settings.spec('foo_file'));
    foo_dir = JSON.parse(settings.spec('foo_dir'));
    foo_number = JSON.parse(settings.spec('foo_number'));

    test.assertEqual( foo_string.value
                    , 'foo string'
                    , 'settings.spec() foo_string.value'
                    );
    test.assertEqual( foo_dir.value
                    , 'foo dir'
                    , 'settings.spec() foo_dir.value'
                    );
    test.assertEqual( foo_file.value
                    , 'foo file'
                    , 'settings.spec() foo_file.value'
                    );
    test.assertEqual( foo_number.value
                    , 9
                    , 'settings.spec() foo_number.value'
                    );

    all = JSON.parse(settings.all());

    test.assertEqual( all.foo_string.value
                    , 'foo string'
                    , 'settings.spec() all.foo_string.value'
                    );
    test.assertEqual( all.foo_dir.value
                    , 'foo dir'
                    , 'settings.spec() all.foo_dir.value'
                    );
    test.assertEqual( all.foo_file.value
                    , 'foo file'
                    , 'settings.spec() all.foo_file.value'
                    );
    test.assertEqual( all.foo_number.value
                    , 9
                    , 'settings.spec() all.foo_number.value'
                    );
};
