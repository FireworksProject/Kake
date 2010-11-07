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

    /**
     * @param {Object} opts
     * @param {Object} opts.classes
     * @param {Function} opts.sender
     */
    exports.Mailbox = function Mailbox(opts) {
        var self = {}
          , classes = opts.classes
          , send = opts.sender
          , args2array
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
        self.send = function (cls, method, data) {
            send([cls, method, data]);
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

