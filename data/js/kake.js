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
  evil: false
, laxbreak: true
, onevar: true
, undef: true
, nomen: true
, eqeqeq: true
, plusplus: true
, bitwise: true
, regexp: true
, newcap: true
, immed: true
, strict: false
*/

// * jslint strict is false because we use it within the function;
//   not the whole script.

/*global
  window: false
, require: false
, exports: true
, console: false
*/
(function (window) {
var document = window.document
  , setTimeout = window.setTimeout
  , aps = Array.prototype.slice
  , loc = window.location
  , jq = window.jQuery

  , projects = {}

  , send
  , observe
  , maybe_load_messenger
  ;

// Hide unused UI elements.
jq('#error-dialog').hide();
jq('#project-dialog').hide();
jq('#project').hide();

// Create jQuery UI buttons.
jq('#load-project').button();
jq('#build-project').button({disabled: true});
jq('#reload-project').button({disabled: true});

function thrower(e) {
    setTimeout(function () { throw e; }, 0);
}

// Quick and dirty debug logging.
// (designed to stay in place for deployed code)
function log() {
    if (typeof console !== 'undefined') {
        console.log.apply(console, arguments);
    }
    else {
        if (arguments[0] instanceof Error) {
            thrower(arguments[0]);
        }
        else {
            thrower(aps.call(arguments).join(' '));
        }
    }
}

function show_error(title, error) {
    jq('#error-string').html(error.message);
    jq('#error-line').html(error.lineNumber);
    jq('#error-file').html(error.fileName);
    jq('#error-stack').html(error.stack);
    jq('#error-dialog')
        .dialog({ title: title
                , width: jq(window).width() / 2
                , buttons: [{
                    text: 'Ok'
                  , click: function () { jq(this).dialog('close'); }
                  }]
                });
}

function get_lib_url(path) {
    // TODO: This is hackish and fragile.
    return 'resource://'+ loc.host.replace(/data$/, 'lib') + path;
}

function inject_script(url, callback) {
    var script = document.createElement('script');
    script.src = url;
    script.onload = callback;
    document.documentElement.appendChild(script);
}

function init_messenger(mailbox_mod, mailbox_decorator) {
    var messenger_out = document.getElementById('messenger-out')
      , messenger_in = document.getElementById('messenger-in')
      , mailbox
      ;

    function post_message(msg) {
        var ev = document.createEvent('Events');
        messenger_out.textContent = JSON.stringify(msg);
        ev.initEvent('messenger.onMessage', true, false);
        messenger_out.dispatchEvent(ev);
    }

    messenger_in.addEventListener('messenger.onMessage', function (ev) {
        mailbox.receive(JSON.parse(ev.target.textContent));
    }, false);

    mailbox = mailbox_mod.make_Mailbox({sender: post_message});
    send = mailbox_decorator.send(mailbox.send);
    observe = function (type_path, fn) {
        mailbox.observe(type_path, mailbox_decorator.observe(fn));
    };
}

function make_Project(id) {
    var self = {}
      , teardown
      , reload_project
      ;

    // data.name
    // data.value
    function render_settings(data) {
        data = Array.isArray(data) ? data : [data];
        jq.tmpl('setting', data).appendTo('#settings');
    }

    // data = [task1, task1, ...]
    // task.name
    // task.description
    // task.deps
    function render_tasks(data) {
        jq.tmpl('task', data).appendTo('#tasks');
    }

    function run_project() {
        jq('#build-project')
            .unbind('click', run_project)
            .button('disable')
            ;

        var data = {tasks: [], settings: {}};

        jq('li.settings').each(function (i, el) {
            var name = jq('span.setting-name', el).html()
              , value = jq('span.setting-value', el).html()
              ;

            data.settings[name] = value;
        });

        jq('li.tasks.run').each(function (i, el) {
            data.tasks.push(jq('p.task-name', el).html());
        });

        send('project.runner', id, 'run', data);
    }

    teardown = function () {
        jq('#reload-project')
            .unbind('click', reload_project)
            .button('disable')
            ;
        jq('#build-project')
            .unbind('click', run_project)
            .button('disable')
            ;
        jq('#tasks').empty();
        jq('#settings').empty();
    };

    reload_project = function () {
        teardown();
        send('project.load', id, 'reload');
    };

    function setup() {
        jq('#build-project')
            .click(run_project)
            .button('enable')
            ;
        jq('#reload-project')
            .click(reload_project)
            .button('enable')
            ;
    }

    function render_project(data) {
        var settings = Object.keys(data.settings).map(function (name) {
                           return {name: name, value: data.settings[name]};
                       });
        render_settings(settings);
        render_tasks(data.tasks);
        jq('#start').hide();
        setup();
        jq('#project').show();
    }

    self.render = render_project;
    return self;
}

function load_project() {
    jq('#load-project').unbind('click', load_project);
    send('project.load', null, 'load');
}

function init() {
    observe('project.load', function (id, msg, data) {
        if (msg === 'OK') {
            projects[id] = make_Project(id);
            projects[id].render(data);
            return;
        }
        if (msg === 'error') {
            show_error('Build script error', data);
        }
        else {
            log('Unexpected mailbox message to project.load:');
            log(id, msg, data);
        }
        jq('#load-project').click(load_project);
    });

    observe('project.runner', function (id, msg, data) {
        if (msg === 'done') {
            jq('#project-dialog-message')
                .html('Project '+ id +' build complete.');

            jq('#project-dialog')
                .dialog({ title: 'Project Complete'
                        , width: jq(window).width() / 2
                        });
            return;
        }
        else if (msg === 'error') {
            show_error('Build script run error', data);
        }
        else {
            log('Unexpected mailbox message to project.runner:');
            log(id, msg, data);
        }
    });
}

maybe_load_messenger = (function () {
    var memo = {};
    return function (mailbox, decorator) {
        if (mailbox) {
            memo.mailbox = mailbox;
        }
        if (decorator) {
            memo.decorator = decorator;
        }

        if (memo.mailbox && memo.decorator) {
            init_messenger(memo.mailbox, memo.decorator.mailbox_decorator);
            init();
        }
    };
}());

inject_script(get_lib_url('/future/mailbox.js'), function () {
    maybe_load_messenger(window['/future/mailbox']);
});

inject_script(get_lib_url('/build-kit/mailbox-decorator.js'), function () {
    maybe_load_messenger(null, window['/build-kit/mailbox-decorator']);
});

// Build and cache the templates.
jq('#setting-template').template('setting');
jq('#task-template').template('task');
jq('#load-project').click(load_project);
}(window));

