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

// * JSLint 'laxbreak' is true because we are using comma-first JS syntax.

/*global window: false, require: false, exports: true, console: false, dump: false */

// Notification Registry
// ---------------------
//
// Notification name registry for this page. By centralizing a registry of
// notification event names here we make it easier to understand what is going
// on below. See the `NOTIFICATIONS` module defined below for details.
var N = {
    mailbox_ready: 'mailbox_ready'
  , project: {
        load: {
            rendered: 'project.load.rendered'
          , failed: 'project.load.failed'
        }
    }
  , console: {
        out: 'console.out'
      , warn: 'console.warn'
      , err: 'console.warn'
    }
};

// Throw later.
// ------------
//
// Utility for throwing an exception without breaking the current stack.
var THROWER = (function (window) {
    'use strict';
    var setTimeout = window.setTimeout;

    return function (e) {
        setTimeout(function () { throw e; }, 20);
    };
}(window));

// Debug Logging
// -------------
//
// Quick and dirty debug logging.
// (designed to stay in place for deployed code)
// TODO: It would be great if we had persisted logs of some sort.
var LOG = (function (window, dump) {
    'use strict';
    var aps = Array.prototype.slice
      , thrower = window.THROWER
      ;

    return function () {
        // Try to use the console first, then resort to using the thrower.
        if (typeof console !== 'undefined') {
            console.log.apply(console, arguments);
        }
        else {
            if (arguments[0] instanceof Error) {
                dump('Kake log: '+ arguments[0] +'\n');
                thrower(arguments[0]);
            }
            else {
                dump('Kake log: '+ aps.call(arguments).join(' ') +'\n');
                thrower(aps.call(arguments).join(' '));
            }
        }
    };
}(window, dump));

// Page notification system.
// -------------------------
//
// A notification system that is global within the scope of this page.  It is
// not possible to talk to JS contexts outside of this page using this
// notification system. For that, use the global mailbox messaging system.
var NOTIFICATIONS = (function (window) {
    'use strict';
    var has = Object.prototype.hasOwnProperty
      , toString = Object.prototype.toString
      , isArray = Array.isArray
      , thrower = window.THROWER
      , self = {}
      , values = {}
      , registry = {}
      ;

    // Throw an error for an invalid event path/name.
    function path_error(err, path) {
        err.message = 'typeof event name ['+ (typeof path) +'] !== "string"';
        return err;
    }

    // Throw an error for invalid arguments passed to an emitter.
    function args_error(err, args) {
        err.message = ( 'typeof event data ['+ toString.call(args) +
                        '] !== "[object Array]"');
        return err;
    }

    // Call a function for each '.' deliniated part of an event path-name.
    function descend_path(path, fn) {
        var i;
        while (path) {
            // An event handler can stop propagation by returning `false`.
            if (fn(path) === false) {
                break;
            }
            i = path.lastIndexOf('.');
            path = i === -1 ? null : path.slice(0, i);
        }
    }

    /**
     * Broadcast a set of arguments to a list of functions.
     * @param {Array} callbacks A list of functions to broadcast to.
     * @param {Array} args A list of arguments to apply to each callback.
     * @param {Object} [context] Will become `this` inside callback functions.
     */
    function broadcast(callbacks, args, context) {
        var i = 0, len = callbacks.length;
        context = context || {};
        for (; i < len; i += 1) {
            try {
                callbacks[i].apply(context, args);
            } catch (e) {
                // Report a callback error after it can no longer get in our way.
                thrower(e);
            }
        }
    }

    // Register event handlers on the registry object.
    function registrar(path, fn) {
        if (typeof path !== 'string') {
            throw path_error(new TypeError(), path);
        }
        if (typeof fn !== 'function') {
            throw new TypeError('typeof event handler ['+ (typeof fn) +
                                '] !== "function"');
        }
        if (!has.call(registry, path)) {
            registry[path] = [];
        }
        registry[path].push(fn);
    }

    /**
     * Emit event data to registered handlers.
     * @param {String} path Namespaced event name.
     * @param {Array} [data] Array of arguments to pass to handlers.
     */
    self.emit = function emit(path, data) {
        if (typeof path !== 'string') {
            throw path_error(new TypeError(), path);
        }
        if (data && !isArray(data)) {
            throw args_error(new TypeError(), data);
        }
        descend_path(path, function (path_part) {
            if (has.call(registry, path_part)) {
                broadcast(registry[path_part], data || []);
            }
        });
    };

    /**
     * Register a handler for a notification, even if it has already happened.
     * @param {String} path Namespaced event name.
     * @param {Function} fn The callback function to call.
     */
    self.on = function on(path, fn) {
        registrar(path, fn);
        descend_path(path, function (path_part) {
            if (has.call(values, path_part)) {
                broadcast([fn], values[path_part]);
                return false; // optimization
            }
        });
    };

    /**
     * Unregister a handler for a notification path.
     * @param {String} path Namespaced event name.
     * @param {Function} fn The callback function to remove.
     */
    self.ignore = function ignore(path, fn) {
        if (!has.call(registry, path)) {
            return;
        }

        var i = registry[path].indexOf(fn);
        if (i > -1) {
            registry[path].splice(i, 1);
        }
    };

    return self;
}(window));

// Global mailbox messenging.
// --------------------------
//
// An anonymous module that initializes the 'client side' of the global
// mailbox messenging system.  Once created, the messenger object is made
// available to the rest of the page through the page notification system.
//
// The global mailbox messenger allows us to communicate with super privileged
// library code through the secure channels provided by the Mozilla Addon SDK.
(function (window) {
    'use strict';
    var document = window.document
      , loc = window.location
      , notifications = window.NOTIFICATIONS

      , maybe_load_messenger // Defined later.
      ;

    // Determine a library (lib) url from the current document location.
    // TODO: This is hackish and fragile.
    function get_lib_url(path) {
        return 'resource://'+ loc.host.replace(/data$/, 'lib') + path;
    }

    // Inject JS by injecting a `<script src="">` tag.
    function inject_script(url, callback) {
        var script = document.createElement('script');
        script.src = url;
        script.onload = callback;
        document.documentElement.appendChild(script);
    }

    // Create the 'client' end of the mailbox messenger pipe.
    function make_Messenger(mailbox_mod, mailbox_decorator) {
        var self = {}
          , messenger_out = document.getElementById('messenger-out')
          , messenger_in = document.getElementById('messenger-in')
          , mb_decorator = mailbox_decorator.mailbox_decorator
          , mailbox
          ;

        function post_message(msg) {
            var ev = document.createEvent('Events');
            messenger_out.textContent = JSON.stringify(msg);
            ev.initEvent('messenger.onMessage', true, false);
            messenger_out.dispatchEvent(ev);
        }

        messenger_in.addEventListener('messenger.onMessage', function (ev) {
            mailbox.receive(JSON.parse(ev.target.textContent));
        }, false);

        mailbox = mailbox_mod.make_Mailbox({sender: post_message});

        self.send = mb_decorator.send(mailbox.send);
        self.observe = function (type_path, fn) {
            mailbox.observe(type_path, mb_decorator.observe(fn));
        };
        return self;
    }

    // Check to see if the required dependencies for creating the mailbox are
    // loaded.
    maybe_load_messenger = (function () {
        var memo = {};
        return function (mailbox, decorator) {
            if (mailbox) {
                memo.mailbox = mailbox;
            }
            if (decorator) {
                memo.decorator = decorator;
            }

            if (memo.mailbox && memo.decorator) {
                var messenger = make_Messenger(memo.mailbox, memo.decorator);
                notifications.emit(N.mailbox_ready, [messenger]);
            }
        };
    }());

    // The dependencies for creating the mailbox messenging 'client' are
    // contained within the privileged library modules for Kake. Since we
    // cannot `require()` them from this page context, we need to figure out
    // where they are and manually inject them instead.
    inject_script(get_lib_url('/future/mailbox.js'), function () {
        maybe_load_messenger(window['/future/mailbox']);
    });
    inject_script(get_lib_url('/build-kit/mailbox-decorator.js'), function () {
        maybe_load_messenger(null, window['/build-kit/mailbox-decorator']);
    });
}(window));

// Error alert.
// ------------
//
// Use a jQuery UI dialog widget to show an error.
var SHOW_ERROR = (function (window) {
    'use strict';
    var jq = window.jQuery
      , jq_dialog = jq('#error-dialog').hide()
      ;

    return function (title, error) {
        jq('#error-string').html(error.name +': '+ error.message);
        jq('#error-line').html(error.lineNumber);
        jq('#error-file').html(error.fileName);
        jq('#error-stack').html(error.stack);
        jq_dialog
            .dialog({ title: title
                    , width: jq(window).width() / 2
                    , buttons: [{
                        text: 'Ok'
                      , click: function () { jq(this).dialog('close'); }
                      }]
                    });
    };
}(window));

// Button widget constructor.
// --------------------------
//
// Depends on jQuery UI `.button()` API.
var BUTTON = function (jq, handler, disabled) {
    'use strict';
    var self = {};

    if (disabled) {
        jq.button({disabled: true});
    }
    else {
        jq.button().click(handler);
    }

    // Unbind handler and set jQuery UI disabled state.
    self.disable = function () {
        if (!disabled) {
            jq.button('disable').unbind('click', handler);
            disabled = true;
        }
    };

    // Bind handler and set jQuery UI enabled state.
    self.enable = function () {
        if (disabled) {
            jq.button('enable').click(handler);
            disabled = false;
        }
    };

    return self;
};

// Anonymous console module.
// -------------------------
(function (window) {
    'use strict';
    var jq = window.jQuery
      , notifications = window.NOTIFICATIONS

      // Cached jQuery collections.
      , jq_output

      // Cached jQuery templates.
      , jq_out_tpl
      , jq_warn_tpl
      , jq_err_tpl
      ;

    function on_out(id, msg, data) {
        jq.tmpl(jq_out_tpl, {message: data}).appendTo(jq_output);
    }

    function on_warn(id, msg, data) {
        jq.tmpl(jq_out_tpl, {message: data}).appendTo(jq_output);
    }

    function on_err(id, msg, data) {
        data = data || {};
        data.error_string = data.name +': '+ data.message;
        data.line = data.lineNumber;
        data.file = data.fileName;
        jq.tmpl(jq_out_tpl, data).appendTo(jq_output);
    }

    jq(function (jq) {
        // Cache some jQuery collections.
        jq_output = jq('#output');

        // Build and cache the templates.
        jq_out_tpl = jq('#console-out-template').template();
        jq_warn_tpl = jq('#console-warn-template').template();
        jq_err_tpl = jq('#console-err-template').template();
    });

    // Initialize this module as soon as the global mailbox is ready.
    notifications.on(N.mailbox_ready, function (mailbox) {
        mailbox.observe('project.guiout', on_out);
        mailbox.observe('project.guiwarn', on_warn);
        mailbox.observe('project.guierr', on_err);
    });

    notifications.on(N.console.out, on_out);
    notifications.on(N.console.warn, on_warn);
    notifications.on(N.console.err, on_err);
    notifications.on(N.project.load.rendered, function (id) {
        on_out(null, null, 'Project build script loaded: '+ id);
    });
}(window));

// Anonymous project module.
// -------------------------
//
// This module encloses all the GUI functionality for working with a project.
// It communicates with the rest of this page using notification events through
// the page's notifications system.
(function (window) {
    'use strict';
    var jq = window.jQuery
      , log = window.LOG
      , notifications = window.NOTIFICATIONS
      , show_error = window.SHOW_ERROR
      , button = window.BUTTON
      
      , current_id = null// The id of the currently loaded project.

      // Cached jQuery collections.
      , jq_project
      , jq_project_dialog
      , jq_build_project
      , jq_reload_project
      , jq_tasks
      , jq_settings

      // Cached jQuery templates.
      , jq_task_tpl
      , jq_setting_tpl

      // Functions defined later.
      , send // (type_path, msg, data)
      , teardown
      ;

    // UI message dialog used by this module.
    function project_dialog(title, msg) {
        jq('#project-dialog-message').html(msg);
        jq_project_dialog
            .dialog({ title: title
                    , width: jq(window).width() / 2
                    , buttons: [{
                        text: 'Ok'
                      , click: function () { jq(this).dialog('close'); }
                      }]
                    });
    }

    // Handler for the 'reload' button.
    function reload_project() {
        teardown();
        send('project.load', 'reload');
    }

    // Extract the settings values from the HTML.
    function get_settings() {
        var rv = {};
        jq('li.settings').each(function (i, el) {
            var name = jq('span.setting-name', el).html()
              , value = jq('span.setting-value', el).html()
              ;

            rv[name] = value;
        });
        return rv;
    }

    // Handler for the 'build' button.
    function run_project() {
        jq_build_project.disable();
        jq_reload_project.disable();

        var settings = get_settings()
          , data = {tasks: [], settings: settings}
          , config_name = jq('#config-name').html()
          ;

        jq('li.tasks.run').each(function (i, el) {
            data.tasks.push(jq('p.task-name', el).html());
        });

        send('config.save', config_name, settings);
        send('config.default', config_name);
        send('project.runner', 'run', data);
    }

    // Reset the UI state.
    teardown = function () {
        jq_build_project.disable();
        jq_reload_project.disable();
        jq_tasks.empty();
        jq_settings.empty();
    };

    // data.name
    // data.settings
    function render_configs(configs) {
        var settings = Object.keys(configs.settings).map(function (name) {
                var setting = configs.settings[name]
                  , status
                  ;

                switch (setting.status) {
                case 'ok':
                    status = 'ok';
                    break;
                case 'undefined':
                    // This setting is not defined in the configuration.
                    status = 'undefined';
                    break;
                case 'SettingTypeError':
                    // This setting value was the incorrect type in the
                    // configuration.
                    status = 'invalid';
                    break;
                case 'SettingAccessError':
                    // This setting value has not been declared in the build
                    // script. 
                    status = 'undeclared';
                    break;
                }

                return { name: name
                       , status: status
                       , type: setting.type
                       , value: setting.value
                       };
            });
        jq('#config-name').html(configs.name);
        jq.tmpl(jq_setting_tpl, settings).appendTo(jq_settings);
    }

    jq('p.setting-type-filepath').live('click', function (ev) {
        send( 'open_file_picker'
            , jq(this).attr('id')
            , {title: 'Choose file path setting value'});
    });

    jq('p.setting-type-folderpath').live('click', function (ev) {
        send( 'open_folder_picker'
            , jq(this).attr('id')
            , {title: 'Choose folder path setting value'});
    });

    // data = [task1, task1, ...]
    // task.name
    // task.description
    // task.deps
    function render_tasks(tasks) {
        jq.tmpl(jq_task_tpl, tasks).appendTo(jq_tasks);
    }

    // Present the loaded project on the UI.
    function render(data) {
        teardown();
        render_configs(data.configs);
        render_tasks(data.tasks);
        jq_build_project.enable();
        jq_reload_project.enable();
        notifications.emit(N.project.load.rendered, [current_id]);
    }

    // Mailbox message handler for 'project.load'. The 'project.load' mailbox
    // message is sent on both load and *reload* events.
    function on_project_load(id, msg, data) {
        if (msg === 'OK') {
            current_id = id;
            render(data);
            return;
        }
        if (msg === 'error') {
            show_error('Build script error', data);
            jq_reload_project.enable();
        }
        else {
            log('Unexpected mailbox message to project.load:');
            log(id, msg, data);
        }
        notifications.emit(N.project.load.failed, [id]);
    }

    // Mailbox message handler for the 'project.runner' mailbox message.
    function on_project_run(id, msg, data) {
        if (msg === 'done') {
            project_dialog( 'Project Complete' 
                          , 'Project '+ id +' build complete.'
                          );
            jq_build_project.enable();
            jq_reload_project.enable();
            return;
        }
        else if (msg === 'error') {
            show_error('Build script run error', data);
        }
        else {
            log('Unexpected mailbox message to project.runner:');
            log(id, msg, data);
        }
        jq_reload_project.enable();
    }

    function on_open_file_picker(id, msg, data) {
        jq('#'+ msg).children('span.setting-value').html(data);
    }

    // Handler for jQuery DOM ready event. (Which probably already fired, so
    // this handler will get called immediately).
    jq(function (jq) {
        jq_project = jq('#project').hide();
        jq_project_dialog = jq('#project-dialog').hide();
        jq_tasks = jq('#tasks');
        jq_settings = jq('#settings');
        jq_build_project = button( jq('#build-project')
                                 , run_project
                                 , true);
        jq_reload_project = button( jq('#reload-project')
                                  , reload_project
                                  , true);

        // Build and cache the templates.
        jq_setting_tpl = jq('#setting-template').template();
        jq_task_tpl = jq('#task-template').template();
    });

    // Initialize this module as soon as the global mailbox is ready.
    notifications.on(N.mailbox_ready, function (mailbox) {
        var observe = mailbox.observe;
        send = function (type_path, msg, data) {
            mailbox.send(type_path, current_id, msg, data);
        };
        observe('project.load', on_project_load);
        observe('project.runner', on_project_run);
        observe('open_file_picker', on_open_file_picker);
        observe('open_folder_picker', on_open_file_picker);
    });
}(window));

// Initialize this page.
(function (window) {
    'use strict';
    var jq = window.jQuery
      , notifications = window.NOTIFICATIONS
      , button = window.BUTTON
      , send // defined at initialization time
      , jq_load_project
      ;

    // Handler for the load project button.
    function load_project() {
        jq_load_project.disable();
        send('project.load', null, 'load');
    }

    // Handler for jQuery DOM ready event. (Which probably already fired, so
    // this handler will get called immediately).
    jq(function (jq) {
        // Create jQuery UI buttons.
        jq_load_project = button(jq('#load-project'), load_project);
    });

    function on_load_failed() {
        jq_load_project.enable();
    }

    function on_load_success() {
        notifications.ignore(N.project.load.failed, on_load_failed);
        notifications.ignore(N.project.load.rendered, on_load_success);
        jq('#project-tabset').tabs();
        jq('#start').hide();
        jq('#project').show();
    }

    notifications.on(N.project.load.failed, on_load_failed);
    notifications.on(N.project.load.rendered, on_load_success);

    // Initialize this module as soon as the global mailbox is ready.
    notifications.on(N.mailbox_ready, function (mailbox) {
        send = mailbox.send;
    });
}(window));

