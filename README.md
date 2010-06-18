dom - toys for manipulating HTML DOMS
=====================================

    object dom

      CssList           css(HtmlElement node)
      DocumentFragment  frag(String expression);
      Node              node(String expression); // Element or Text nodes only

Source: git://github.com/mseeley/dom.git
[Unit tests](http://github.com/mseeley/dom/blob/master/src-test/)
[BSD Licensed](http://github.com/mseeley/dom/tree/master/LICENSE)

dom.css
=======

This module supports adding, removing, toggling, and checking availability of CSS class name tokens on an HTML element. dom.css returns instances of the private CssList class.  CssList, an Array-like object, is modeled after the DomSettableTokenList and bound to a single HTML element.

CssList provides an interesting syntax for manipulating className tokens. Though, it doesn't beat the performance of simple procedural functions.

    Interface CssList

      HtmlElement node
      Number      length

      CssList     add(String token[,... ,tokenN])
      Boolean     has(String token)
      String      item(Number index)
      CssList     remove(String token[,... ,tokenN])
      CssList     replace(String oldToken, String newToken)
      CssList     toggle(String token[,... ,tokenN])
      String      toString()
      String      value(String val)

dom.frag and dom.node
=====================

The dom.frag and dom.node modules provide shorthand object creation through a CSS selector-like expression syntax.  Inspired by [Vadim Makeev](http://pepelsbey.net/2009/04/zen-coding-concept/) and [Sergey Chikuyonok](http://www.smashingmagazine.com/2009/11/21/zen-coding-a-new-way-to-write-html-code/).

- Creates document fragments and element or text nodes using terse CSS selector like expressions.
- Normalizes api deltas experienced when creating script, style, and option elements.
- Asterisk character may be used to create multiple nodes with same expression.
- Dollar sign characters are substituted with an incremented numeric value.
- Descriptive errors raised to aide in debugging expressions.
- Supports IE6+, Firefox 2+, Safari 3.2.1+, Opera 9.6+, Chrome 5+.
- Less than 2.7 KB compressed; 1.35 KB after gzip.

###Expression syntax

Expressions are CSS selector-like strings used to construct elements. While expressions share most identifier formatting with CSS selectors other expression grammar is different than a CSS selector. Expression identifiers are ordered, left to right, as node name, ID, class names attributes, and text content. A simple expression may look like: div#myId.myCss

###Identifiers

Indentifiers are expected to be formatted following specific guidelines. Node name, ID, and class name identifiers must begin with a letter ([A-Za-z]) and may be followed by letters (A-Za-z), digits (0-9), hyphens ("-"), underscores ("_") and colons (":"). Attribute identifiers start and end with a square brackets ([]). While text content identifiers start and end with curly braces ({}).

###Chaining expressions

Simple expressions can be chained using combinator characters. Adjacent sibling ("+") and child (">") combinators are supported. Plus and greater-than signs are ignored when preceeded by two backslashes. Common uses for combinators include:

    ul>li

    <ul>
      <li></li>
    </ul>

    p+p

    <p></p>
    <p></p>

###Modifiers

Expression repetition or identifier values may be altered using multiplier and incrementer modifier characters. A multiplier modifier is an asterisk ("*") followed by one or more digits (0-9). An incrementer modifier is one or more dollar signs ("$"). Asterisk and dollar sign characters will be ignored when escaped by two backslashes. The multiplier should be placed after an identifier; while incrementers may appear anywhere in the expression. A typical usage may look like this:

    ul>li*3{Item $}

    <ul>
      <li>Item 0</li>
      <li>Item 1</li>
      <li>Item 2</li>
    </ul>

###Heads up

- No need to quote most attribute values
- Dots in ID identifiers are not supported
- Node names do not support incrementers, only multipliers
- Whitespace is only permitted in text content
- Inserting style elements containing @import directives is not supported in IE
- Appending children to normally empty (void) elements is allowed

---

[BSD Licensed](http://github.com/mseeley/dom/tree/master/LICENSE)

&copy; Matthew Seeley 2010
