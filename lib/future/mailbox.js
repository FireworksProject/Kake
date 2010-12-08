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
(function(require, exports) {

'use strict';

function tostr(x) {
    if (typeof x === 'undefined') {
        return 'undefined';
    }
    if (typeof x === 'string' || typeof x === 'number') {
        return x;
    }
    if (x === null) {
        return 'null';
    }
    return JSON.stringify(x);
}

// opts.sender
exports.Mailbox = exports.make_Mailbox = function Mailbox(opts) {
    var self = {}
      , registry = {}
      , sender = opts.sender
      ;

    // Add an observer function to a message type path.
    self.observe = function add_observer(path, fn) {
        if (typeof path !== 'string' || path.length < 1) {
            throw new TypeError( 'observe() invalid message path: "'+
                                 tostr(path) +'"');
        }
        if (typeof fn !== 'function') {
            throw new TypeError( 'observe() invalid callback function: '+
                                 tostr(fn));
        }
        if (!registry.hasOwnProperty(path)) {
            registry[path] = [];
        }
        registry[path].push(fn);
    };

    // Send a datagram on a type path.
    self.send = function send_message(path, data) {
        if (typeof path !== 'string' || path.length < 1) {
            throw new TypeError( 'send() invalid message path: "'+
                                  tostr(path) +'"');
        }
        sender({path: path, data: data});
    };

    // Listen for datagrams.
    // This function needs to be hooked into the external messaging system.
    self.receive = function broadcast_message(msg) {
        msg = msg || {};
        var path = msg.path
          , data = msg.data
          ;

        if (typeof path !== 'string' || path.length < 1) {
            throw new TypeError('Invalid message path in '+ tostr(msg));
        }

        path.split('.').reduce(function (path, ns) {
            path.push(ns);
            var spath = path.join('.');

            if (registry.hasOwnProperty(spath)) {
                registry[spath].forEach(function (fn) {
                    fn(data);
                });
            }

            return path;
        }, []);
    };

    return self;
};

})
// Boilerplate to export this script in both a CommonJS complient environment
// and a browser environment with the `<script src="">` tag.
// However, JSLint does not like the way this function is invoked, and there are
// some ECMAScript5 strict mode violations too.
.apply({},

  typeof require === 'function' ?

  [require, exports] :

  [
    function (g) {
      return function (id) { return g['/'+ id]; };
    }(this /* A ECMAScript5 strict mode violation. */),

    this['/future/mailbox'] = {} /* Another ECMAScript5 strict mode violation. */

  ]);

