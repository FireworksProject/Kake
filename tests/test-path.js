var path = require('future/path');

exports.constructor_with_new = function (test) {
    var p = new path.Path();
    test.assert(p instanceof path.Path, 'new path.Path() is instanceof path.Path');
};
