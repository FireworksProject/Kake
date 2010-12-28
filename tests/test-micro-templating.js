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

var mtpl = require('future/micro-templating');

exports.invalid_params = function (test) {
    test.assertRaises(
          function () {
              var x = mtpl.template();
          }
        , 'typeof template str [undefined] !== [string]'
        , '.template() throws'
        );
    test.assertRaises(
          function () {
              var x = mtpl.template({});
          }
        , 'typeof template str [object] !== [string]'
        , '.template({}) throws'
        );
    test.assertRaises(
          function () {
              var x = mtpl.template(null);
          }
        , 'typeof template str [object] !== [string]'
        , '.template(null) throws'
        );
    test.assertRaises(
          function () {
              var x = mtpl.template([]);
          }
        , 'typeof template str [object] !== [string]'
        , '.template(null) throws'
        );
    test.assertRaises(
          function () {
              var x = mtpl.template(false);
          }
        , 'typeof template str [boolean] !== [string]'
        , '.template(null) throws'
        );
};

exports.returns_function = function (test) {
    test.assertEqual( typeof mtpl.template('')
                    , 'function'
                    , 'typeof .template("") == "function"'
                    );
};

