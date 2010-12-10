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
  evil: false
, laxbreak: true
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

// * jslint strict is false because we use it within the function;
//   not the whole script.

/*global
  window: false
, require: false
, exports: true
, postMessage: false
, onMessage: true
*/

(function (document) {
    'use strict';
    var messenger_out = document.getElementById('messenger-out')
      , messenger_in = document.getElementById('messenger-in')
      ;

    onMessage = function (msg) {
        var ev = document.createEvent('Events');

        messenger_in.textContent = JSON.stringify(msg);
        ev.initEvent('messenger.onMessage', true, false);
        messenger_in.dispatchEvent(ev);
    };

    messenger_out.addEventListener('messenger.onMessage', function (ev) {
        postMessage(JSON.parse(ev.target.textContent));
    }, false, true);

}(window.document));

