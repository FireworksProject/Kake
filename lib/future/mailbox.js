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
*/

/*global require: false, exports: true, console: false */

exports.Mailbox = function Mailbox(opts) {
    opts = opts || {};
    var self = {}
      , classes = opts.classes
      , append_worker
      ;

    append_worker = function(worker) {

        // TODO: This callback should be passed into the Mailbox constructor
        // with a sane default function defined in the constructor.
        worker.on('error', function (e) { console.error(e); });

        worker.on('message', function (x) {
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
        });
    };

    self.append = append_worker;
    return self;
};

