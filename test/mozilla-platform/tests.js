var Cc = Components.classes
  , Ci = Components.interfaces
  , Cu = Components.utils
  ;

module('Sandbox');

function make_sandbox() {
    return new Cu.Sandbox(
            Cc["@mozilla.org/systemprincipal;1"]
                .createInstance(Ci.nsIPrincipal));
}

test('Components.utils.Sandbox().toString()', function() {
    var sandbox = make_sandbox();
    strictEqual( (sandbox +'')
               , '[object Sandbox]'
               , '(sandbox +"")'
               );
    strictEqual( sandbox.toString()
               , '[object Sandbox]'
               , 'sandbox.toString()'
               );
    strictEqual( Object.prototype.toString.call(sandbox)
               , '[object Sandbox]'
               , 'Object.prototype.toString'
               );
});

test('Components.utils.Sandbox() globals.', function() {
    var sandbox = make_sandbox();
    sandbox.results = {};

    Cu.evalInSandbox( ( "(function (G) {"+
                        "results.globals = [];"+
                        "for (var n in G) { results.globals.push(n); }"+
                        "results.global_str = G.toString();"+
                        "results.global_opstr = Object.prototype.toString.call(G);"+
                        "results.dump = typeof dump;"+
                        "results.Components = typeof Components"+
                        "}(this));"
                      )
                    , sandbox, '1.8', '<test>', 1);

    strictEqual( sandbox.results.globals.length
               , 1
               , 'single global'
               );
    strictEqual( sandbox.results.globals[0]
               , 'results'
               , 'injected "results" onto global'
               );
    strictEqual( sandbox.results.global_str
               , '[object Sandbox]'
               , 'this.toString()'
               );
    strictEqual( sandbox.results.global_opstr
               , '[object Sandbox]'
               , 'Object.prototype.toString.call(this)'
               );

    // Known global
    strictEqual( sandbox.results.dump
               , 'function'
               , 'typeof dump'
               );
    // Known global
    strictEqual( sandbox.results.global_opstr
               , '[object Sandbox]' // WTF
               , 'typeof Components'
               );
});

test('Components.utils.Sandbox() scope.', function () {
    var sandbox = make_sandbox();

    Cu.evalInSandbox( ( "var typeof_window = typeof window;"+
                        "var typeof_Cc = typeof Components.classes;"
                      )
                    , sandbox, '1.8', '<test>', 1);

    strictEqual( sandbox.typeof_window
               , 'undefined'
               , 'typeof window'
               );
    strictEqual( sandbox.typeof_Cc
               , 'object'
               , 'typeof Component.classes'
               );
});

test('Components.utils.Sandbox() inject scope.', function () {
    var sandbox = make_sandbox();
    sandbox.window = window;
    sandbox.Components = {classes: ''};

    Cu.evalInSandbox( ( "var typeof_window = typeof window;"+
                        "var typeof_Cc = typeof Components.classes;"
                      )
                    , sandbox, '1.8', '<test>', 1);

    strictEqual( sandbox.typeof_window
               , 'object'
               , 'typeof window'
               );

    // We can't inject the components object.
    strictEqual( sandbox.typeof_Cc
               , 'object'
               , 'typeof Component.classes'
               );
});

test('Components.utils.Sandbox() extract exports.', function () {
    var sandbox = make_sandbox()
      , _exports = {}
      ;

    sandbox.exports = _exports;
    Cu.evalInSandbox( "exports.a = 1;"
                    , sandbox, '1.8', '<test>', 1);

    strictEqual( _exports.a
               , 1
               , 'exports.a'
               );
});

test('Components.utils.Sandbox() monkey patching.', function () {
    var sandbox_a = make_sandbox()
      , sandbox_b = make_sandbox()
      , _exports = {}
      ;

    sandbox_b.module = sandbox_a.exports = _exports;

    Cu.evalInSandbox( "exports.a = 1;"
                    , sandbox_a, '1.8', '<test>', 1);

    strictEqual( sandbox_a.exports.a
               , 1
               , 'before monkey patch'
               );

    Cu.evalInSandbox( "module.a = 2;"
                    , sandbox_b, '1.8', '<test>', 1);

    strictEqual( sandbox_a.exports.a
               , 2
               , 'after monkey patch'
               );
});

test('Components.utils.Sandbox() syntax error.', function () {
    var sandbox = make_sandbox();

    try {
        Cu.evalInSandbox( "var;"
                        , sandbox, '1.8', 'fabricated.js', 1);
        ok(false, 'Expected a raised error.');
    } catch (e) {
        strictEqual( e.name
                   , 'SyntaxError'
                   , 'Error name'
                   );
        strictEqual( e.message
                   , 'missing variable name'
                   , 'Error message'
                   );
        strictEqual( e.fileName
                   , 'fabricated.js'
                   , 'File name'
                   );
        strictEqual( e.lineNumber
                   , 1
                   , 'Line number.'
                   );
    }
});

test('Components.utils.Sandbox() thrown error.', function () {
    var sandbox = make_sandbox();

    try {
        Cu.evalInSandbox( "var foo = 1;\nthrow new Error('an error');"
                        , sandbox, '1.8', 'fabricated.js', 1);
        ok(false, 'Expected a raised error.');
    } catch (e) {
        strictEqual( e.name
                   , 'Error'
                   , 'Error name'
                   );
        strictEqual( e.message
                   , 'an error'
                   , 'Error message'
                   );
        strictEqual( e.fileName
                   , 'fabricated.js'
                   , 'File name'
                   );
        strictEqual( e.lineNumber
                   , 2
                   , 'Line number.'
                   );
    }
});

test('Components.utils.Sandbox() function error.', function () {
    var sandbox = make_sandbox();
    sandbox.exports = {};

    Cu.evalInSandbox( ( "exports.thrower = function () {"+
                        "throw new Error('in function'); }")
                    , sandbox, '1.8', 'fabricated.js', 1);

    try {
        sandbox.exports.thrower();
        ok(false, 'Expected a raised error.');
    } catch (e) {
        strictEqual( e.name
                   , 'Error'
                   , 'Error name'
                   );
        strictEqual( e.message
                   , 'in function'
                   , 'Error message'
                   );
        strictEqual( e.fileName
                   , 'fabricated.js'
                   , 'File name'
                   );
        strictEqual( e.lineNumber
                   , 1
                   , 'Line number.'
                   );
    }
});

test('Components.utils.Sandbox() module implementation.', function () {
    var sandbox = make_sandbox();

    Cu.evalInSandbox( "var exports = {};"
                    , sandbox, '1.8', '<string>', 1);
    Cu.evalInSandbox( "exports.a = 1;"
                    , sandbox, '1.8', 'module.js', 1);

    strictEqual(sandbox.exports.a, 1, 'Module exported.');
});

