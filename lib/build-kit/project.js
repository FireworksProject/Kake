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
, newcap: false
, immed: true
, strict: true
*/

// * jslint nomen is false for the __url__ global.
// * jslist newcap is false because we are using non `new` constructors.

/*global require: false, exports: true, console: false, __url__: false */

'use strict';

var self              = require('self')
  , loader            = require('securable-module')
  , file              = require('file')
  , setTimeout        = require('timer').setTimeout
  , tabs              = require('tabs')
  , open_file_picker  = require('future/file-picker').open_file_picker
  , settings          = require('./settings')
  , taskrunner        = require('./taskrunner').Taskrunner
  , path_constructor  = require('future/path').Path

  , mailbox_decorator
  ;

// Implements our messaging protocol with the content script.
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
function Project(opts) {
    var self = {}
      , loaded = false
      , locked = false
      , error = null
      , id
      , path = opts.path
      , root = opts.root
      , task_runner = taskrunner()
      , tasks = []

      // (type_path, message, data)
      , send = function (type_path, message, data) {
            opts.sender(type_path, id, message, data);
        }
      ;

    id = path;

    /**
     * @param {Object} opts
     * @param {String} opts.name
     * @param {String} opts.description
     * @param {Array} opts.dependencies
     * @param {Function} opts.fn
     * @param {Bool} opts.blocking
     */
    function add_task(opts, fn) {
        task_runner.append(opts, fn);
        tasks.push(opts);
    }

    // Return the tasks list, but do sanity checks on dependencies too.
    function get_tasks() {
        return tasks.map(function (rv, task) {
            var self = {}, deps;

            deps = task.dependencies.reduce(function (rdeps, dep) {
                var i, len = tasks.length;
                for (i = 0; i < len; i += 1) {
                    if (tasks[i].name === dep) {
                        rdeps[dep] = true;
                        return rdeps;
                    }
                }
                rdeps[dep] = false;
                self.missing_dependency = true;
                return rdeps;
            }, {});

            self.dependencies = deps;
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
    function Pub(opts) {
        var self = {}
          , cache = settings.Cache()
          , setting_cache = function (k,v) {
                cache(k,v);
                if (arguments.length > 1) {
                    send('project.setting', 'set', v);
                }
            }
          ;

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

            if (!Array.isArray(opts.dependencies)) {
                throw new TypeError( 'Task dependencies must be an Array '+
                                     'instead of "'+
                                     Object.prototype.toString
                                         .call(opts.dependencies) +
                                     ' in "'+ opts.name +'"'
                                   );
            }

            len = opts.dependencies.length;
            for (i = 0; i < len; i += 1) {
                dep = opts.dependencies[i];
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
            add_task(opts, fn);
        }

        self.task = function (opts, fn) {
            ensure_task(opts, fn, true);
        };

        self.async_task = self.asyncTask = function (opts, fn) {
            ensure_task(opts, fn, false);
        };

        setting_cache('DIR', file.dirname(path));
        self.console = console;
        self.path = path_constructor;
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
        pub = Pub();

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

    self.loaded = function () { return loaded; };

    self.lock = function () {
        locked = true;
        return get_tasks();
    };

    self.last_error = function () {
        return error;
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
    var self = {}
      , projects = {}
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
            var proj = Project({ root: current_dir()
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
            open_file_picker(file_picker_opts, maybe_load_project);
        })
    );
};

