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
, immed: true
, strict: true
*/

// * JSLint 'laxbreak' is true because we are using comma-first JS syntax.

/*global require: false, exports: true, console: false */

'use strict';

var has = Object.prototype.hasOwnProperty;

/**
 * @exports make_Settings
 * @exports makeSettings
 * Create a settings manager.
 * @returns A settings manager instance.
 */
exports.make_Settings = exports.makeSettings = function Settings() {
    var self = {}
      , memo= {}
      ;

    /**
     * Declare a setting.
     * @param {Object} spec The specifications of the setting.
     * @param {String} spec.key The key string name of the setting.
     * @param {String} spec.type The type of value expected
     * (string|number|boolean|filepath}
     * @param {String|Number|Boolean} [spec.value] The value to assign;
     * defaults to `undefined`.
     *
     * Settings must be declared with this function call before they can be
     * accessed. If a setting is not declared before it is set or get, a
     * `SettingAccessError` will be thrown.
     * @throws {TypeError} if the key or type is not a string.
     * @throws {SettingDeclarationError} if the setting type is invalid or
     * unknown.
     */
    self.declare = function declare_setting(spec) {
        spec = spec || {};
        var key = spec.key
          , type = spec.type
          , err
          ;
        if (typeof key !== 'string') {
            err = new TypeError('typeof key ['+ typeof key +'] !== "string"');
            throw err;
        }
        if (typeof type !== 'string') {
            err = new TypeError('typeof type ['+ typeof type +'] !== "string"');
            throw err;
        }

        switch (type) {
        case 'string':
            break;
        case 'number':
            break;
        case 'filepath':
            break;
        case 'folderpath':
            break;
        case 'boolean':
            break;
        default:
            err = new Error('Invalid setting type ['+ type +'].');
            err.name = 'SettingDeclarationError';
            throw err;
        }

        memo[key] = spec;
    };

    /**
     * Get the specification for a key in JSON notation form.
     * @param {String} key The key string name of the setting.
     * @returns {String} Specification serialized in JSON.
     */
    self.spec = function get_spec(key) {
        if (has.call(memo, key)) {
            return JSON.stringify(memo[key]);
        }
        // else return undefined
    };

    /**
     * Get the specification for all memoized keys in JSON notation form.
     * @returns {String} Specifications object serialized in JSON.
     */
    self.all = function get_all() {
        return JSON.stringify(memo);
    };

    /**
     * Set the value of a setting regardless of the previous value.
     * @param {String} key The key string name of the setting.
     * @param {String|Number|Boolean} value The value to assign;
     *
     * Settings must be declared with `declare()` before they can be accessed.
     * If a setting is not declared before it is set, a `SettingAccessError`
     * will be thrown.
     * @throws {SettingAccessError} if the key has not been declared.
     * @throws {SettingTypeError} if the setting type is invalid or
     * unknown.
     */
    self.set = function set_setting(key, val) {
        var type, err, setting;

        if (has.call(memo, key)) {
            type = typeof(val);
            err = new Error('Invalid setting type ['+ type +'] for key "'+
                            key +'".');
            err.name = 'SettingTypeError';
            setting = memo[key];

            switch (setting.type) {
            case 'string':
                if (type !== 'string') {
                    throw err;
                }
                break;
            case 'number':
                if (type !== 'number') {
                    throw err;
                }
                break;
            case 'filepath':
                if (type !== 'string') {
                    throw err;
                }
                break;
            case 'folderpath':
                if (type !== 'string') {
                    throw err;
                }
                break;
            case 'boolean':
                if (type !== 'boolean') {
                    throw err;
                }
                break;
            default:
                err = new Error('Unknown setting type ['+
                                setting.type +'] for key "'+ key +'".');
                err.name = 'SettingTypeError';
                throw err;
            }

            memo[key].value = val;
            return val;
        }
        err = new Error('Cannot `set("'+ key +
                        '")` which has not been declared.');
        err.name = 'SettingAccessError';
        throw err;
    };

    /**
     * Get the value of a setting by key.
     * @param {String} key The key string name of the setting.
     *
     * Settings must be declared with `declare()` before they can be accessed.
     * If a setting is not declared before it is get, a `SettingAccessError`
     * will be thrown.
     * @throws {SettingAccessError} if the key has not been declared.
     * @returns {String|Number|Boolean} the setting value.
     */
    self.get = function get_setting(key) {
        if (has.call(memo, key)) {
            return memo[key].value;
        }
        var err = new Error('Cannot `get("'+ key +
                            '")` which has not been declared.');
        err.name = 'SettingAccessError';
        throw err;
    };

    return self;
};

