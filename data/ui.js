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
      , send

      , mailbox_handlers = {}
      , mailbox_decorator
      ;

    // Implements our messaging protocol with the main build engine.
    mailbox_decorator = {
          receive: function (fn) {
              // Decodes the message
              return function (data) {
                  // id = the project id (file path)
                  // message = the message header (descriptive)
                  // data = anything
                  fn(data.id, data.message, data.data);
              };
          }
        , send: function (fn, cls) {
              // Encodes the message
              return function (method, id, message, data) {
                  fn(cls, method, {id: id, message: message, data: data});
              };
          }
    };

    mailbox_handlers.project = (function () {
        var self = {}
          //, projects = {}
          ;

        self.load_result = function load_result(id, data) {
        };

        self.load_result = mailbox_decorator.receive(function (id, msg, data) {
            console.log('load_result:', id, msg, JSON.stringify(data));
        });

        return self;
    }());

    function hookup_DOM() {
        jq('#load-project')
            .click(function () {
                mailbox_decorator.send(send, 'project')('load');
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

}(window, postMessage));

