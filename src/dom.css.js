/*!
Copyright (c) 2010, Matthew Seeley
BSD Licensed: http://github.com/mseeley/dom/blob/master/LICENSE
      Source: git://github.com/mseeley/dom.git
*/
(function (global) {

  var proto = Array.prototype,
      push = proto.push,
      splice = proto.splice,
      err = "Invalid input",
      invalid = /\s|^$/,
      ws = /\s+/g;

  function indexOf (list, value) {
    indexOf = proto.indexOf ?
      function (list, value) {
        return proto.indexOf.call(list, value);
      }:
      function (list, value) {
        var i = list.length;
        while (i-- && list[i] != value) {}
        return i;
      };

    return indexOf(list, value);
  }

  /**
   * CssList is an Array-like object modeled after DOMTSettableTokenList.
   * Changes return types and argument quantities. See:
   * http://www.whatwg.org/specs/web-apps/current-work/#domsettabletokenlist
   * @class CssList
   * @param {HtmlElement} el
   * @constructor
   * @private
   */
  function CssList (el) {
    if (!el) {
      throw new Error(err);
    }

    var className = el.className;

    if (className) {
      push.apply(this, className.split(ws));
    }

    this.node = el;
  }

  CssList.prototype = {
    /**
     * @property node
     * @type HtmlElement
     */
    node: null,

    /**
     * @property length
     * @type Number
     */
    length: 0,

    /**
     * Adds one or more tokens to the node's className property.
     * @param {String} token One or more token arguments
     * @method add
     * @return {CssList} this
     */
    add: function () {
      var args = arguments,
          len = args.length,
          i = 0,
          token;

      for (i; i < len; i++) {
        token = args[i];

        if (invalid.test(token)) {
          throw new Error(err);
        }

        if (indexOf(this, token) < 0) {
          push.call(this, token);
        }
      }

      this.node.className = this.toString();

      return this;
    },

    /**
     * Returns true of false if the token argument is a className on the
     * node property.
     * @param {String} token
     * @method has
     * @return {Boolean}
     */
    has: function (token) {
      return indexOf(this, token) >= 0;
    },

    /**
     * Returns the token or null found at the argument index.
     * @param {Number} idx
     * @method item
     * @return {String} Or null.
     */
    item: function (idx) {
      return (idx < this.length && idx >= 0) ? this[idx] : null;
    },

    /**
     * Removes one or more tokens from the the node's className property.
     * @param {String} token One or more token arguments
     * @method remove
     * @return {CssList} this
     */
    remove: function () {
      var args = arguments,
          len = args.length,
          i = 0,
          token,
          idx;

      for (i; i < len; i++) {
        token = args[i];

        if (invalid.test(token)) {
          throw new Error(err);
        }

        idx = indexOf(this, token);

        if (idx >= 0) {
          splice.call(this, idx, 1);
        }
      }

      this.node.className = this.toString();

      return this;
    },

    /**
     * Replaces an old token with a new token in the node's className property.
     * @param {String} oldToken
     * @param {String} newToken
     * @method replace
     * @return {CssList} this
     */
    replace: function (oldToken, newToken) {
      if (invalid.test(oldToken) || invalid.test(newToken)) {
        throw new Error(err);
      }

      var idx = indexOf(this, oldToken);

      if (idx >= 0) {
        splice.call(this, idx, 1, newToken);
        this.node.className = this.toString();
      }

      return this;
    },

    /**
     * Adds or removes tokens from the nodes' className property.
     * @param {String} token One or more token arguments
     * @method toggle
     * @return {CssList} this
     */
    toggle: function () {
      var args = arguments,
          len = args.length,
          i = 0,
          token;

      for (i; i < len; i++) {
        token = args[i];
        if (invalid.test(token)) {
          throw new Error(err);
        }
        this[indexOf(this, token) >= 0 ? "remove" : "add"](token);
      }

      this.node.className = this.toString();

      return this;
    },

    /**
     * Returns the value token values managed by this instance.
     * @method toString
     * @return {String}
     */
    toString: function () {
      return proto.join.call(this, " ");
    },

    /**
     * Sets or gets the underlying value.
     * @method value
     * @return {String}
     */
    value: function (s) {
      if (arguments.length == 1) {
        var i = this.length;
        while (i--) {
          this[i] = undefined;
        }
        this.length = 0;
        push.apply(this, s.split(ws));
        this.node.className = s;
      }

      return this.toString();
    }
  };

// Expose public interface -----------------------------------------------------

  if (!global.dom) {
    global.dom = {};
  }

  /**
   * Simplified interface for creating CssList instances.
   * @module dom
   * @param {HtmlElement} el
   * @method css
   * @return {CssList}
   * @static
   */
  global.dom.css = function (el) {
    return new CssList(el);
  };

})(this);
