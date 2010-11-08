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
  , tabs              = require('tabs')
  , open_file_picker  = require('future/file-picker').open_file_picker
  , settings          = require('./settings')

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

/**
 * @constructor
 */
function PubSettings(cache, callback) {
    return function pub(k, v) {
        cache(k, v);
        if (arguments.length > 1) {
            callback(v);
        }
    };
}

/**
 * @constructor
 * @param {Object} opts
 * @param {String} opts.path
 * @param {Function} opts.trigger
 *
 * Post methods called:
 *     setting(data)
 */
function Pub(opts) {
    var self = {}
      , pub_settings
      , dir = file.dirname(opts.path)

      , trigger = opts.trigger
      ;

    pub_settings = PubSettings( settings.Cache()
                              , function (data) {
                                    trigger('setting', data);
                                }
                              );
    pub_settings('DIR', dir);

    self.settings = pub_settings;
    self.console = console;
    return self;
}

function current_dir() {
    var parts = __url__.split('/');
    parts.pop();
    return (parts.join('/') + '/');
}

/**
 * @constructor
 * @param {Object} opts
 * @param {String} opts.root
 * @param {Path} opts.path
 * @param {Function} opts.sender
 *
 * Post methods called:
 *     project[setting](data)
 *     project[load_result](bool)
 */
function Project(opts) {
    var self = {}
      , path = opts.path
      , root = opts.root

      , sender = mailbox_decorator.send(opts.sender, 'project')
      , pub
      ;

    self.id = path;
    self.loaded = false;

    function send(method, msg, data) {
        sender(method, path, msg, data);
    }

    function build_exports(base, id) {
        //console.log('build_exports() base:', base, 'id:', id);
        if (id === 'kake') {
            return pub;
        }
        return null;
    }

    function load_build_script(path) {
        var mod_loader = {
                  rootPath: root
                , getModuleExports: build_exports
                };

        pub = Pub({ path: path
                  , trigger: send
                  });

        console.log('root path:', root);
        //console.log('contents:', file.read(path));

        // TODO: The call to file.read() should be in a try ... catch.
        new loader.Loader(mod_loader)
            .runScript({contents: file.read(path), filename: path});
    }

    function jsonize() {
        return { id: self.id
               , loaded: self.loaded
               };
    }

    if (path) {
        try {
            load_build_script(path);
            self.loaded = true;
            send( 'load_result', 'OK', jsonize());
        } catch (e) {
            self.loaded = false;
            console.warn('Error loading build script from path', path, ':');
            console.debug(e);
            send( 'load_result', 'error', e.toString());
        }
    }
    else {
        send( 'load_result', 'cancel', jsonize());
    }

    return self;
}

/**
 * @constructor
 * @param {Object} opts
 * @param {String} opts.file_picker_dialog_title
 *
 * Post methods called: see Project constructor.
 */
exports.Messenger = function Messenger(opts) {
    var self = {}
      , fp_dialog_title = opts.file_picker_dialog_title
      , load_script
      , projects = {}
      ;

    load_script = mailbox_decorator.receive(function (id, msg, data) {
        open_file_picker(
              {
                // We can get away with using the window for the active tab
                // rather than searching for the correct content window for the
                // page-mod because we know that the page-mod worker could not
                // have sent this message if it was not active.
                window: tabs.activeTab.contentWindow
              , title: fp_dialog_title
              , filters: []
              }
            , function (path) {
                var proj = Project({ root: current_dir()
                                   , path: path
                                   , sender: self.send
                                   });

                if (proj.loaded) {
                    projects[proj.id] = proj;
                }
              }
            );
    });

    self.load = load_script;

    // This method is supposed to be overwritten by the Mailbox constructor.
    self.send = function () {
        throw new Error('.send() Not Implemented.');
    };

    return self;
};

