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

/*global require: false, exports: true, console: false */

'use strict';

var self              = require('self')
  , page_mod          = require('page-mod')
  , tabs              = require('tabs')
  , menu              = require('future/simple-feature')
  , project           = require('build-kit/project')
  , mailbox           = require('future/mailbox')

  , MENU_NAME = 'Kake'
  , FILE_PICKER_TITLE = 'Find your build script'

  , ui_url = self.data.url('kake.html')
  , ui_script = self.data.url('js/ui.js')

  , ui
  ;

function launch_ui() {
    tabs.open({url: ui_url});
}

// Connect the unprivileged page-mod UI script to the project module.
function connect_ui(worker, page) {
    var mb;

    worker.on('error', function (e) {
        console.warn('The PageMod had a problem:');
        console.debug(e);
    });
   
    mb = mailbox.Mailbox({sender: worker.postMessage});
    worker.on('message', mb.receive);
    project.Messenger(
        { file_picker_dialog_title: FILE_PICKER_TITLE
        , sender: mb.send
        , observer: mb.observe
        }
        );
}

// Create the unprivileged page-mod object to implement ui functionality.
ui = page_mod.PageMod({
           include: ui_url
         , contentScriptURL: ui_script
         , contentScriptWhen: 'ready'
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

