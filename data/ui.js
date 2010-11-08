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

/*global
  window: false
, require: false
, exports: true
, console: false
, postMessage: false
*/

(function (global, window, postMessage) {
    'use strict';

    var document = window.document

      , loc = window.location.href

      , jq = window.jQuery

      // WARNING! This technique is not stable and could go bad any time.
      , lib_dir = loc.replace(/data\/kake\.html$/, 'lib/')

      , send
      , mailbox_handlers = {}
      ;

    mailbox_handlers.project = (function () {
        var self = {}
          ;

        self.load_result = function load_result(result) {
            console.log(result);
        }

        return self;
    }());

    function hookup_DOM() {
        jq('#load-project')
            .click(function (ev) {
                send('project', 'load');
            })
            ;
    }

    onMessage = function (script) {
        var mod = {}
          , factory = new Function('exports', script)
          , mailbox
          ;

        factory(mod);

        mailbox = mod.Mailbox({ classes: mailbox_handlers
                              , sender: postMessage
                              });

        onMessage = mailbox.receive;
        send = mailbox.send;

        hookup_DOM();
    };

}(this, window, postMessage));

