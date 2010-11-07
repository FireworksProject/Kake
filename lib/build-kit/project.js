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
, newcap: true
, immed: true
, strict: true
*/

// jslint nomen is false for the __url__ global.

/*global require: false, exports: true, console: false, __url__: false */

'use strict';

var self              = require('self')
  , loader            = require('securable-module')
  , file              = require('file')
  , tabs              = require('tabs')
  , open_file_picker  = require('future/file-picker').open_file_picker
  , settings          = require('./settings')
  ;

/**
 * @param {Object} opts
 * @param {String} opts.path
 */
function Pub(opts) {
    var self = {}
      , cache = settings.Cache()
      , dir = file.dirname(opts.path)
      ;

    cache('DIR', dir);

    self.settings = cache;
    self.console = console;
    return self;
}

function current_dir() {
    var parts = __url__.split('/');
    parts.pop();
    return (parts.join('/') + '/');
}

/**
 * @param {Object} opts
 * @param {String} opts.path
 * @param {String} opts.root
 */
function Project(opts) {
    var self = {}
      , root = opts.root
      , pub
      ;

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
                }
          ;

        pub = Pub({path: path})

        console.log('root path:', root);
        //console.log('contents:', file.read(path));

        // TODO: The call to file.read() should be in a try ... catch.
        new loader.Loader(mod_loader)
            .runScript({contents: file.read(path), filename: path});
    }

    self.load = load_build_script;
    return self;
}

/**
 * @param {Object} opts
 * @param {String} opts.file_picker_dialog_title
 */
exports.Messenger = function Messenger(opts) {
    var self = {}
      , fp_dialog_title = opts.file_picker_dialog_title
      , load_script
      ;

    load_script = function () {
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
                if (path) {
                    Project({root: current_dir()})
                        .load(path);
                }
              }
            );
    };

    self.load = load_script;
    return self;
};

