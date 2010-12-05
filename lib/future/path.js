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

var Cc =   require('chrome').Cc
  , Ci =   require('chrome').Ci
  , Cr =   require('chrome').Cr
  , file = require('file')
  , Path
  ;

function nsIFile(path) {
  var file = Cc['@mozilla.org/file/local;1']
             .createInstance(Ci.nsILocalFile);
  file.initWithPath(path);
  return file;
}

exports.Path = exports.path = Path = function (str) {
    if (!(this instanceof Path)) {
        return new Path(str);
    }
    this.path = str;
};

Path.prototype = {

      join: function join(paths) {
          paths = [this.path].concat(Array.prototype.slice.call(arguments));
          try {
              return new Path(file.join.apply(file, paths));
          } catch (e) {
              if (e.result === Cr.NS_ERROR_FILE_UNRECOGNIZED_PATH) {
                  throw new TypeError('unrecognized path: '+ paths);
              }
              throw e;
          }
      }

    , rm: function rm() {
          var f = nsIFile(this.path);
          if (f.exists()) {
              f.remove(true);
          }
          return this;
      }

    , mkpath: function mkpath() {
          file.mkpath(this.path);
          return this;
      }

    , mtime: function mtime() {
        try {
          return new Date(nsIFile(this.path).lastModifiedTime);
        } catch (e) {
            if (e.result === Cr.NS_ERROR_FILE_TARGET_DOES_NOT_EXIST) {
                return new Date(0);
            }
            else {
                throw e;
            }
        }
      }
};
