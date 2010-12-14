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
, nomen: false
, eqeqeq: true
, plusplus: true
, bitwise: true
, regexp: true
, immed: true
, strict: true
*/

// * JSLint nomen is false for the __url__ global in Jetpack (addon SDK).
// * JSLint 'laxbreak' is true because we are using comma-first JS syntax.

/*global require: false, exports: true, console: false, __url__: false */

'use strict';

var self              = require('self')
  , loader            = require('securable-module')
  , file              = require('file')
  , setTimeout        = require('timer').setTimeout
  , tabs              = require('tabs')
  , open_file_picker  = require('future/file-picker').open_file_picker
  , make_cache        = require('./cache').make_Cache
  , taskrunner        = require('./taskrunner').Taskrunner
  , make_path         = require('future/path').Path
  , make_stash        = require('future/stash').Stash
  , make_settings     = require('./settings').make_Settings
  , template          = require('future/micro-templating').make_Template
  , mailbox_decorator = require('./mailbox-decorator').mailbox_decorator

  , aps = Array.prototype.slice
  ;

/**
 * @constructor
 * @param {Object} opts
 * @param {String} opts.root
 * @param {Path} opts.path
 * @param {Function} opts.sender (type_path, id, message, data)
 *
 * Post methods called:
 *     project.setting(id, set, value)
 */
function make_Project(opts) {
    var self = {}
      , loaded = false
      , locked = false
      , error = null
      , id
      , path = opts.path
      , root = opts.root
      , cache = make_cache()
      , self_settings = {}
      , settings = make_settings()
      , setting_cache = function (k,v) {
            var rv = cache(k,v);
            if (arguments.length > 1) {
                self_settings[k] = v;
            }
            return rv;
        }

      , tasks = []

      , send = function (type_path, message, data) {
            opts.sender(type_path, id, message, data);
        }
      ;

    self.id = id = path;

    /**
     * @param {Object} opts
     * @param {String} opts.name
     * @param {String} opts.description
     * @param {Array} opts.dependencies
     * @param {Function} opts.fn
     * @param {Bool} opts.blocking
     */
    function add_task(opts) {
        tasks.push(opts);
    }

    // Return the tasks list, but do sanity checks on dependencies too.
    function get_tasks() {
        return tasks.map(function (task) {
            var self = {}
              , deps = task.deps.reduce(function (rdeps, dep) {
                    var i, len = tasks.length;
                    for (i = 0; i < len; i += 1) {
                        if (tasks[i].name === dep) {
                            rdeps.push([dep, true]);
                            return rdeps;
                        }
                    }
                    rdeps.push([dep, false]);
                    self.missing_dependency = true;
                    return rdeps;
                }, [])
              ;

            self.deps = deps;
            self.name = task.name;
            self.description = task.description;
            self.blocking = task.blocking;
            return self;
        });
    }

    /**
     * @constructor
     * Create the public interface for build scripts;
     * accessible through `require()`
     */
    function make_Pub(opts) {
        var self = {};
        setting_cache('DIR', file.dirname(path));

        // Since the task and asyncTask function are exposed publicly to the
        // build script, we take extra care with parameter checking and try to
        // throw useful error messages.
        function ensure_task(opts, fn, blocking) {
            if (locked) {
                throw new Error( 'New tasks cannot be dynamically '+
                                 'declared after the build script '+
                                 'has been evaluated.'
                               );
            }

            opts = opts || {};
            var i, len, dep;

            if (typeof opts.name !== 'string') {
                throw new TypeError( 'A task name must be '+
                                     'a string instead of "'+
                                     Object.prototype.toString
                                         .call(opts.name) +
                                     '"'
                                   );
            }

            if (typeof fn !== 'function') {
                throw new TypeError( 'A task must be '+
                                     'a function instead of "'+
                                     Object.prototype.toString
                                         .call(fn) +
                                     '"'
                                   );
            }

            opts.deps = typeof opts.deps === 'undefined' ? [] :
                        Array.isArray(opts.deps) ? opts.deps : [opts.deps];

            len = opts.deps.length;
            for (i = 0; i < len; i += 1) {
                dep = opts.deps[i];
                if (typeof dep !== 'string') {
                    throw new TypeError( 'A dependency name must be '+
                                         'a string instead of "'+
                                         Object.prototype.toString
                                             .call(dep) +
                                         ' in "'+ opts.name +'"'
                                       );
                }
            }

            opts.description = opts.description +'';
            opts.blocking = blocking;
            opts.fn = fn;
            add_task(opts);
        }

        /**
         * @param {Object} opts
         * @param {String} opts.name
         * @param {String} opts.description
         * @param {Array} opts.dependencies
         */
        self.task = function (opts, fn) {
            ensure_task(opts, fn, true);
        };

        /**
         * @param {Object} opts
         * @param {String} opts.name
         * @param {String} opts.description
         * @param {Array} opts.dependencies
         */
        self.async_task = self.asyncTask = function (opts, fn) {
            ensure_task(opts, fn, false);
        };

        // Generic function used to create GUI message senders.
        function gui_output(pathname) {
            return function () {
                var msg = aps.call(arguments).join(' ');
                send(pathname, null, msg);
            };
        }

        /**
         * Send an output message to the UI.
         */
        self.guiout = gui_output('project.guiout');

        /**
         * Send a warning message to the UI.
         */
        self.guiwarn = gui_output('project.guiwarn');

        /**
         * @param {Object} err An Error object.
         */
        self.guierror = function guierr(err) {
            send('project.guierr', null, err);
        };

        self.template = template;
        self.console = console;
        self.path = make_path;
        self.stash = make_stash('Kake:'+ id);
        self.settings = setting_cache;
        return self;
    }

    // Initiates a new securable-module loader and
    // loads the build script with it.
    function load_build_script(root, path) {
        var specs
          , pub
          ;

        // Create the public 'kake' API exposed to the build script.
        pub = make_Pub();

        // Returns a proloaded exports object to require calls
        // made from the build script.
        function build_exports(base, id) {
            //console.log('build_exports() base:', base, 'id:', id);
            if (id === 'kake') {
                return pub;
            }
            return null;
        }

        // Module loader specs.
        specs = { rootPath: root
                , getModuleExports: build_exports
                };

        new loader.Loader(specs)
            .runScript({contents: file.read(path), filename: path});
    }

    // Attempt to load the build script.
    try {
        load_build_script(root, path);
        loaded = true;
    } catch (e) {
        loaded = false;
        console.warn('Error loading build script from path', path, ':');
        console.debug(e);
        error = e;
    }

    // Check to see if the build script loaded without errors.
    self.loaded = function () { return loaded; };

    // Freeze this project and return the tasks and settings created by the
    // build script.
    self.lock = function () {
        locked = true;
        return {tasks: get_tasks(), settings: self_settings};
    };

    // Return the last recorded error.
    self.last_error = function () {
        return error;
    };

    // Run this project with the specified tasks.
    self.run = function (data) {
        var task_runner = taskrunner()
          , task_dict = {}
          ;

        tasks.forEach(function (t) {
            task_dict[t.name] = t;
        });

        Object.keys(data.settings).forEach(function (k) {
            setting_cache(k, data.settings[k]);
        });

        data.tasks.forEach(function (t) {
            task_runner.append(task_dict[t]);
        });

        task_runner.on('error', function (e) {
            console.debug('Taskrunner error received:', e);
            send('project.runner', 'error', e);
        });

        task_runner.on('done', function () {
            send('project.runner', 'done');
        });

        task_runner.run();
    };

    return self;
}

/**
 * @constructor
 * @param {Object} opts
 * @param {String} opts.file_picker_dialog_title
 * @param {Function} opts.observer (path, callback)
 * @param {Function} opts.sender (path, data)
 *
 * Post methods called:
 *     project.load(id, OK|cancelled|error, tasks|undefined|error)
 */
exports.Messenger = function Messenger(opts) {
    var projects = {}
      , fp_dialog_title = opts.file_picker_dialog_title
      , observe = opts.observer

        // params (type_path, id, message, data)
      , send = mailbox_decorator.send(opts.sender)

      , file_picker_opts = {
              // We can get away with using the window for the active tab
              // rather than searching for the correct content window for the
              // page-mod because we know that the page-mod worker could not
              // have sent this message if it was not active.
              window: tabs.activeTab.contentWindow
            , title: fp_dialog_title
            , filters: []
            }
      ;

    function current_dir() {
        var parts = __url__.split('/');
        parts.pop();
        return (parts.join('/') + '/');
    }

    function maybe_load_project(path) {
        if (path) {
            var proj = make_Project({ root: current_dir()
                               , path: path
                               , sender: send
                               });

            // Queue final project initialization results into the
            // event loop to give the stack a chance to clear.
            setTimeout(function () {
                var loaded = proj.loaded();
                if (loaded) {
                    // Overwrite any projects with the same ID.
                    projects[proj.id] = proj;
                    send('project.load', proj.id, 'OK', proj.lock());
                }
                else {
                    send('project.load', proj.id, 'error', proj.last_error());
                }
            }, 0);
        }
        else {
            // The user cancelled.
            send('project.load', null, 'cancelled');
        }
    }

    observe('project.load', mailbox_decorator.observe(function (id, msg, data) {
            if (msg === 'load') {
                open_file_picker(file_picker_opts, maybe_load_project);
                return;
            }
            if (msg === 'reload') {
                maybe_load_project(id);
            }
            else {
                console.warn('Unexpected mailbox message to project.load:');
                console.debug('file', __url__);
                console.debug(id, msg, data);
            }
        })
    );

    observe('project.runner', mailbox_decorator.observe(function (id, msg, data) {
            projects[id].run(data);
        })
    );
};

