var kake = require('kake')
  , promises = require('fireworks/promises/full')
  , iter = require('fireworks/iter')
  , trim = require('fireworks/utils/string/trim')

  , task = kake.task
  , settings = kake.settings
  , path = kake.path
  , iter = kake.iter
  , stash = kake.stash
  , print = kake.print
  , print_err = kake.print_err
  , template = kake.template

  , PROJECT = path(settings('PROJECT'))
  , SOURCE = PROJECT.join('src')
  , DIST = PROJECT.join('moz-ext')
  , TEMP = PROJECT.join('temp')
  , LICENSE_TPL = SOURCE.join('MIT-LICENSE.template')
  , LICENSE_LOCATIONS = []
  , SHARED = PROJECT.join('shared')
  , FIREWORKS_SRC = SHARED.join('fireworks')
  , JQUERY_SRC = SHARED.join('jquery')
  , JQUERY_DIST = JQUERY_SRC.join('jquery.js')
  ;

settings('NAME', 'Kake');
settings('TIMEOUT', 10000);

settings( 'jQuery Download URL'
        , 'https://ajax.googleapis.com/ajax/libs/jquery/VERSION/jquery.js'
        , ( 'The URL to download jQuery from. '+
            'The "VERSION" string will be replaced with the version number.')
        );
settings( 'jQuery version'
        , '1.4.2'
        , 'The version of jQuery to use for this build.'
        );
settings( 'Fireworks.js Download URL'
        , ''
        , 'URL to use for cloning the Fireworks.js repository from GitHub.'
        );
settings( 'Fireworks.js version'
        , '0.0.0a1'
        , 'The version of Fireworks.js to use for this build.'
        );

function report_errors(errs) { errs.each(print_err(errs)); }

function read_version_file(file_path) {
    var p = promises.promise()
      , when_fulfilled, when_smashed
      ;

    if (!file_path.isfile()) { p.fulfill(null); }

    when_fulfilled = function (result) { p.fulfill(trim(result)); };

    when_smashed = function (err) {
        print_err(err);
        p.fulfill(null);
    };

    f.read()(when_fulfilled, when_smashed);
    return p.when;
}

// TODO: Make TEMP an actual dir?

task('licensing', function (t) {
    var last = stash.get('license.last_update') || 0
      , current = LICENSE_TPL.mtime().getTime()
      , today
      , write_promises
      ;

    if (last > current) {
        t.done();
        return;
    }

    today = new Date();
    text = template(LICENSE_TPL, {DATE: today.getFullYear()});

    write_promises = iter(LICENSE_LOCATIONS).map(function (path) {
        return path.overwrite(text);
    });

    function when_fulfilled(results) {
        results.each(function (path) {
            print('Wrote new license to: '+ path[0].relative(PROJECT));
        });
    }

    promises.join(write_promises)
        (when_fulfilled, report_errors, t.done)
        ;

    stash.set('license.last_update', today.getTime());
});

task('update_shared', function (t) {
    var jquery, fireworks;

    // TODO: when_fulfilled and when_errors functions

    function check_version(version) {
        return function (result) {
            if (!result || result !== version) { version }
        }
    }

    function get_resource(url, dest) {
        return function (version) {
            return download(url.replace(/VERSION/, version), dest);
        }
    }

    fireworks = 
        read_version_file(FIREWORKS_SRC.join('VERSION'))
        (check_version(fireworks_version))
        (get_resource( settings('Fireworks.js Download URL')
                     , TMP.join('fireworks.js.zip')
                     ))
        // TODO: Unpack the zip archive.
        ;

    jquery = 
        read_version_file(JQUERY_SRC.join('version.txt'))
        (check_version(jquery_version))
        (get_resource(settings('jQuery Download URL'), JQUERY_DIST))
        ;

    promises.join(fireworks, jquery)
        (when_fulfilled, report_errors, t.done)
        ;
});

task('build', ['licensing', 'update_shared'], function (t) {
});

task('test', ['build'], function (t) {
});

task('version_bump', function (t) {
});

task('release', ['test', 'version_bump'], function (t) {
});

task('pre_deploy', ['release'], function (t) {
});

task('update_rdf', function (t) {
});

task('deploy', ['pre_deploy', 'update_rdf'], function (t) {
});
