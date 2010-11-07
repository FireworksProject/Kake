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

(function (window, postMessage) {
    'use strict';

    var document = window.document

      , loc = window.location.href

      // WARNING! This technique is not stable and could go bad any time.
      , lib_dir = loc.replace(/data\/kake\.html$/, 'lib/')

      , send
      , mailbox_handlers = {}
      ;

    function inject_script(url, callback) {
        var script = document.createElement('script');
        script.src = url;
        script.onload = callback;
        document.documentElement.appendChild(script);
    }

    inject_script(lib_dir +'future/mailbox.js', function () {
        var mailbox = window['/future/mailbox']
                          .Mailbox({ classes: mailbox_handlers
                                   , sender: postMessage
                                   });

        onMessage = mailbox.receive;
        send = mailbox.send;
        console.log('loaded');
    });
}(window, postMessage));

