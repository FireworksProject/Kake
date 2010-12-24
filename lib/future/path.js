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

// * JSLint 'laxbreak' is true because we are using comma-first JS syntax.

/*global require: false, exports: true, console: false */

'use strict';

var Cc =    require('chrome').Cc
  , Ci =    require('chrome').Ci
  , Cr =    require('chrome').Cr
  , xpcom = require('xpcom')
  , self =  require('self')
  , file =  require('file')
  , url =   require('url')
  , Path
  , tmp_dir = url.toFilename(self.data.url('tmp'))
  , bin_dir = url.toFilename(self.data.url('bin'))
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
    this.path = str || '';
    if (typeof this.path !== 'string') {
        throw new TypeError('Invalid path.Path() type '+
                            Object.prototype.toString.call(str));
    }
};

Path.prototype = {
    toString: function toString() {
        return this.path +'';
    }

  , parent: function () {
        var f;
        try {
            f = nsIFile(this.path).parent;
        } catch (e) {
            if (e.result === Cr.NS_ERROR_FILE_UNRECOGNIZED_PATH) {
                throw new TypeError('unrecognized child path: "'+
                                    this.path +'"');
            }
            throw e;
        }
        if (f === null) {
            return null;
        }
        return new Path(f.path);
    }

  , join: function join(paths) {
        paths = [this.path, paths || '']
                    .concat(Array.prototype.slice.call(arguments, 1));
        try {
            return new Path(file.join.apply(file, paths));
        } catch (e) {
            if (e.result === Cr.NS_ERROR_FILE_UNRECOGNIZED_PATH) {
                throw new TypeError('unrecognized path(s): "'+
                                    paths.join(' ') +'"');
            }
            throw e;
        }
    }

  , exists: function exists() {
        var f;
        try {
            return nsIFile(this.path).exists();
        } catch (e) {
            if (e.result === Cr.NS_ERROR_FILE_UNRECOGNIZED_PATH) {
                return false;
            }
            throw e;
        }
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

  , mkpath: function mkpath() {
        file.mkpath(this.path);
        return this;
    }

  , rm: function rm() {
        var f;
        try {
            f = nsIFile(this.path);
        } catch (e) {
            if (e.result === Cr.NS_ERROR_FILE_UNRECOGNIZED_PATH) {
                return this;
            }
            throw e;
        }
        if (f.exists()) {
            f.remove(true);
        }
        return this;
    }

  , read: function read() {
        try {
            return file.read(this.path);
        } catch (e) {
            if (e.result === Cr.NS_ERROR_FILE_UNRECOGNIZED_PATH) {
                throw new TypeError('unrecognized path: "'+
                                    this.path +'"');
            }
            throw e;
        }
    }

  , write: function write(text) {
        var stream = file.open(this.path, 'w');
        try {
            stream.write(text);
        } finally {
            stream.close();
        }
        return this;
    }

  , run: function run(args, callback) {
        if (typeof args === 'function') {
            callback = args;
            args = [];
        }
        args = Array.isArray(args) ? args :
               typeof args === 'string' ? [args] : [];

        var proc = Cc["@mozilla.org/process/util;1"]
                       .createInstance(Ci.nsIProcess)

          , out_file = new Path(tmp_dir).join('pathmod_run_out.txt')
          , redirect_file = new Path(bin_dir).join('redirect.sh')

          , nsIObserver = {
                QueryInterface: xpcom.utils
                                    .generateQI(
                                        [ Ci.nsIObserver
                                        , Ci.nsISupportsWeakReference])

              , observe: function (proc, msg, data) {
                    // TODO: More thorough processing of results:
                    // https://developer.mozilla.org/en/XPCOM_Interface_Reference/nsIProcess
                    // msg = 'process-finished';
                    // msg = 'process-failed';
                    // console.debug('process finished');
                    // console.debug('process observer data:', data);
                    // console.debug('process observer id:', proc.pid);
                    // console.debug('process observer exitValue:', proc.exitValue);
                    // console.debug('process observer topic:', msg);
                    var rv = out_file.read();
                    out_file.rm();
                    callback(rv);
                }
            }
          ;

        args.unshift(out_file.toString(), this.path);
        proc.init(nsIFile(redirect_file.toString()));
        console.debug('running process');
        proc.runAsync(args, args.length, nsIObserver, true);
    }
};

