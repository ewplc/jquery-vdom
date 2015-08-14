(function($) {

  var nextTick = window.requestAnimationFrame
  || window.webkitRequestAnimationFrame
  || window.mozRequestAnimationFrame
  || window.msRequestAnimationFrame
  || function(cb) { return window.setTimeout(cb, 0); };

  function defer(cb) {
    var args = [];
    if (arguments.length > 1) {
      args = Array.prototype.slice.call(arguments);
      args.shift();
    }

    var boundCb = (function(cb, args) {
      return function() {
        // console.log('calling', cb, 'with', args);
        cb.apply(this, args);
      }
    })(cb, args);

    nextTick.call(window, boundCb);
  }

  /*
   * {
   *    tag: 'table',
   *    children: [
   *      {
   *        tag: 'tr',
   *        attributes: {
   *          class: ['test'],
   *          id: 'test'
   *        },
   *        content: 'test'
   *      }
   *    ]
   * }
   */

  function createElement(def) {
    var el = $(def.tag);

    if (def.attributes) {
      $.each(def.attributes, function (key, value) {
        el.attr(key, value);
      });
    }

    if (def.children) {
      $.each(def.children, function (i, child) {
        el.append(createElement(child));
      });
    }

    if (def.content) {
      el.text(def.content);
    }
  }

  function apply(el, def, parent) {
    el = $(el);
    if (!el) {
      return defer(function(def, parent) {
        parent.append(createElement(def));
      }, def, parent);
    }

    if (!def) {
      return defer(function(el) {
        el.remove();
      }, el);
    }

    if (!el.is(def.tag)) {
      return defer(function(el, def) {
        el.replaceWith(createElement(def));
      }, el, def);
    }

    if (def.attributes) {
      $.each(def.attributes, function (key, value) {
        defer(function(el, key, value) {
          el.attr(key, value);
        }, el, key, value);
      });
    }

    if (def.children && $.isArray(def.children)) {
      var domChildren = $(el).children(),
          i = 0,
          // loop until whichever is longer:
          l = Math.max(def.children.length, domChildren.length);
      for (; i < l; i++) {
        var workingDef = def.children[i],
            workingEl = $(domChildren.get(i));

        apply(workingEl, workingDef, el);
      }
    }

    if (def.content) {
      if (el.text() !== def.content) {
        defer(function (e, c) {
          e.text(c);
        }, el, def.content);
      }
    }
  }

  /**
   *
   * @param def
   * @returns {*}
   */
  $.fn.applyVDom = function(def) {
    return this.each(function() {
      apply($(this), def);
    });
  }



})(jQuery);