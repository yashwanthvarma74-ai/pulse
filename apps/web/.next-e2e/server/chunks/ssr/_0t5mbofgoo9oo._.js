(() => {
  'use strict';
  module.exports = [
    31195,
    (a) => {
      var b = a.i(87924),
        c = a.i(37927),
        d = a.i(20698),
        e = a.i(50944),
        f = a.i(72131);
      a.i(9241);
      var g = a.i(86653),
        h = a.i(69844),
        i = a.i(21890);
      let j = (0, f.createContext)({ newPosts: 0, clearNewPosts: () => {} }),
        k = {
          mention: 'mentioned you in a post',
          reply: 'replied to your post',
          reaction: 'liked your post',
          follow: 'started following you',
        };
      a.s([
        'y',
        0,
        function ({ children: a }) {
          let { data: l } = (0, i.U)(),
            m = (0, c.d)(),
            n = (0, e.useRouter)(),
            { toast: o } = (0, d.f)(),
            [p, q] = (0, f.useState)(0),
            r = (0, f.useRef)(o);
          r.current = o;
          let s = l?.id;
          (0, f.useEffect)(() => {
            let a;
            if (!s) return;
            let b = null,
              c = 0,
              d = !1,
              e = () => {
                (((b = new WebSocket('ws://localhost:4101/ws')).onopen = () => {
                  (c > 0 && m.invalidateQueries({ queryKey: i.Z.unread }), (c = 0));
                }),
                  (b.onmessage = (a) => {
                    let b = g.e.safeParse(JSON.parse(String(a.data)));
                    if (!b.success) return;
                    let c = b.data;
                    if ('new_post' === c.type) return void q((a) => a + 1);
                    let { notification: d } = c;
                    ((0, h.n)({ notificationDeliveryMs: Math.max(0, Date.now() - c.emittedAt) }),
                      m.setQueryData(i.Z.unread, (a) => (a ?? 0) + 1),
                      m.invalidateQueries({ queryKey: i.Z.notifications }),
                      r.current({
                        title: `${d.actor.name} ${k[d.type]}`,
                        description: d.postText ?? void 0,
                        variant: 'info',
                        action: {
                          label: 'View',
                          onClick: () =>
                            n.push(d.postId ? `/p/${d.postId}` : `/u/${d.actor.handle}`),
                        },
                      }));
                  }),
                  (b.onclose = () => {
                    d || ((c += 1), (a = setTimeout(e, Math.min(3e4, 1e3 * 2 ** Math.min(c, 5)))));
                  }));
              };
            return (
              e(),
              () => {
                ((d = !0), clearTimeout(a), b?.close());
              }
            );
          }, [s, m, n]);
          let t = (0, f.useCallback)(() => q(0), []),
            u = (0, f.useMemo)(() => ({ newPosts: p, clearNewPosts: t }), [p, t]);
          return (0, b.jsx)(j.Provider, { value: u, children: a });
        },
        'u',
        0,
        () => (0, f.useContext)(j),
      ]);
    },
    46702,
    59039,
    (a) => {
      var b = a.i(87924),
        c = a.i(72131),
        d = a.i(29152),
        e = a.i(8520);
      function f({ value: a, defaultValue: b, onChange: d }) {
        let [e, g] = (0, c.useState)(b),
          h = void 0 !== a,
          i = h ? a : e,
          j = (0, c.useRef)({ current: i, isControlled: h, onChange: d });
        return (
          (j.current = { current: i, isControlled: h, onChange: d }),
          [
            i,
            (0, c.useCallback)((a) => {
              let { current: b, isControlled: c, onChange: d } = j.current,
                e = 'function' == typeof a ? a(b) : a;
              Object.is(e, b) || (c || g(e), d?.(e));
            }, []),
          ]
        );
      }
      a.s(['u', 0, f], 59039);
      let [g, h] = (0, e.c)('Tabs', 'Tabs part');
      function i({
        value: a,
        defaultValue: e = '',
        onValueChange: h,
        orientation: j = 'horizontal',
        activation: k = 'automatic',
        className: l,
        children: m,
        ...n
      }) {
        let o = (0, c.useId)(),
          [p, q] = f({ value: a, defaultValue: e, onChange: h });
        return (0, b.jsx)(g, {
          value: { baseId: o, value: p, select: q, orientation: j, activation: k },
          children: (0, b.jsx)('div', {
            className: (0, d.c)(
              'mrd_Tabs-module_root__-VKVI',
              'vertical' === j && 'mrd_Tabs-module_rootVertical__y-D6e',
              l,
            ),
            ...n,
            children: m,
          }),
        });
      }
      function j({ className: a, onKeyDown: e, ...f }) {
        let { orientation: g, activation: i, select: k } = h(),
          l = (0, c.useRef)(null);
        return (0, b.jsx)('div', {
          ref: l,
          role: 'tablist',
          'aria-orientation': g,
          className: (0, d.c)(
            'mrd_Tabs-module_list__qRVME',
            'vertical' === g && 'mrd_Tabs-module_listVertical__5wFTW',
            a,
          ),
          onKeyDown: (a) => {
            let b;
            if ((e?.(a), a.defaultPrevented)) return;
            let c = Array.from(l.current?.querySelectorAll('[role="tab"]:not(:disabled)') ?? []),
              d = c.findIndex((a) => a === document.activeElement);
            if (-1 === d) return;
            let f = 'horizontal' === g ? 'ArrowLeft' : 'ArrowUp',
              h = 'horizontal' === g ? 'ArrowRight' : 'ArrowDown';
            (a.key === h
              ? (b = c[(d + 1) % c.length])
              : a.key === f
                ? (b = c[(d - 1 + c.length) % c.length])
                : 'Home' === a.key
                  ? (b = c[0])
                  : 'End' === a.key && (b = c[c.length - 1]),
              b && (a.preventDefault(), b.focus(), 'automatic' === i && k(b.dataset.value ?? '')));
          },
          ...f,
        });
      }
      function k({ value: a, className: c, onClick: e, ...f }) {
        let { baseId: g, value: i, select: j } = h(),
          l = i === a;
        return (0, b.jsx)('button', {
          type: 'button',
          role: 'tab',
          id: `${g}-tab-${a}`,
          'aria-selected': l,
          'aria-controls': `${g}-panel-${a}`,
          tabIndex: l ? 0 : -1,
          'data-value': a,
          'data-state': l ? 'active' : 'inactive',
          className: (0, d.c)('mrd_Tabs-module_tab__IdDYc', c),
          onClick: (b) => {
            (e?.(b), j(a));
          },
          ...f,
        });
      }
      function l({ value: a, className: c, children: e, ...f }) {
        let { baseId: g, value: i } = h(),
          j = i === a;
        return (0, b.jsx)('div', {
          role: 'tabpanel',
          id: `${g}-panel-${a}`,
          'aria-labelledby': `${g}-tab-${a}`,
          hidden: !j,
          tabIndex: 0,
          className: (0, d.c)('mrd_Tabs-module_panel__08i9c', c),
          ...f,
          children: j ? e : null,
        });
      }
      ((i.List = j),
        (i.Tab = k),
        (i.Panel = l),
        a.s(['T', 0, i, 'a', 0, j, 'b', 0, l, 'c', 0, k], 46702));
    },
    89800,
    (a) => {
      var b = a.i(87924),
        c = a.i(29152);
      a.s([
        'V',
        0,
        function ({ className: a, ...d }) {
          return (0, b.jsx)('span', {
            className: (0, c.c)('mrd_VisuallyHidden-module_hidden__k7p-e', a),
            ...d,
          });
        },
      ]);
    },
  ];
})();

//# sourceMappingURL=_0t5mbofgoo9oo._.js.map
