(function () {

  var err = "Invalid input";

  function div (css) {
    var el = document.createElement("div");
    if (css)
      el.className = css;
    return el;
  }

  var desc = {

    "css: construct, has classes": function () {
      var el = div("a b c");
      return dom.css(el).length == 3;
    },

    "css: construct, no classes": function () {
      var el = div();
      return dom.css(el).length == 0;
    },

    "css: construct, input error": function () {
      try {
        dom.css();
      } catch (ex) {
        return (ex.message || ex.description) == err;
      }
      return false;
    },

    "css: add": function () {
      var el = div(),
          csslist = dom.css(el).add("selected");

      return typeof csslist == "object" && csslist.node.className == "selected";
    },

    "css: add, multiple": function () {
      var el = div(),
          csslist = dom.css(el).add("foo", "bar");

      return typeof csslist == "object" && csslist.node.className == "foo bar";
    },

    "css: add, empty string input error": function () {
      try {
        dom.css(div()).add("");
      } catch (ex) {
        return (ex.message || ex.description) == err;
      }
      return false;
    },

    "css: add, whitespace input error": function () {
      try {
        dom.css(div()).add("a b");
      } catch (ex) {
        return (ex.message || ex.description) == err;
      }
      return false;
    },

    "css: has": function () {
      var css = "a",
          el = div(css);

      return dom.css(el).has(css);
    },

    "css: has, not found": function () {
      var el = div("a");

      return !dom.css(el).has("b");
    },

    "css: item": function () {
      var el = div("a b c"),
          csslist = dom.css(el);

      return csslist.item(1) == "b";
    },

    "css: item, not found": function () {
      var el = div("a b c"),
          csslist = dom.css(el);

      return csslist.item(100) === null && csslist.item(-100) === null;
    },

    "css: remove": function () {
      var el = div("a b c"),
          csslist = dom.css(el).remove("a");

      return typeof csslist == "object" && csslist.node.className == "b c";
    },

    "css: remove, multiple": function () {
      var el = div("a b c"),
          csslist = dom.css(el).remove("a", "b");

      return typeof csslist == "object" && csslist.node.className == "c";
    },

    "css: remove, empty string input error": function () {
      try {
        dom.css(div()).remove("");
      } catch (ex) {
        return (ex.message || ex.description) == err;
      }
      return false;
    },

    "css: remove, whitespace input error": function () {
      try {
        dom.css(div("a b")).remove("a b");
      } catch (ex) {
        return (ex.message || ex.description) == err;
      }
      return false;
    },

    "css: replace": function () {
      var el = div("a b d"),
          csslist = dom.css(el).replace("d", "c");

      return typeof csslist == "object" && csslist.node.className == "a b c";
    },

    "css: replace, empty string input error": function () {
      try {
        dom.css(div()).replace("", "c");
      } catch (ex) {
        return (ex.message || ex.description) == err;
      }
      return false;
    },

    "css: replace, whitespace input error": function () {
      try {
        dom.css(div()).replace("a", " b");
      } catch (ex) {
        return (ex.message || ex.description) == err;
      }
      return false;
    },

    "css: toggle": function () {
      var csslist = dom.css(div()).toggle("enabled"),
          r1 = typeof csslist == "object" && csslist.node.className == "enabled";

      csslist.toggle("enabled");

      return r1 && csslist.node.className == "";
    },

    "css: toggle, multiple": function () {
      var csslist = dom.css(div()).toggle("enabled"),
          r1 = typeof csslist == "object" && csslist.node.className == "enabled";

      csslist.toggle("enabled", "error");

      return r1 && csslist.node.className == "error";
    },

    "css: toggle, empty string input error": function () {
      try {
        dom.css(div()).toggle("");
      } catch (ex) {
        return (ex.message || ex.description) == err;
      }
      return false;
    },

    "css: toggle, whitespace input error": function () {
      try {
        dom.css(div()).toggle("a b");
      } catch (ex) {
        return (ex.message || ex.description) == err;
      }
      return false;
    },

    "css: toString": function () {
      return dom.css(div("a b c")) == "a b c";
    },

    "css: value": function () {
      // Test setter and getter behavior
      var csslist = dom.css(div("a b")),
          r1 = csslist.value() == "a b";

      csslist.value("d e f g");

      return r1 && csslist.length == 4 && csslist.node.className == "d e f g";
    }
  };

  kaze.tests(desc);

})();

(function () {

  var el = document.createElement("div"),
      token = "blue",
      expected = "red green";

  el.className = "red blue green";


  var removeClassSpeedTests = {

    "speed:string.replace": function () {
      var div = el.cloneNode(false),
          before = div.className,
          re = new RegExp("(^|\\s)" + token + "(\\s|$)"),
          after = before.replace(re, " ");

      if (before !== after) {
        div.className = after;
      }

      return after == expected;
    },

    "speed:split,slice,join": function () {
      var div = el.cloneNode(false),
          items = div.className.split(/\s+/g),
          count = items.length,
          item,
          after;

      while (count--) {
        if (items[count] == token) {
          items.splice(count, 1);
          break;
        }
      }

      after = items.join(" ");
      div.className = after;
      return after == expected;
    },

    "speed:CSSTokenList#remove": function () {
      var div = el.cloneNode(false),
          ctl = dom.css(div).remove(token);
      return ctl == expected && div.className == expected;
    }
  };

  // Compare speed of regexp, vs array manipulation, vs CssList. Not included
  // in unit tests by default.
  //kaze.tests(removeClassSpeedTests);

})();
