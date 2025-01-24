(() => {
  'use strict';
  var e,
    v = {},
    g = {};
  function r(e) {
    var a = g[e];
    if (void 0 !== a) return a.exports;
    var t = (g[e] = { id: e, loaded: !1, exports: {} });
    return v[e].call(t.exports, t, t.exports, r), (t.loaded = !0), t.exports;
  }
  (r.m = v),
    (e = []),
    (r.O = (a, t, i, o) => {
      if (!t) {
        var n = 1 / 0;
        for (f = 0; f < e.length; f++) {
          for (var [t, i, o] = e[f], c = !0, l = 0; l < t.length; l++)
            (!1 & o || n >= o) && Object.keys(r.O).every((b) => r.O[b](t[l]))
              ? t.splice(l--, 1)
              : ((c = !1), o < n && (n = o));
          if (c) {
            e.splice(f--, 1);
            var d = i();
            void 0 !== d && (a = d);
          }
        }
        return a;
      }
      o = o || 0;
      for (var f = e.length; f > 0 && e[f - 1][2] > o; f--) e[f] = e[f - 1];
      e[f] = [t, i, o];
    }),
    (r.n = (e) => {
      var a = e && e.__esModule ? () => e.default : () => e;
      return r.d(a, { a }), a;
    }),
    (() => {
      var a,
        e = Object.getPrototypeOf
          ? (t) => Object.getPrototypeOf(t)
          : (t) => t.__proto__;
      r.t = function (t, i) {
        if (
          (1 & i && (t = this(t)),
          8 & i ||
            ('object' == typeof t &&
              t &&
              ((4 & i && t.__esModule) ||
                (16 & i && 'function' == typeof t.then))))
        )
          return t;
        var o = Object.create(null);
        r.r(o);
        var f = {};
        a = a || [null, e({}), e([]), e(e)];
        for (
          var n = 2 & i && t;
          'object' == typeof n && !~a.indexOf(n);
          n = e(n)
        )
          Object.getOwnPropertyNames(n).forEach((c) => (f[c] = () => t[c]));
        return (f.default = () => t), r.d(o, f), o;
      };
    })(),
    (r.d = (e, a) => {
      for (var t in a)
        r.o(a, t) &&
          !r.o(e, t) &&
          Object.defineProperty(e, t, { enumerable: !0, get: a[t] });
    }),
    (r.f = {}),
    (r.e = (e) =>
      Promise.all(Object.keys(r.f).reduce((a, t) => (r.f[t](e, a), a), []))),
    (r.u = (e) => e + '.js'),
    (r.miniCssF = (e) => {}),
    (r.o = (e, a) => Object.prototype.hasOwnProperty.call(e, a)),
    (() => {
      var e = {},
        a = 'client:';
      r.l = (t, i, o, f) => {
        if (e[t]) e[t].push(i);
        else {
          var n, c;
          if (void 0 !== o)
            for (
              var l = document.getElementsByTagName('script'), d = 0;
              d < l.length;
              d++
            ) {
              var u = l[d];
              if (
                u.getAttribute('src') == t ||
                u.getAttribute('data-webpack') == a + o
              ) {
                n = u;
                break;
              }
            }
          n ||
            ((c = !0),
            ((n = document.createElement('script')).type = 'module'),
            (n.charset = 'utf-8'),
            (n.timeout = 120),
            r.nc && n.setAttribute('nonce', r.nc),
            n.setAttribute('data-webpack', a + o),
            (n.src = r.tu(t))),
            (e[t] = [i]);
          var s = (h, b) => {
              (n.onerror = n.onload = null), clearTimeout(p);
              var _ = e[t];
              if (
                (delete e[t],
                n.parentNode && n.parentNode.removeChild(n),
                _ && _.forEach((y) => y(b)),
                h)
              )
                return h(b);
            },
            p = setTimeout(
              s.bind(null, void 0, { type: 'timeout', target: n }),
              12e4
            );
          (n.onerror = s.bind(null, n.onerror)),
            (n.onload = s.bind(null, n.onload)),
            c && document.head.appendChild(n);
        }
      };
    })(),
    (r.r = (e) => {
      typeof Symbol < 'u' &&
        Symbol.toStringTag &&
        Object.defineProperty(e, Symbol.toStringTag, { value: 'Module' }),
        Object.defineProperty(e, '__esModule', { value: !0 });
    }),
    (r.nmd = (e) => ((e.paths = []), e.children || (e.children = []), e)),
    (() => {
      var e;
      r.tt = () => (
        void 0 === e &&
          ((e = { createScriptURL: (a) => a }),
          typeof trustedTypes < 'u' &&
            trustedTypes.createPolicy &&
            (e = trustedTypes.createPolicy('angular#bundler', e))),
        e
      );
    })(),
    (r.tu = (e) => r.tt().createScriptURL(e)),
    (r.p = ''),
    (() => {
      var e = { runtime: 0 };
      (r.f.j = (i, o) => {
        var f = r.o(e, i) ? e[i] : void 0;
        if (0 !== f)
          if (f) o.push(f[2]);
          else if ('runtime' != i) {
            var n = new Promise((u, s) => (f = e[i] = [u, s]));
            o.push((f[2] = n));
            var c = r.p + r.u(i),
              l = new Error();
            r.l(
              c,
              (u) => {
                if (r.o(e, i) && (0 !== (f = e[i]) && (e[i] = void 0), f)) {
                  var s = u && ('load' === u.type ? 'missing' : u.type),
                    p = u && u.target && u.target.src;
                  (l.message =
                    'Loading chunk ' + i + ' failed.\n(' + s + ': ' + p + ')'),
                    (l.name = 'ChunkLoadError'),
                    (l.type = s),
                    (l.request = p),
                    f[1](l);
                }
              },
              'chunk-' + i,
              i
            );
          } else e[i] = 0;
      }),
        (r.O.j = (i) => 0 === e[i]);
      var a = (i, o) => {
          var l,
            d,
            [f, n, c] = o,
            u = 0;
          if (f.some((p) => 0 !== e[p])) {
            for (l in n) r.o(n, l) && (r.m[l] = n[l]);
            if (c) var s = c(r);
          }
          for (i && i(o); u < f.length; u++)
            r.o(e, (d = f[u])) && e[d] && e[d][0](), (e[d] = 0);
          return r.O(s);
        },
        t = (self.webpackChunkclient = self.webpackChunkclient || []);
      t.forEach(a.bind(null, 0)), (t.push = a.bind(null, t.push.bind(t)));
    })();
})();
