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

var Cc           = require('chrome').Cc
  , Ci           = require('chrome').Ci
  , setTimeout   = require('timer').setTimeout
  ;
  

function open_file_picker(opts, callback) {
    opts = opts || {};
    var fp = Cc['@mozilla.org/filepicker;1']
                 .createInstance(Ci.nsIFilePicker)

      // TODO: Robust parameter checks / coercion / defaults.
      , window = opts.window
      , title = opts.title
      , filters = opts.filters
      ;

    fp.init(window, title, Ci.nsIFilePicker.modeOpen);

    filters.forEach(function (filter) {
        fp.appendFilter(filter[0], filter[1]);
    });

    setTimeout(function () {
        callback(fp.show() === Ci.nsIFilePicker.returnOK ?
                 fp.file.path :
                 null);
    }, 0);
}

exports.open_file_picker = exports.openFilePicker = open_file_picker;

