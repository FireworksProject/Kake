var kake = require('kake')
  , console = kake.console
  , task = kake.task
  , settings = kake.settings
  //, promises = require('fireworks/promises/full')
  //, iter = require('fireworks/iter')
  //, trim = require('fireworks/utils/string/trim')

  , path = kake.path

  //, iter = kake.iter
  , stash = kake.stash
  //, print = kake.print
  //, print_err = kake.print_err
  //, template = kake.template

  , DIR = path(settings('DIR'))
  , SRC = DIR.join('src')
  , LIB_DIR = DIR.join('lib')
  , DATA_DIR = DIR.join('data')
  , TEMP = DIR.join('temp')
  , LICENSE_TPL = SRC.join('MIT-LICENSE.tpl')
  //, LICENSE_LOCATIONS = []
  //, SHARED = PROJECT.join('shared')
  //, FIREWORKS_SRC = SHARED.join('fireworks')
  //, JQUERY_SRC = SHARED.join('jquery')
  //, JQUERY_DIST = JQUERY_SRC.join('jquery.js')
  ;

// ### Standard settings.
// These are special settings that Kake will use if you set them. Most of the
// time, if they are not set, a default value is assigned for you. To make
// them easier to spot, they are always in ALL_CAPS.
//settings('NAME', 'Kake');

// ### Project settings.
// These settings have no special meaning for Kake and are just for this
// project. Each setting has a name, a value, and an optional description.

        // The name of this setting.
/*settings( 'jQuery Download URL'

        // The value of this setting.
        , 'https://ajax.googleapis.com/ajax/libs/jquery/VERSION/jquery.js'

        // The description of this setting.
        , ( 'The URL to download jQuery from. '+
            'The "VERSION" string will be replaced with the version number.')
        );*/

// More settings:

/*settings( 'jQuery version'
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
        );*/

// A function created just for this build file that is used to easily output an
// Iter list of errors. Search the docs for more about Iter objects. They're
// cool and that's how we roll.
//function report_errors(errs) {
//    errs.each(function (e) { print_err(e); });
//}

// A quick and dirty way to read a version string from a file.
/*function read_version_file(file_path) {
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
} */


task(
  { name: 'temp directory'
  , description: 'Create the temporary build dir.'
  }
, function () {
      TEMP.rm().mkpath();
  }
);

task(
  { name: 'licensing'
  , description: 'Create the licenses from templates if the template is new, '+
                 'or this is the first build of a new year.'
  }
, function (t) {
    var last = stash.get('license.last_update') || 0
      , current = LICENSE_TPL.mtime().getTime()
      , today
      , write_promises
      ;

    if (last > current) {
        return;
    }

    today = new Date();

    /*
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
        */

    stash.set('license.last_update', today.getTime());
});
/*

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
*/
