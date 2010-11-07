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

/*global require: false, exports: true, console: false */

var self              = require('self')
  , loader            = require('securable-module')
  , file              = require('file')
  , page_mod          = require('page-mod')
  , tabs              = require('tabs')
  , open_file_picker  = require('future/file-picker').open_file_picker
  , menu              = require('future/simple-feature')
  , Mailbox           = require('future/mailbox').Mailbox

  , MENU_NAME = 'Kake'
  , FILE_PICKER_TITLE = 'Find your build script'

  , ui_url = self.data.url('kake.html')
  , ui_script = self.data.url('ui.js')

  , ui
  ;

function build_exports(base, id) {
    //console.log('build_exports() base:', base, 'id:', id);
    if (id === 'kake') {
        return {console: console};
    }
    return null;
}

function load_build_script(path) {
    var root_path = __url__.replace(/main\.js/, 'build-kit/')
      , mod_loader
      ;

    //console.log('root path:', root_path);
    //console.log('contents:', file.read(path));

    // TODO: The call to file.read() should be in a try ... catch.
    mod_loader = new loader.Loader({ rootPath: root_path
                                   , getModuleExports: build_exports
                                   });
    mod_loader.runScript({contents: file.read(path), filename: path});
}

function Project() {
    var self = {}
      , load_script
      ;

    load_script = function () {
        open_file_picker(
              {
                window: tabs.activeTab.contentWindow
              , title: FILE_PICKER_TITLE
              , filters: []
              }
            , function (path) {
                if (path) {
                    load_build_script(path);
                }
              }
            )
    };

    self.load = load_script;
    return self;
}

function launch_ui() {
    tabs.open({url: ui_url});
}

function connect_ui(worker, page) {
    Mailbox({classes: {project: Project()}}).append(worker);
}

ui = page_mod.PageMod({
           include: ui_url
         , contentScriptURL: ui_script
         , onAttach: connect_ui
         });

exports.main = function main(opts, callbacks) {
    page_mod.add(ui);
    menu.register(MENU_NAME, launch_ui);
};

/* FIXME: This is causing the appliction (Firefox) to immediately shutdown
 * during `cfx run`.
exports.onUnload = function unload(reason) {
    // TODO
};
*/

