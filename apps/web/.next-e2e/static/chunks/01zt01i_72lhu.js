(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([
  'object' == typeof document ? document.currentScript : void 0,
  [
    83009,
    (e) => {
      var i = e.i(43476),
        a = e.i(60450),
        t = e.i(17738),
        r = e.i(70684),
        s = e.i(85273),
        n = e.i(525),
        l = e.i(66264),
        l = l,
        d = l,
        u = l,
        c = e.i(84294),
        o = e.i(69798),
        f = e.i(32345),
        m = e.i(98124),
        h = e.i(22016),
        j = e.i(18566),
        x = e.i(71645);
      e.i(24856);
      var g = e.i(21138),
        v = e.i(48804),
        b = e.i(14346),
        p = e.i(64584);
      function y() {
        let e = (0, v.l)(),
          b = (0, v.N)(),
          y = (0, j.useRouter)(),
          [W, C] = (0, x.useState)(''),
          [E, N] = (0, x.useState)('');
        return (0, i.jsxs)('div', {
          className: p.default.page,
          children: [
            (0, i.jsx)('h1', { className: p.default.title, children: 'Communities' }),
            e.isPending && (0, i.jsx)(f.f, { height: '10rem', 'aria-busy': 'true' }),
            e.isError && (0, i.jsx)(a.f, { variant: 'danger', children: e.error.message }),
            e.data &&
              (0, i.jsx)('ul', {
                className: p.default.list,
                children: e.data.map((e) =>
                  (0, i.jsx)(
                    'li',
                    {
                      children: (0, i.jsxs)(s.f, {
                        children: [
                          (0, i.jsxs)(d.d, {
                            children: [
                              (0, i.jsx)(u.e, {
                                children: (0, i.jsx)(h.default, {
                                  href: `/c/${e.slug}`,
                                  children: e.name,
                                }),
                              }),
                              (0, i.jsx)(l.b, { children: e.description || 'No description yet.' }),
                            ],
                          }),
                          (0, i.jsxs)(n.f, {
                            className: p.default.meta,
                            children: [
                              (0, i.jsxs)(t.f, {
                                variant: 'neutral',
                                children: [
                                  e.memberCount,
                                  ' ',
                                  1 === e.memberCount ? 'member' : 'members',
                                ],
                              }),
                              e.joined &&
                                (0, i.jsx)(t.f, { variant: 'accent', children: 'Joined' }),
                            ],
                          }),
                        ],
                      }),
                    },
                    e.id,
                  ),
                ),
              }),
            (0, i.jsxs)('form', {
              className: p.default.form,
              onSubmit: function (e) {
                (e.preventDefault(),
                  b.mutate(
                    { name: W, description: E },
                    { onSuccess: (e) => y.push(`/c/${e.slug}`) },
                  ));
              },
              'aria-labelledby': 'new-community',
              children: [
                (0, i.jsx)('h2', {
                  id: 'new-community',
                  className: p.default.subtitle,
                  children: 'Start a community',
                }),
                (0, i.jsx)(c.f, {
                  label: 'Name',
                  children: (0, i.jsx)(o.f, {
                    value: W,
                    maxLength: g.e,
                    onChange: (e) => C(e.target.value),
                  }),
                }),
                (0, i.jsx)(c.f, {
                  label: 'Description (optional)',
                  children: (0, i.jsx)(m.f, {
                    rows: 2,
                    maxLength: g.o,
                    value: E,
                    onChange: (e) => N(e.target.value),
                  }),
                }),
                b.isError && (0, i.jsx)(a.f, { variant: 'danger', children: b.error.message }),
                (0, i.jsx)('div', {
                  children: (0, i.jsx)(r.f, {
                    type: 'submit',
                    variant: 'primary',
                    loading: b.isPending,
                    disabled: W.trim().length < 3,
                    children: 'Create community',
                  }),
                }),
              ],
            }),
          ],
        });
      }
      e.s(
        [
          'default',
          0,
          function () {
            return (0, i.jsx)(b.f, { children: () => (0, i.jsx)(y, {}) });
          },
        ],
        83009,
      );
    },
    14346,
    (e) => {
      var i = e.i(43476),
        a = e.i(60450),
        t = e.i(70684),
        r = e.i(32345),
        s = e.i(22016),
        n = e.i(48804);
      e.s([
        'f',
        0,
        function ({ children: e }) {
          let l = (0, n.U)();
          return l.isPending
            ? (0, i.jsx)(r.f, { height: '8rem', 'aria-busy': 'true' })
            : l.isError
              ? (0, i.jsx)(a.f, {
                  variant: 'danger',
                  title: 'Could not reach Pulse',
                  children: (0, i.jsx)(t.f, {
                    size: 'sm',
                    onClick: () => l.refetch(),
                    children: 'Try again',
                  }),
                })
              : l.data
                ? (0, i.jsx)(i.Fragment, { children: e(l.data) })
                : (0, i.jsx)(a.f, {
                    variant: 'info',
                    title: 'Sign in to continue',
                    children: (0, i.jsx)(s.default, {
                      href: '/',
                      children: 'Go to the start page',
                    }),
                  });
        },
      ]);
    },
    60450,
    70684,
    32345,
    (e) => {
      var i = e.i(42667);
      e.s(['f', () => i.A], 60450);
      var a = e.i(66078);
      e.s(['f', () => a.B], 70684);
      var t = e.i(21143);
      e.s(['f', () => t.S], 32345);
    },
    85273,
    525,
    (e) => {
      var i = e.i(66264);
      (e.s(['f', () => i.C], 85273), e.s(['f', () => i.a], 525));
    },
    84294,
    (e) => {
      var i = e.i(2675);
      e.s(['f', () => i.F]);
    },
    69798,
    (e) => {
      var i = e.i(32925);
      e.s(['f', () => i.I]);
    },
    98124,
    (e) => {
      var i = e.i(58744);
      e.s(['f', () => i.T]);
    },
  ],
  64584,
  (e) => {
    e.v({
      form: 'EFJuWW_form',
      list: 'EFJuWW_list',
      meta: 'EFJuWW_meta',
      page: 'EFJuWW_page',
      subtitle: 'EFJuWW_subtitle',
      title: 'EFJuWW_title',
    });
  },
]);
