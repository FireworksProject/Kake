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
  evil: true
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

// * jslint evil is set to true because we need to use the Function constructor.
// * jslint strict is false because we use it within the function;
//   not the whole script.

/*global
  window: false
, require: false
, exports: true
, console: false
, postMessage: false
, onMessage: true
*/

(function (window, postMessage) {
    'use strict';

    var jq = window.jQuery

      , mailbox_decorator

      // (type_path, id, message, data)
      , send

      // (type_path, callback(id, message, data))
      , observe
      ;

    // Implements our messaging protocol with the main build engine.
    mailbox_decorator = {
          observe: function (fn) {
              // Decodes the message
              return function (data) {
                  // id = the project id (file path)
                  // message = the message header (descriptive)
                  // data = anything
                  fn(data.id, data.message, data.data);
              };
          }
        , send: function (fn) {
              // Encodes the message
              return function (type, id, message, data) {
                  fn(type, {id: id, message: message, data: data});
              };
          }
    };

    function init() {
        observe('project.load', function (id, msg, data) {
            console.log('ui:project.load ->', id, msg, data);
        });

        jq('#load-project')
            .click(function () {
                send('project.load', null, 'load');
            });
    }

    // INIT -- nothing happens until this handler is called.
    // Listen for the injected Mailbox.js script and then
    // reassign this handler.
    onMessage = function (script) {
        var mod = {}
          , factory = new Function('exports', script)
          , mailbox
          ;

        // Execute the injected script.
        factory(mod);

        mailbox = mod.Mailbox({sender: postMessage});

        // reassign the onMessage handler.
        onMessage = mailbox.receive;

        // scope handlers.
        send = mailbox_decorator.send(mailbox.send);
        observe = function (type_path, fn) {
            mailbox.observe(type_path, mailbox_decorator.observe(fn));
        };

        init();
    };

}(window, postMessage));

