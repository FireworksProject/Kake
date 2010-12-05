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

      , projects = {}

      // (type_path, id, message, data)
      , send

      // (type_path, callback(id, message, data))
      , observe

      // Implements our messaging protocol with the main build engine.
      , mailbox_decorator = {
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
        }
      ;

    function show_error(title, error) {
        jq('#error-string').html(error.message);
        jq('#error-line').html(error.lineNumber);
        jq('#error-file').html(error.fileName);
        jq('#error-stack').html(error.stack);
        jq('#error-dialog')
            .dialog({ title: title
                    , width: jq(window).width() / 2
                    , buttons: [{
                        text: 'Ok'
                      , click: function () { jq(this).dialog('close'); }
                      }]
                    });
    }

    function Project(id) {
        var self = {}
          ;

        // data.name
        // data.value
        function render_settings(data) {
            data = Array.isArray(data) ? data : [data];
            jq.tmpl('setting', data).appendTo('#settings');
        }

        // data = [task1, task1, ...]
        // task.name
        // task.description
        // task.deps
        function render_tasks(data) {
            jq.tmpl('task', data).appendTo('#tasks');
        }

        function run_project() {
            jq('#build-project')
                .unbind('click', run_project)
                .button('disable')
                ;

            var data = {tasks: [], settings: {}};

            jq('li.settings').each(function (i, el) {
                var name = jq('span.setting-name', el).html()
                  , value = jq('span.setting-value', el).html()
                  ;

                data.settings[name] = value;
            });

            jq('li.tasks.run').each(function (i, el) {
                data.tasks.push(jq('p.task-name', el).html());
            });

            send('project.runner', id, 'run', data);
        }

        function teardown() {
            jq('#reload-project')
                .unbind('click', reload_project)
                .button('disable')
                ;
            jq('#build-project')
                .unbind('click', run_project)
                .button('disable')
                ;
            jq('#tasks').empty();
            jq('#settings').empty();
        }

        function setup() {
            jq('#build-project')
                .click(run_project)
                .button('enable')
                ;
            jq('#reload-project')
                .click(reload_project)
                .button('enable')
                ;
        }

        function reload_project() {
            teardown();
            send('project.load', id, 'reload');
        }

        function render_project(data) {
            var settings = Object.keys(data.settings).map(function (name) {
                               return {name: name, value: data.settings[name]};
                           });
            render_settings(settings);
            render_tasks(data.tasks);
            jq('#start').hide();
            setup();
            jq('#project').show();
        }

        self.render = render_project;
        return self;
    }

    function load_project() {
        jq('#load-project').unbind('click', load_project);
        send('project.load', null, 'load');
    }

    function init() {
        observe('project.load', function (id, msg, data) {
            if (msg === 'OK') {
                projects[id] = Project(id);
                projects[id].render(data);
                return;
            }
            if (msg === 'error') {
                show_error('Build script error', data);
            }
            else {
                console.warn('Unexpected mailbox message to project.load:');
                console.debug(id, msg, data);
            }
            jq('#load-project').click(load_project);
        });

        observe('project.runner', function (id, msg, data) {
            if (msg === 'done') {
                jq('#project-dialog-message')
                    .html('Project '+ id +' build complete.');

                jq('#project-dialog')
                    .dialog({ title: 'Project Complete'
                            , width: jq(window).width() / 2
                            });
                return;
            }
            else if (msg === 'error') {
                show_error('Build script run error', data);
            }
            else {
                console.warn('Unexpected mailbox message to project.runner:');
                console.debug(id, msg, data);
            }
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

