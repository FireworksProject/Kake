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

exports.returns_function = function (test) {
    test.assertEqual( typeof mtpl.template('')
                    , 'function'
                    , 'typeof .template("") == "function"'
                    );
};

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

exports.open_script_tag = function (test) {
    var tpl_1 = '<# (1 + 1)'
      , tpl_2 = '(1 + 1) #>'
      ;

    test.assertRaises(
          function () {
            var x = mtpl.template(tpl_1);
          }
        , 'missing ; before statement'
        , 'missing close tag'
        );

    test.assertRaises(
          function () {
            var x = mtpl.template(tpl_2);
          }
        , 'missing ) after argument list'
        , 'missing open tag'
        );
};

exports.with_syntax_err = function (test) {
    var tpl = '<#foo () {}#>';

    test.assertRaises(
          function () {
            var x = mtpl.template(tpl);
          }
        , 'missing ; before statement'
        , 'syntax error in template'
        );

    tpl = 'foo = <# 1 + 1 #>';
    test.assertRaises(
          function () {
              var x = mtpl.template(tpl);
          }
        , 'missing ; before statement'
        , 'use semicolen: <# 1 + 1 #>'
        );
};

exports.simple_var_replacement = function (test) {
    var tpl = mtpl.template('foo = <#= bar #>')
      , data = {bar: 'baz'}
      ;

    test.assertEqual(tpl(data), 'foo = baz', '{bar: "baz"}');
    data = {bar: 2};
    test.assertEqual(tpl(data), 'foo = 2', '{bar: 2}');
    data = {bar: null};
    test.assertEqual(tpl(data), 'foo = null', '{bar: 2}');
    data = {bar: {}};
    test.assertEqual(tpl(data), 'foo = [object Object]', '{bar: 2}');
    data = {bar: []};
    test.assertEqual(tpl(data), 'foo = ', '{bar: 2}');
    data = {bar: false};
    test.assertEqual(tpl(data), 'foo = false', '{bar: 2}');
    data = {};
    test.assertRaises(
          function () {
            tpl(data);
          }
        , 'bar is not defined'
        , '{bar: 2}'
        );
};

exports.script_eval = function (test) {
    // useless expression.
    var tpl = mtpl.template('foo = <# "bar"; #>');
    test.assertEqual(tpl(), 'foo = \r\n', '<# "bar"; #>');
};

exports.multiline = function (test) {
    var tpl1 = mtpl.template('foo = <#=foo#>\nbar = <#=bar#>')
      , tpl2 = mtpl.template('foo = <#=foo#>\r\nbar = <#=bar#>')
      , tpl3 = mtpl.template('foo = <#=foo#>\rbar = <#=bar#>')
      , data = {foo: 1, bar: 2}
      ;
    test.assertEqual( tpl1(data)
                    , 'foo = 1\r\nbar = 2'
                    , 'foo = <#=foo#>\nbar = <#=bar#>'
                    );
    test.assertEqual( tpl2(data)
                    , 'foo = 1\r\nbar = 2'
                    , 'foo = <#=foo#>\r\nbar = <#=bar#>'
                    );
    test.assertEqual( tpl3(data)
                    , 'foo = 1\r\nbar = 2'
                    , 'foo = <#=foo#>\rbar = <#=bar#>'
                    );
};

exports.for_loop = function (test) {
    var tpl = '<# for (var i = 0; i < 3; i +=1) { #>'+
              '  <#= foo[i] #>'+
              '<# } #>';

    test.assertEqual( mtpl.template(tpl)({foo: ['a', 'b', 'c']})
                    , '\r\n  a\r\n  b\r\n  c\r\n'
                    , 'looping template'
                    );
};

