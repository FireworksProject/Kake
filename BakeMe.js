var kake = require('kake')
  , console = kake.console
  , guiout = kake.guiout
  , guiwarn = kake.guiwarn
  , guierr = kake.guierr
  , task = kake.task
  , settings = kake.settings
  , template = kake.template
  , path = kake.path
  , stash = kake.stash

  , DIR = path(settings('DIR'))
  , SRC = DIR.join('src')
  , LIB_DIR = DIR.join('lib')
  , DATA_DIR = DIR.join('data')
  , TEMP = DIR.join('temp')
  , LICENSE_TPL = SRC.join('MIT-LICENSE.tpl')

  , LICENSE_NAME = 'MIT-LICENSE'
  , LICENSE_LOCATIONS = [
        DIR.join(LICENSE_NAME)
    ]
  ;

task(
  { name: 'licensing'
  , description: 'Create the licenses from templates if the template is new, '+
                 'or this is the first build of a new year.'
  }
, function (t) {
    guiout('start task "licensing"');
    var last
      , current
      , today
      , text
      , i
      ;

    if (!LICENSE_TPL.exists()) {
        throw new Error(LICENSE_TPL +' does not exist.');
    }

    i = LICENSE_LOCATIONS.length;
    while ((i -= 1) >= 0) {
        if (!LICENSE_LOCATIONS[i].exists()) {
            break;
        }
    }

    // If all the expected license files exist, we compare the last modified
    // date of the template and check for a new year.
    today = new Date();
    if (i < 0) {
        last = stash.get('license.last_update') || 0;
        current = LICENSE_TPL.mtime().getTime();
        // If the last build is newer than the last modify time of the license
        // template, or we have not entered a new year; we can skip this task.
        if (last >= current ||
            new Date(last).getFullYear() === today.getFullYear()) {
            guiout('skipping: license file re-builds '+
                   'are not necessary for this build.');
            return;
        }
    }

    guiout('building new licenses');
    text = template(LICENSE_TPL.read())({YEAR: today.getFullYear()});
    LICENSE_LOCATIONS.forEach(function (license_path) {
        license_path.write(text);
    });

    stash.set('license.last_update', today.getTime());
});

