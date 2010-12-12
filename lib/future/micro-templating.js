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

// JSLint 'strict' is false because we are using `with` in the generated
// template function.

function parse_template(str, opts) {
    var squote = opts.squote
      , parts = opts.parts
      , param = opts.param
      ;

    // Replace JS string single quotes with a special replacement char.
    str = str.replace(/'(?=[^#]*#>)/g, squote);

    // Escape all other single quotes.
    str = str.split("'").join("\\'");

    // Then replace the special single quote replacement char with the single
    // quote char again.
    str = str.split(squote).join("'");

    // This is not efficient, but is the simplest way to handle end of line
    // characters on all platforms.
    // TODO: optimize???
    str = str.replace(/\r\n/g, "','");
    str = str.replace(/\n/g, "','");
    str = str.replace(/\r/g, "','");

    // Replace "<#= VAR #>" with "'+ VAR +'".
    str = str.replace(/<#=(.+?)#>/g, "'+$1+'");

    // Replace "<#" with "');" which pushes this string part onto the parts
    // array.
    str = str.split("<#").join("');");

    // Start a new string part.
    str = str.split("#>").join(parts +".push('");

    return ( "var "+ parts +" = [];"+
             "with ("+ param +") {"+
             parts +".push('"+ str +"'); } "+
             "return "+ parts +".join('\\r\\n');"
           );
}

/**
 * @exports make_Template
 * @exports make_Template as makeTemplate
 *
 * Create a new template function.
 *
 * @param {String} str The template text.
 * @param {Object} [opts] Additional options.
 * @param {String} [opts.squote] String to use to temporarily escape single
 * quotes.
 * @param {String} [opts.parts] The name of the only variable used in the
 * template function.
 * @param {String} [opts.param] The name of the only parameter passed to the
 * template function.
 *
 * The only reason to pass additional options in the `opts` parameter is to
 * avoid collisions, which is very unlikely, so you should never have to use
 * it.
 *
 * @returns {Function} A function to call with a single object as the only
 * parameter.  The property names of the passed object will populate the
 * variables embedded in the template text.
 */
function make_Template(str, opts) {
    if (typeof str !== 'string') {
        throw new TypeError(
                'typeof template str ['+ (typeof str) +'] !== "string"');
    }
    opts = opts || {};
    opts.squote = typeof opts.squote === 'string' ?
                  opts.squote : 'squote_special_char';
    opts.parts = typeof opts.parts === 'string' ?
                 opts.parts : 'special_parts_var_name';
    opts.param = typeof opts.param === 'string' ?
                 opts.param : 'special_parameter_name';

    var source = parse_template(str, opts);

    try {
        return new Function(opts.param, source);
    } catch (e) {
        e.stack = source;
        throw e;
    }
}

exports.make_Template = exports.makeTemplate = make_Template;

