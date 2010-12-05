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
var store = require('simple-storage')
  , N = {}
  ;

exports.Stash = exports.stash = function Stash(namespace) {
    var self = {}
      , ns = typeof namespace === 'string' ? namespace : 'GLOBAL'
      ;

    function ensure() {
        if (!store.storage[ns]) {
            store.storage[ns] = {};
            return false;
        }
        return true;
    }

    // Set the value for a key regardless of previous contents in the cache.
    self.set = function set(k, v) {
        ensure();
        store.storage[ns][k] = v;
    };

    // Lookup and return the value of a key.
    self.get = function get(k) {
        return (store.storage[ns] || N)[k];
    };

    // Delete a key.
    self.del = function del(k) {
        if (ensure()) {
            delete store.storage[ns][k];
        }
    };

    // Set the value for a key if and only if the key is currently undefined.
    self.add = function add(k, v) {
        ensure();
        if (typeof store.storage[ns][k] === 'undefined') {
            store.storage[ns][k] = v;
            return true;
        }
        return false;
    };

    return self;
};

