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

/*global
  window: false
, require: false
, exports: true
, console: false
, postMessage: false
*/

(function (window, postMessage) {
    'use strict';

    // TODO: This module constructor should be imported from future.js somehow.
    // <script> injection?
    function Mailbox(opts) {
    }

    window.addEventListener('load', function (ev) {
        postMessage(['project', 'load']);
    }, false);
}(window, postMessage));

