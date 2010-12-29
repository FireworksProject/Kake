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
    test.assertEqual(tpl(), 'foo = ', '<# "bar"; #>');
};

exports.multiline = function (test) {
    var tpl1 = mtpl.template('foo = <#=foo#>\nbar = <#=bar#>')
      , tpl2 = mtpl.template('foo = <#=foo#>\r\nbar = <#=bar#>')
      , tpl3 = mtpl.template('foo = <#=foo#>\rbar = <#=bar#>')
      , tpl4 = mtpl.template('foo = <#=foo\n#> bar = <#=bar#>')
      , tpl5 = mtpl.template('foo = <#=foo\r\n#> bar = <#=bar#>')
      , tpl6 = mtpl.template('foo = <#=foo\r#> bar = <#=bar#>')
      , tpl7 = mtpl.template('<#if(true)\n#>foo')
      , tpl8 = mtpl.template('<#if(true)\r\n#>foo')
      , tpl9 = mtpl.template('<#if(true)\r#>foo')
      , data = {foo: 1, bar: 2}
      ;
    test.assertEqual( tpl1(data)
                    , 'foo = 1\nbar = 2'
                    , 'foo = <#=foo#> newline bar = <#=bar#>'
                    );
    test.assertEqual( tpl2(data)
                    , 'foo = 1\r\nbar = 2'
                    , 'foo = <#=foo#> return/newline bar = <#=bar#>'
                    );
    test.assertEqual( tpl3(data)
                    , 'foo = 1\rbar = 2'
                    , 'foo = <#=foo#> return bar = <#=bar#>'
                    );
    test.assertEqual( tpl4(data)
                    , 'foo = 1 bar = 2'
                    , 'foo = <#=foo newline #> = <#=bar#>'
                    );
    test.assertEqual( tpl5(data)
                    , 'foo = 1 bar = 2'
                    , 'foo = <#=foo return/newlind #> bar = <#=bar#>'
                    );
    test.assertEqual( tpl6(data)
                    , 'foo = 1 bar = 2'
                    , 'foo = <#=foo return #> bar = <#=bar#>'
                    );
    test.assertEqual( tpl7()
                    , 'foo'
                    , '<#if(true) newline #>foo'
                    );
    test.assertEqual( tpl8()
                    , 'foo'
                    , '<#if(true) return/newline #>foo'
                    );
    test.assertEqual( tpl9()
                    , 'foo'
                    , '<#if(true) return #>foo'
                    );
};

exports.for_loop = function (test) {
    var tpl = '<# for (var i = 0; i < 3; i +=1) { #>\n'+
              '<#= i #>:<#= foo[i] #>\n'+
              '<# } #>\n';

    test.assertEqual( mtpl.template(tpl)({foo: ['a', 'b', 'c']})
                    , '\n0:a\n\n1:b\n\n2:c\n\n'
                    , 'looping template'
                    );
};

exports.if_block = function (test) {
    var tpl = '<# if (a) { #>\n'+
              'a\n'+
              '<# } #>\n'+
              '<# if (b) { #>\n'+
              'and b\n'+
              '<# } #>';

    test.assertEqual( mtpl.template(tpl)({a: true, b: false})
                    , '\na\n\n'
                    , 'if a'
                    );
    test.assertEqual( mtpl.template(tpl)({a: false, b: true})
                    , '\n\nand b\n'
                    , 'if b'
                    );
    test.assertEqual( mtpl.template(tpl)({a: true, b: true})
                    , '\na\n\n\nand b\n'
                    , 'if a and b'
                    );

    // Better newlines
    tpl = '<# if (a) {\n'+
          '#>a<#\n'+
          '}\n'+
          'if (b) {\n'+
          '#> and b<#\n'+
          '} #>\n';

    test.assertEqual( mtpl.template(tpl)({a: true, b: false})
                    , 'a\n'
                    , 'if a'
                    );
    test.assertEqual( mtpl.template(tpl)({a: false, b: true})
                    , ' and b\n'
                    , 'if b'
                    );
    test.assertEqual( mtpl.template(tpl)({a: true, b: true})
                    , 'a and b\n'
                    , 'if a and b'
                    );
};

