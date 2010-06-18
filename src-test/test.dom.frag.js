(function () {

  var frag = dom.frag,
      node = dom.node,
      body = document.body,
      head = document.getElementsByTagName("head")[0];

  // Node tests ------------------------------------------------------------------

  var nodeTests = {
    "node:div": function () {
      return node("div").nodeName == "DIV";
    },
    "node:div#myId": function () {
      return node("div#myId").id == "myId";
    },
    "node:div.classA.classB": function () {
      return node("div.classA.classB").className == "classA classB";
    },
    "node:input[type=checkbox][checked]": function () {
      var o = node("input[type=checkbox][checked]");
      return o.getAttribute("checked") !== undefined && o.getAttribute("type") == "checkbox";
    },
    "node:p{Hello world}": function () {
      return node("p{Hello world}").innerHTML == "Hello world";
    },
    "node:{Hello world}": function () {
      var o = node("{Hello world}");
      return o.nodeType == 3 && o.nodeValue == "Hello world";
    }
  };

  // Combinator tests ------------------------------------------------------------

  var combTests = {
    "comb:div>div": function () {
      var o = node("div>div");
      return o.childNodes.length == 1 && o.firstChild.nodeName == "DIV";
    },
    "comb:div+div": function () {
      return node("div+div").nextSibling === null;
    },
    "comb:code{2 \\+ 1 \\> 1 == true;}": function () {
      return node("code{2 \\+ 1 \\> 1 == true;}").innerHTML = "2 + 1 > 1 == true;";
    },
    "comb:div": function () {
      var o = frag("div");
      return o.firstChild.nodeName == "DIV" && o.childNodes.length == 1;
    },
    "comb:ul>li+li": function () {
      var o = frag("ul>li+li");
      return o.firstChild.nodeName == "UL" && o.firstChild.childNodes.length == 2;
    },
    "comb:p+p": function () {
      return frag("p+p").childNodes.length == 2;
    }
  };

  // Multiplier tests ------------------------------------------------------------

  var multTests = {
    "mult:ul>li*5": function () {
      return node("ul>li*5").childNodes.length == 5;
    },
    "mult:code{9 \\* 9 == 81;}": function () {
      return node("code{9 \\* 9 == 81;}").innerHTML = "9 * 9 = 81;"
    },
    "mult:ul*2>li*2": function () {
      var o = frag("ul*2>li*2");
      return o.childNodes.length == 2 &&
             o.childNodes[0].childNodes.length == 2 &&
             o.childNodes[1].childNodes.length == 2;
    }
  };

  // Incrementer tests -----------------------------------------------------------

  var incrTests = {
    "incr:ol>li{$}*2": function () {
      var o = node("ol>li{$}*2");
      return o.childNodes.length == 2 &&
             o.childNodes[0].innerHTML == "0",
             o.childNodes[1].innerHTML == "1";
    },
    "incr:p{Cost: \\$2.00}": function () {
      return node("p{Cost: \\$2.00}").innerHTML == "Cost: $2.00";
    }
  };

  // Edge cases ------------------------------------------------------------------

  var edgeTests = {
    "edge:onclick": function (del) {
      var a = node("a[href=javascript:void(0);][onclick=return 1;]");
      body.appendChild(a);
      if (a.onclick) {
        a.onclick = del(a.onclick);
        a.onclick();
      }
    },
    "edge: inline script": function () {
      var o = node("script{testName='edge:script';}");
      body.appendChild(o);
      return testName == 'edge:script';
    },
    "edge: external script": function (del) {
      var o = node("script[src=fixtures/empty.js]"),
          delegate = del(function () { return true; });

      // IE and the onload lie
      if ("onreadystatechange" in o) {
        o.onreadystatechange = function () {
          if (this.readyState == "complete" || this.readyState == "loaded") {
            delegate();
            this.onreadystatechange = null;
          }
        }
      } else {
        o.onload = delegate;
      }

      body.appendChild(o);
    },
    "edge:select": function () {
      return node("select>option{Item $}*2").childNodes.length == 2;
    },
    "edge:style": function () {
      // Append to head for Safari 3 compat
      var len = document.styleSheets.length;
      head.appendChild(node("style[type=text/css]{em:font-style:italic;}"));
      return document.styleSheets.length == len + 1;
    },
    "edge:link": function (del) {
      // Append to head for Safari 3 compat
      var len = document.styleSheets.length;
      head.appendChild(node("link[rel=stylesheet][type=text/css][href=fixtures/empty.css]"));

      // No reliable onload event xbrowser
      setTimeout(del(function () {
        return document.styleSheets.length == len + 1;
      }), 500);
    }
  };

  kaze.tests(nodeTests, combTests, multTests, incrTests, edgeTests);

})();
