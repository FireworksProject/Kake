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

// TODO: Refactor
// see issue #5 https://github.com/FireworksProject/Kake/issues/issue/5

'use strict';

function Emitter() {
    var self = {}, registry = {};

    function add_listener(type, fn) {
        if (typeof fn !== 'function') {
            throw new TypeError('type of callback ['+ typeof fn +
                                '] !== "function"');
        }
        if (!Object.prototype.hasOwnProperty.call(registry, type)) {
            registry[type] = [];
        }
        registry[type].push(fn);
    }

    function emit(type, context, args) {
        var callbacks = registry[type]
          , i, len = callbacks.length
          ;

        if (callbacks) {
            for (i = 0; i < len; i += 1) {
                callbacks[i].apply(context, args);
            }
        }
    }

    self.on = add_listener;
    self.fire = self.emit = self.trigger = emit;
    return self;
}

exports.makeTaskrunner = exports.make_Taskrunner = function Taskrunner() {
    var self = {}
      , emitter = Emitter()
      , pub = {}
      , stack = []
      , dict = {}
      , current = 0
      , running = false
      ;

    function smash(e) {
        running = false;
        emitter.emit('error', {}, [e]);
    }

    function next() {
        var t;
        if (current < stack.length && running) {
            t = dict[stack[current]];
            try {
                t.fn.call(t.blocking ? {} : pub);
                current += 1;
            } catch (e) {
                smash(e);
                return;
            }
            if (t.blocking) {
                next();
            }
            return;
        }
        emitter.emit('done');
    }

    /**
     * @param {Object} opts
     * @param {String} opts.name
     * @param {Function} opts.fn
     * @param {Bool} opts.blocking
     */
    function add_task(opts) {
        var name = opts.name
          , fn = opts.fn
          , blocking = opts.blocking
          ;

        stack.push(name);
        dict[name] = {fn: fn, blocking: blocking};
    }

    pub.smash = smash;
    pub.ok = next;

    self.on_done = function (fn) {
        emitter.on('done', fn);
    };
    self.on_error = function (fn) {
        emitter.on('error', fn);
    };
    self.append = add_task;
    self.run = function () {
        if (!running) {
            running = true;
            next();
        }
    };
    return self;
};

