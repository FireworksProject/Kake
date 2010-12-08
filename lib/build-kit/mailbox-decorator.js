(function(require, exports) {

// Implements our messaging protocol with the main build engine.
exports.mailbox_decorator = exports.mailboxDecorator = {
      observe: function (fn) {
          // Decodes the message
          return function (data) {
              // id = the project id (file path)
              // message = the message header (descriptive)
              // data = anything
              fn(data.id, data.message, data.data);
          };
      }
    , send: function (fn) {
          // Encodes the message
          return function (type, id, message, data) {
              fn(type, {id: id, message: message, data: data});
          };
      }
};

})
// Boilerplate to export this script in both a CommonJS complient environment
// and a browser environment with the `<script src="">` tag.
// However, JSLint does not like the way this function is invoked, and there are
// some ECMAScript5 strict mode violations too.
.apply({},

  typeof require === 'function' ?

  [require, exports] :

  [
    function (g) {
      return function (id) { return g['/'+ id]; };
    }(this /* A ECMAScript5 strict mode violation. */),

    this['/build-kit/mailbox-decorator'] = {} /* Another ECMAScript5 strict mode violation. */

  ]);

