function get_dir() {
    var id = 'kake@fireworksproject.com'
      , em = Components.classes['@mozilla.org/extensions/manager;1']
                 .getService(Components.interfaces.nsIExtensionManager)
      ;

    return em.getInstallLocation(id).getItemLocation(id);
}

var path = 'file://' + get_dir().path + '/packages/kake-test/lib/'

var injected_test_module = {
  print: function test_print() {
        var args = Array.prototype.slice.call(arguments);
        if (args[1] === 'info' && args[0] === 'DONE') {
            ok(true, 'test complete: '+ args[1]);
            return;
        }
        if (args[1] === 'fail') {
            ok(false, args[0]);
            return;
        }
        if (args[1] === 'pass') {
            ok(true, args[0]);
            return;
        }
        if (typeof console !== 'undefined' &&
            typeof (console || {}).log === 'function') {
            console.log.apply(console, args);
        }
        else {
            dump(args.join(' ') + '\n');
        }
    }

, assert: function (guard, message) {
        ok(guard, message);
    }
};

test('absolute', function () {
    expect(2);
    loader = exports.loader({paths: [ path + 'commonjs/absolute/']});

    runtime = exports.runtime({ loader: loader
                              , modules: {test: injected_test_module}
                              });
    runtime('program');
});

test('cyclic', function () {
    expect(5);
    loader = exports.loader({paths: [ path + 'commonjs/cyclic/']});

    runtime = exports.runtime({ loader: loader
                              , modules: {test: injected_test_module}
                              });
    runtime('program');
});

test('determinism', function () {
    expect(2);
    loader = exports.loader({paths: [ path + 'commonjs/determinism/']});

    runtime = exports.runtime({ loader: loader
                              , modules: {test: injected_test_module}
                              });
    runtime('program');
});

test('exactExports', function () {
    expect(2);
    loader = exports.loader({paths: [ path + 'commonjs/exactExports/']});

    runtime = exports.runtime({ loader: loader
                              , modules: {test: injected_test_module}
                              });
    runtime('program');
});

test('hasOwnProperty', function () {
    expect(1);
    loader = exports.loader({paths: [ path + 'commonjs/hasOwnProperty/']});

    runtime = exports.runtime({ loader: loader
                              , modules: {test: injected_test_module}
                              });
    runtime('program');
});

test('method', function () {
    expect(4);
    loader = exports.loader({paths: [ path + 'commonjs/method/']});

    runtime = exports.runtime({ loader: loader
                              , modules: {test: injected_test_module}
                              });
    runtime('program');
});

test('missing', function () {
    expect(2);
    loader = exports.loader({paths: [ path + 'commonjs/missing/']});

    runtime = exports.runtime({ loader: loader
                              , modules: {test: injected_test_module}
                              });
    runtime('program');
});

test('monkeys', function () {
    expect(2);
    loader = exports.loader({paths: [ path + 'commonjs/monkeys/']});

    runtime = exports.runtime({ loader: loader
                              , modules: {test: injected_test_module}
                              });
    runtime('program');
});

test('nested', function () {
    expect(2);
    loader = exports.loader({paths: [ path + 'commonjs/nested/']});

    runtime = exports.runtime({ loader: loader
                              , modules: {test: injected_test_module}
                              });
    runtime('program');
});

test('relative', function () {
    expect(2);
    loader = exports.loader({paths: [ path + 'commonjs/relative/']});

    runtime = exports.runtime({ loader: loader
                              , modules: {test: injected_test_module}
                              });
    runtime('program');
});

test('transitive', function () {
    expect(2);
    loader = exports.loader({paths: [ path + 'commonjs/transitive/']});

    runtime = exports.runtime({ loader: loader
                              , modules: {test: injected_test_module}
                              });
    runtime('program');
});

