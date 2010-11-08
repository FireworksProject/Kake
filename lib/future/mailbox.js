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

/**
 * @param {Object} opts
 * @param {Object} opts.classes
 * @param {Function} opts.sender
 */
exports.Mailbox = function Mailbox(opts) {
    var self = {}
      , classes = opts.classes
      , sender = opts.sender
      , args2array

      , send = function (cls, method, data) {
            sender([cls, method, data]);
        }
      ;

    function callback(x) {
        // TODO: We need a robust way to do a sanity check on the
        // message datagram. The existence of the requested class and
        // method should be checked and output suitable warning when it is
        // not found.
        try {
            classes[x[0]][x[1]](x[2]);
        } catch (e) {
            console.warn('Mailbox message handler had a problem:', e.toString());
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

