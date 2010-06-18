/*!
Copyright (c) 2010, Matthew Seeley
BSD Licensed: http://github.com/mseeley/dom/blob/master/LICENSE
      Source: git://github.com/mseeley/dom.git
*/
(function (global) {

      // Sub-expression           Index Description
      // ^([a-z][\w:\-]*)?            1 A node name, optional
      // (#[a-z][\w:\-\$\\]+)?        2 An ID, optional
      // (\.[a-z][\w:\-\$\\\.]+)?     3 Zero or more class names
      // (\[.+\])?                    4 Zero or more attributes
      // (\{[\S\s]+\})?$              5 A text child node, optional
      var EXPRESSION = /^([a-z][\w:\-]*)?(#[a-z][\w:\-\$\\]+)?(\.[a-z][\w:\-\$\\\.]+)?(\[.+\])?(\{[\S\s]+\})?$/i,

          // Translate tag attribute names to element properties names
          MAP_ATTRIBUTES = {
            cellpadding:"cellPadding", cellspacing:"cellSpacing", colspan:"colSpan",
            "for":"htmlFor", rowspan:"rowSpan", tabindex:"tabIndex"
          },

          // Limit global lookups
          DOCUMENT = global.document,
          NULL = null;

  /**
   * Replaces occurrences of '$' incrementer placeholders with numbers.
   * @method increment
   * @param {String} str
   * @param {Number} i
   * @return {String}
   * @static
   * @private
   */
  function increment (str, i) {
    return str.replace(/(\\)?(\$+)/g, function (a, b, c) {
      var power = c.length - 1,
          s = "";

      if (b == "\\") {
        power--;
        s = "$";
      }

      if (power > 0) {
        s += i + Math.pow(10, power);
      } else if (power === 0) {
        s += i + Math.floor(Math.pow(10, -1));
      } // else power is less than 1 because a == "\\$"

      return s;
    });
  }

  /**
   * Returns a reversed version of the input string.
   * @method reverse
   * @param {String} str
   * @return {String}
   * @static
   * @private
   */
  function reverse (str) {
    return str.split("").reverse().join("");
  }

  /**
   * Uses a meta data object to create a single text or element node.
   * @method makeNode
   * @param {Object} meta
   * @param {Number} idx
   * @return {Element}
   * @static
   * @private
   */
  function makeNode (meta, idx) {
    var attribs = meta.attributes,
        nodeName = meta.nodeName,
        text = meta.text,
        node,
        txtNode,
        i = 0;

    if (nodeName) {
      node = DOCUMENT.createElement(nodeName);

      if (meta.id) {
        node.id = increment(meta.id, idx);
      }

      if (meta.classNames.length) {
        node.className = increment(meta.classNames.join(" "), idx);
      }

      for (i; i < attribs.length; i++) {
        var attrib = attribs[i],
            attribName = attrib.name,
            attribValue = attrib.value != NULL ? increment(attrib.value, idx) : "";

        if (MAP_ATTRIBUTES[attribName]) {
          node[MAP_ATTRIBUTES[attribName]] = attribValue;
        } else if (attribName == "style") {
          node.style.cssText = attribValue;
        } else if (attribName.indexOf("on") > -1) {
          node[attribName] = new Function(attribValue);
        } else {
          node.setAttribute(attribName, attribValue);
        }
      }
    }

    if (text) {
      //FIXME: nodeName can be null
      if (/script/i.test(nodeName)) {
        node.text = text;
      } else if (/style/i.test(nodeName)) {
        if (node.textContent != NULL) {
          node.textContent = text;
        } else {
          node.styleSheet.cssText = text;
        }
      } else {
        txtNode = DOCUMENT.createTextNode(increment(text, idx));
        if (node) {
          node.appendChild(txtNode);
        }
      }
    }

    return node || txtNode || NULL;
  }

  /**
   * Uses expression meta data to create a document fragment.
   * @method makeFrag
   * @param {Object} meta
   * @param {Number} idx
   * @return {DocumentFragment}
   * @static
   * @private
   */
  function makeFrag (meta, idx) {
    var frag = DOCUMENT.createDocumentFragment(),
        node = makeNode(meta, idx),
        childNode;

    frag.appendChild(node);

    if (meta.child) {
      childNode = makeFrag(meta.child, 0);
      if (/select/i.test(node.nodeName) && /option/i.test(childNode.nodeName)) {
        node.options.add(childNode);
      } else {
        node.appendChild(childNode);
      }
    } else if (meta.adjacent) {
      frag.appendChild(makeFrag(meta.adjacent, 0));
    }

    if (meta.multiplier && ++idx < meta.multiplier) {
      frag.appendChild(makeFrag(meta, idx));
    }

    return frag;
  }

  /**
   * Parses an input string of attribute expressions, returns object
   * with attribute name/value pairs. Example input:
   * [type=radio][checked][onclick='alert(colors[i]);']
   * @method parseAttribs
   * @param {String} str
   * @return {Object}
   * @static
   * @private
   */
  function parseAttribs (str) {
    var attribs = [],
        cursor = 0,
        posLeft = 0,
        countLeft = 0,
        countRight = 0,
        attr,
        chr;

    while ((chr = str.charAt(cursor++))) {
      if (chr == "[" && ++countLeft == 1) {
          posLeft = cursor;
      } else if (chr == "]" && ++countRight == countLeft) {
          attr = str.substring(posLeft, cursor - 1).split("=");
          attribs.push({
            name: attr[0],
            value: attr[1] ? attr[1].replace(/^['"]|['"]$/g, "") : NULL
          });
          posLeft = countRight = countLeft = 0;
      }
    }

    return attribs;
  }

  /**
   * Uses regular expressions to isolate unique groups within a CSS
   * selector-like expression. Returns or die trying; returns a valid meta data
   * object or throws an error.
   * @method parseSubExps
   * @param {Array} exps
   * @return {Object}
   * @static
   * @private
   */
  function parseSubExps (exps) {

    var exp = exps.shift(),
        combinator = exp.combinator,
        expression = exp.expression,
        matches,
        meta = {
          adjacent: NULL, child: NULL,
          id: NULL, multiplier: NULL, nodeName: NULL,
          attributes: [], classNames: []
        };

    // Extract multiplier value and unescape other asterisks.  Must be done
    // before matching EXPRESSION.

    expression = expression.replace(/(\\)?(\*(.))/g, function (a, b, c, d) {
      if (b == "\\") {
        return c;
      } else if (meta.multiplier == NULL) {
        meta.multiplier = +d;
        return "";
      } else {
        throw "Too many multipliers: " + expression;
      }
    });

    matches = expression.match(EXPRESSION);

    if (!matches) {
      throw "Invalid sub expression: " + expression;
    }

    var nodeName = matches[1],
        id = matches[2],
        classNames = matches[3],
        attributes = matches[4],
        text = matches[5];

    if (nodeName) {
      meta.nodeName = nodeName;
    } else {
      if (id || classNames || attributes) {
        throw "Missing a node name: " + expression;
      }

      if (text && combinator == ">") {
        throw "Text nodes cannot have children: " + expression;
      }
    }

    if (id) {
      meta.id = id.substring(1);
    }

    if (classNames) {
      meta.classNames = classNames.substring(1).split(/\./);
    }

    if (attributes) {
      meta.attributes = parseAttribs(attributes);
    }

    if (text) {
      meta.text = text.replace(/^\{|\}$/g, "");
    }

    if (combinator == ">") {
      meta.child = parseSubExps(exps);
    } else if (combinator == "+") {
      meta.adjacent = parseSubExps(exps);
    }

    return meta;
  }

  /**
   * Separates combinator expressions into single (sub) expressions. Input
   * expression is parsed after being reversed; allows lookbehind emulation.
   * @method parseExp
   * @param {String} exp
   * @return {Object}
   * @static
   * @private
   */
  function parseExp (exp) {
    exp = reverse(exp);

    var matches = exp.split(/[>+](?!\\)/g),
        len = matches.length,
        cursor = exp.length,
        exps = [],
        match;

    while ((match = matches[--len])) {
      cursor -= match.length + 1;

      exps.push({
        combinator: exp.charAt(cursor) || NULL,
        expression: reverse(match.replace(/([>+])\\/g, "$1"))
      });
    }

    return parseSubExps(exps);
  }

// Expose public interface -----------------------------------------------------

  if (!global.dom) {
    global.dom = {};
  }

  var dom = global.dom;

  /**
   * Builds an document fragment from the expression input string.
   * @module dom
   * @method frag
   * @param  {String} expression
   * @return {DocumentFragment}
   * @static
   */
  dom.frag = function (exp) {
    return exp ? makeFrag(parseExp(exp), 0) : NULL;
  };

  /**
   * Builds an element from the expression input string.
   * @module dom
   * @method node
   * @param  {String} expression
   * @return {HtmlElement}
   * @static
   */
  dom.node = function (exp) {
    var node = NULL,
        meta;

    // Render children, ignore siblings
    if (exp) {
      meta = parseExp(exp);
      node = (meta.child) ? makeFrag(meta, 0).childNodes[0] : makeNode(meta, 0);
    }

    return node;
  };

})(this);
