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
        , 'settings(undefined)'
        );

    test.assertRaises(
          function () { settings.declare({}); }
        , 'typeof key [undefined] !== "string"'
        , 'settings({})'
        );

    test.assertRaises(
          function () { settings.declare({key: null}); }
        , 'typeof key [object] !== "string"'
        , 'settings({key: null})'
        );

    test.assertRaises(
          function () { settings.declare({key: false}); }
        , 'typeof key [boolean] !== "string"'
        , 'settings({key: false})'
        );

    test.assertRaises(
          function () { settings.declare({key: 0}); }
        , 'typeof key [number] !== "string"'
        , 'settings({key: 0})'
        );

    test.assertRaises(
          function () { settings.declare({key: function () {}}); }
        , 'typeof key [function] !== "string"'
        , 'settings({key: function () {}})'
        );

    test.assertRaises(
          function () { settings.declare({key: []}); }
        , 'typeof key [object] !== "string"'
        , 'settings({key: []})'
        );

    test.assertRaises(
          function () { settings.declare({key: {}}); }
        , 'typeof key [object] !== "string"'
        , 'settings({key: {}})'
        );
};

exports.declare_invalid_setting_type = function (test) {
    var settings = msettings.make_Settings();

    test.assertRaises(
          function () { settings.declare({key: '', type: null}); }
        , 'typeof type [object] !== "string"'
        , 'settings({type: null})'
        );

    test.assertRaises(
          function () { settings.declare({key: '', type: false}); }
        , 'typeof type [boolean] !== "string"'
        , 'settings({type: false})'
        );

    test.assertRaises(
          function () { settings.declare({key: '', type: 0}); }
        , 'typeof type [number] !== "string"'
        , 'settings({type: 0})'
        );

    test.assertRaises(
          function () { settings.declare({key: '', type: function () {}}); }
        , 'typeof type [function] !== "string"'
        , 'settings({type: function () {}})'
        );

    test.assertRaises(
          function () { settings.declare({key: '', type: []}); }
        , 'typeof type [object] !== "string"'
        , 'settings({type: []})'
        );

    test.assertRaises(
          function () { settings.declare({key: '', type: {}}); }
        , 'typeof type [object] !== "string"'
        , 'settings({type: {}})'
        );

    test.assertRaises(
          function () { settings.declare({key: '', type: 'foo'}); }
        , 'Invalid setting type [foo].'
        , 'settings({type: {}})'
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
