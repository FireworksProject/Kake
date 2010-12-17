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

var self               = require('self')
  , loader             = require('securable-module')
  , file               = require('file')
  , setTimeout         = require('timer').setTimeout
  , tabs               = require('tabs')
  , open_file_picker   = require('future/file-picker').open_file_picker
  , open_folder_picker = require('future/file-picker').open_folder_picker
  , taskrunner         = require('./taskrunner').Taskrunner
  , make_path          = require('future/path').Path
  , make_stash         = require('future/stash').Stash
  , make_settings      = require('./settings').make_Settings
  , configs            = require('./configs')
  , template           = require('future/micro-templating').make_Template
  , mailbox_decorator  = require('./mailbox-decorator').mailbox_decorator

  , has = Object.prototype.hasOwnProperty
  , aps = Array.prototype.slice
  ;

/**
 * @constructor
 * @param {Object} opts
 * @param {String} opts.root
 * @param {Path} opts.path
 * @param {Function} opts.sender (type_path, id, message, data)
 */
function make_Project(opts) {
    'use strict';

    var self = {}

      // State flags.
      , loaded = false
      , locked = false
      , error = null

      , id // The id (path) of this project
      , path = opts.path // The path of this project.

      // The root path of this project for `require()`ing modules from the
      // context of the build script.
      , root = opts.root

      // This project has a unique instance of a settings service from the
      // 'settings' module.
      , settings = make_settings()

      // This project also has a unique instance of a stash (persisted storage)
      // service for saving certain project profile settings.
      , stash = make_stash('kake-project-stash:'+ path)

      // The current settings as established by the chosen configuration.
      , current_settings = {}

      // The name of the configuration sheme the user has persisted as the
      // default for this project (set later)
      , default_config_name = stash.get('config-default') || 'defaults'

      // Internal memoization of the tasks to run for this project.
      , tasks = []

      // Send mailbox messages to the UI.
      , send = function (type_path, message, data) {
            opts.sender(type_path, id, message, data);
        }
      ;

    // The id and the path are the same thing.
    self.id = id = path;

    /**
     * Memoize a task.
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

    // Return the memoized tasks list, but do sanity checks on the dependencies
    // of each task before returning.
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
     * Create the public interface for build scripts;
     * accessible through `require("kake")`
     */
    function make_Pub(opts) {
        // The `self` object will contain the actual API that will be exposed
        // by calling `require("kake")` from the build script.
        var self = {};

        // Every build script gets the special setting 'DIR' which points to
        // the directory that holds the build script itself (and is presumably
        // the project directory).
        settings.declare({ key: 'DIR'
                         , type: 'folderpath'
                         , value: file.dirname(path)
                         });

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
         * Create and append a new blocking task from the build script.
         * @param {Object} opts
         * @param {String} opts.name
         * @param {String} opts.description
         * @param {Array} opts.dependencies
         */
        self.task = function (opts, fn) {
            ensure_task(opts, fn, true);
        };

        /**
         * Create and append a new asynchronous task from the build script.
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
         * Send an output message to the UI from the build script.
         */
        self.guiout = gui_output('project.guiout');

        /**
         * Send a warning message to the UI from the build script.
         */
        self.guiwarn = gui_output('project.guiwarn');

        /**
         * Send an error message to the UI from the build script.
         * @param {Object} err An Error object.
         */
        self.guierror = function guierr(err) {
            send('project.guierr', null, err);
        };

        // Override the settings.declare() method.
        self.settings = {
            declare: function (spec) {
                if (locked) {
                    throw new Error( 'New settings cannot be dynamically '+
                                     'declared after the build script '+
                                     'has been evaluated.'
                                   );
                }
                settings.declare(spec);
            }

          , spec: settings.spec
          , all: settings.all
          , set: settings.set
          , get: settings.get
        };

        // Expose the rest of the `require("kake")` API.
        self.template = template;
        self.console = console;
        self.path = make_path;
        self.stash = make_stash('kake-build-stash:'+ id);
        return self;
    }

    // Initiates a new securable-module loader (from the addon-kit core) and
    // loads the build script with it. This enables the `require()` capability
    // from the context of the build script.
    //
    // {String} root Root path of the module loader that will be exposed to the
    // build script.
    // {String} path The path of the build script.
    function load_build_script(root, path) {
        var specs

          // Create the public 'kake' API exposed to the build script.
          , pub = make_Pub()
          ;

        // Returns a preloaded exports object to `require()` calls made from
        // the build script.
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

    // Return a configuration settings mapping suitable for use on the UI. This
    // is accomplished by extending stashed user configurations according to
    // the setting declaration rules made by this build script.
    function extend_configs(name) {
        var rv = {}

          // Get the user configurations from the persisted stash by the given
          // project id and configuration name.
          , loaded_configs = (configs.load(id) || {})[name]

          // Defined later.
          , declared
          ;

        if (loaded_configs) {
            // Check for settings which have been incorrectly defined in the
            // user configuration or declared differently by the build script.
            Object.keys(loaded_configs).forEach(function (k) {
                var spec = JSON.parse(settings.spec(k))
                  , item = {
                        status: 'ok'
                      , type: spec.type
                      , value: loaded_configs[k]
                    }
                  ;

                try {
                    settings.set(k, item.value);
                } catch (e) {
                    // 'SettingTypeError' | 'SettingAccessError'
                    item.status = e.name;
                    if (e.name === 'SettingTypeError') {
                        item.value = settings.get(k);
                    }
                }
                rv[k] = item;
            });
        }

        // Settings which have actually been declared by the build script,
        // regardless of the configuration the user has stashed.
        declared = JSON.parse(settings.all());

        // Check for settings which have been declared by the build script but
        // are not defined in the user configuration.
        Object.keys(declared).forEach(function (k) {
            var spec = declared[k];
            if (!has.call(rv, k)) {
                rv[k] = {
                    status: 'undefined'
                  , type: spec.type
                  , value: spec.value
                };
            }
        });

        return rv;
    }

    // If the build script loaded successfully and the user has set a default
    // configuration for this project, retrieve it now and set the project
    // settings.
    if (loaded) {
        current_settings = extend_configs(default_config_name);
    }

    /**
     * Check to see if the build script loaded without errors.
     */
    self.loaded = function () { return loaded; };

    /**
     * Freeze this project and return the tasks and settings created by the
     * build script. When a project is frozen any tasks or settings declared
     * but the build script will throw an error.
     */
    self.lock = function () {
        locked = true;
        return { tasks: get_tasks() 
               , configs: {
                     name: default_config_name
                   , settings: current_settings
               }};
    };

    /**
     * Return the last recorded error.
     */
    self.last_error = function () {
        return error;
    };

    /**
     * Save configuration settings for this project.
     * @param {String} name The user given name for these settings.
     * @param {Object} config_settings The configuration details to save.
     */
    self.save_config = function (name, config_settings) {
        var currently_saved = configs.load(id) || {};
        currently_saved[name] = config_settings;
        configs.save(id, currently_saved);
    };

    /**
     * Save the name of the default configuration setup for this project.
     * @param {String} name The user given name for these settings.
     */
    self.set_default_configs = function (name) {
        stash.set('config-default', name);
        default_config_name = name;
    };

    /**
     * Run this project with the specified tasks and settings.
     * @param {Object} data Tasks and settings.
     * @param {Array} data.tasks Array of task names to run.
     * @param {Object} data.settings The settings dictionary (as modified by
     * the UI).
     */
    self.run = function (data) {
        var task_runner = taskrunner()
          , task_dict = {}
          ;

        // Reset all the memoized settings according to changes made on the UI.
        Object.keys(data.settings).forEach(function (k) {
            try {
                settings.set(k, data.settings[k]);
            } catch (e) {
                send('settings.error', k, e);
            }
        });

        // Load the actual task objects into the taskrunner.
        tasks.forEach(function (t) { task_dict[t.name] = t; });
        data.tasks.forEach(function (t) {
            task_runner.append(task_dict[t]);
        });

        // Add event listeners to the taskrunner.
        task_runner.on('error', function (e) {
            console.debug('Taskrunner error received:', e);
            send('project.runner', 'error', e);
        });
        task_runner.on('done', function () {
            send('project.runner', 'done');
        });

        // JFDI
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
    'use strict';

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

    // Determine the current directory path string.
    function current_dir() {
        var parts = __url__.split('/');
        parts.pop();
        return (parts.join('/') + '/');
    }

    // Observes 'project.load' mailbox message.
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

    // Setup mailbox message observers.
    observe( 'project.load'
           , mailbox_decorator.observe(
    function (id, msg, data) {
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
    observe( 'project.runner'
           , mailbox_decorator.observe(
    function (id, msg, data) {
        projects[id].run(data);
    }));
    observe( 'open_file_picker'
            , mailbox_decorator.observe(
    function (id, msg, data) {
        data = data || {};
        data.window = tabs.activeTab.contentWindow;
        data.filters = [];
        open_file_picker(data, function (maybe_path) {
            send('open_file_picker', id, msg, maybe_path);
        });
    }));
    observe( 'open_folder_picker'
           , mailbox_decorator.observe(
    function (id, msg, data) {
        data = data || {};
        data.window = tabs.activeTab.contentWindow;
        open_folder_picker(data, function (maybe_path) {
            send('open_folder_picker', id, msg, maybe_path);
        });
    }));
    observe( 'config.save'
           , mailbox_decorator.observe(
    function (id, msg, data) {
        projects[id].save_config(msg, data);
    }));
    observe( 'config.default'
           , mailbox_decorator.observe(
    function (id, msg, data) {
        projects[id].set_default_configs(msg);
    }));
};

