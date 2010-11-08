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
  , file              = require('file')
  , url               = require('url')
  , tabs              = require('tabs')
  , menu              = require('future/simple-feature')
  , project           = require('build-kit/project')
  , mailbox           = require('future/mailbox')

  , MENU_NAME = 'Kake'
  , FILE_PICKER_TITLE = 'Find your build script'

  , ui_url = self.data.url('kake.html')
  , ui_script = self.data.url('ui.js')

  , ui
  ;

function launch_ui() {
    tabs.open({url: ui_url});
}

function connect_ui(worker, page) {
    var msgr, mb, script_url;
   
    msgr = project.Messenger(
               { file_picker_dialog_title: FILE_PICKER_TITLE });

    mb = mailbox.Mailbox({
               classes: {project: msgr}
             , sender: worker.postMessage
             });

    worker.on('error', function (e) {
        console.warn('The page-mod had a problem:');
        console.debug(e);
    });

    worker.on('message', mb.receive);

    script_url = url.toFilename(
                     // WARNING! This technique is not stable and could go bad
                     // at any time.
                     __url__.replace(/main\.js$/, 'future/mailbox.js'));

    // Inject the pre-requisite mailbox.js module into the content script.
    worker.postMessage(file.read(script_url));
}

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

