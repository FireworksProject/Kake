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
, strict: true
*/

/*global require: false, exports: true, console: false */

'use strict';

exports.makeCache = exports.make_Cache = function Cache() {
    var self
      , set
      , get
      , memo = {}
      ;

    set = function (key, val) {
        memo[key] = val;
        return val;
    };

    get = function (key) {
        return memo[key];
    };

    self = function (key, val) {
        if (val) {
            return set(key, val);
        }
        return get(key);
    };

    return self;
};

