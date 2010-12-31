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

var mtasks = require('build-kit/taskrunner');

// TODO: More testing
// see issue #5 https://github.com/FireworksProject/Kake/issues/issue/5

exports.constructor_names = function (test) {
    test.assertEqual( typeof mtasks.make_Taskrunner
                    , 'function'
                    , 'typeof mtasks.make_Taskrunner === "function"'
                    );
    test.assertEqual( typeof mtasks.makeTaskrunner
                    , 'function'
                    , 'typeof mtasks.makeTaskrunner === "function"'
                    );

    test.assert( mtasks.make_Taskrunner === mtasks.makeTaskrunner
               , 'mtasks.make_Taskrunner === mtasks.makeTaskrunner'
               );
};

exports.invalid_listeners = function (test) {
    var tr = mtasks.make_Taskrunner();

    test.assertRaises(
          function () {
              tr.on_done();
          }
        , 'type of callback [undefined] !== "function"'
        , 'tr.on_done()'
        );
    test.assertRaises(
          function () {
              tr.on_done(null);
          }
        , 'type of callback [object] !== "function"'
        , 'tr.on_done(null)'
        );
    test.assertRaises(
          function () {
              tr.on_done('');
          }
        , 'type of callback [string] !== "function"'
        , 'tr.on_done("")'
        );
    test.assertRaises(
          function () {
              tr.on_done(7);
          }
        , 'type of callback [number] !== "function"'
        , 'tr.on_done(7)'
        );
    test.assertRaises(
          function () {
              tr.on_done(true);
          }
        , 'type of callback [boolean] !== "function"'
        , 'tr.on_done(true)'
        );
    test.assertRaises(
          function () {
              tr.on_done({});
          }
        , 'type of callback [object] !== "function"'
        , 'tr.on_done({})'
        );
    test.assertRaises(
          function () {
              tr.on_done([]);
          }
        , 'type of callback [object] !== "function"'
        , 'tr.on_done([])'
        );

    test.assertRaises(
          function () {
              tr.on_error();
          }
        , 'type of callback [undefined] !== "function"'
        , 'tr.on_error()'
        );
    test.assertRaises(
          function () {
              tr.on_error(null);
          }
        , 'type of callback [object] !== "function"'
        , 'tr.on_error(null)'
        );
    test.assertRaises(
          function () {
              tr.on_error('');
          }
        , 'type of callback [string] !== "function"'
        , 'tr.on_error("")'
        );
    test.assertRaises(
          function () {
              tr.on_error(7);
          }
        , 'type of callback [number] !== "function"'
        , 'tr.on_error(7)'
        );
    test.assertRaises(
          function () {
              tr.on_error(true);
          }
        , 'type of callback [boolean] !== "function"'
        , 'tr.on_error(true)'
        );
    test.assertRaises(
          function () {
              tr.on_error({});
          }
        , 'type of callback [object] !== "function"'
        , 'tr.on_error({})'
        );
    test.assertRaises(
          function () {
              tr.on_error([]);
          }
        , 'type of callback [object] !== "function"'
        , 'tr.on_error([])'
        );
};

exports.construct_run_done = function (test) {
    var tr = mtasks.make_Taskrunner()
      , flag = false
      ;

    tr.on_done(function () {
        test.assertEqual( typeof arguments[0]
                        , 'undefined'
                        , 'typeof arguments[0] === "undefined"'
                        );
        flag = true;
    });

    test.assert(flag === false, 'before run flag === false');
    tr.run();
    test.assert(flag, 'after run flag === true');

    tr = mtasks.make_Taskrunner();
    flag = false;

    tr.on_done(function () { flag = true; });
    test.assert(flag === false, 'before run flag === false');
    tr.run();
    test.assert(flag, 'after run flag === true');

    tr.on_done(function () {
        test.assert(false, 'bound too late');
    });
};

// TODO: More testing
// see issue #5 https://github.com/FireworksProject/Kake/issues/issue/5
