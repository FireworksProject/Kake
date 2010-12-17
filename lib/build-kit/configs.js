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
, immed: true
, strict: true
*/

// * JSLint 'laxbreak' is true because we are using comma-first JS syntax.

/*global require: false, exports: true, console: false */

'use strict';

var STASH_KEY = 'kake-configs-d3fbd74'
  , stash = require('future/stash').Stash(STASH_KEY)
  ;

/**
 * @param {String} project The id of the project for these settings.
 * @param {Object} configs The values of the settings (key-value pairs by
 * configuration names).
 */
exports.save = function save(project, configs) {
    stash.set(project, configs);
};

/**
 * Load all configurations keyed by project id.
 * @param {String} project The project id to look under.
 */
exports.load = function load(project) {
    return stash.get(project);
};

/**
 * Get all the existing configuration keys (project IDs).
 */
exports.keys = function keys() {
    return stash.keys();
};

