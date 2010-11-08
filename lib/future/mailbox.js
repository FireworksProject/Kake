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

function tostr(x) {
    if (typeof x === 'string' || typeof x === 'number') {
        return x;
    }
    if (x === null) {
        return 'null';
    }
    if (typeof x !== 'undefined') {
        return Object.prototype.toString.call(x);
    }
    return 'undefined';
}

/**
 * @param {Object} opts
 * @param {Object} opts.classes
 * @param {Function} opts.sender
 */
exports.Mailbox = function Mailbox(opts) {
    var self = {}
      , classes = opts.classes
      , sender = opts.sender

      , send = function (cls, method, data) {
            //console.log('sending', cls, method, data);
            sender([cls, method, data]);
        }
      ;

    function callback(x) {
        var fn, obj = classes[x[0]];

        if (typeof obj !== 'object' || obj === null) {
            console.debug( 'Mailbox: there is no object class named "'+
                           tostr(x[0]) +'".');
            return;
        }

        fn = obj[x[1]];
        if (typeof fn !== 'function') {
            console.debug( 'Mailbox: there is no method "'+ tostr(x[1]) +
                           '" for "'+ x[0] +'".');
            return;
        }

        try {
            fn(x[2]);
        } catch (e) {
            console.warn( 'Mailbox message handler ['+ x[0] +
                          '].'+ x[1] +'() had a problem:', e.toString());
            console.debug(e);
        }
    }

    self.receive = callback;
    self.send = send;

    // Extend the message handling classes with the `send` instance method.
    (function () {
        var n, has = Object.prototype.hasOwnProperty;
        for (n in classes) {
            if (has.call(classes, n)) {
                classes[n].send = send;
            }
        }
    }());

    return self;
};

