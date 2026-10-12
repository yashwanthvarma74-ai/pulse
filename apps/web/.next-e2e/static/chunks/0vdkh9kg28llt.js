(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([
  'object' == typeof document ? document.currentScript : void 0,
  [
    14346,
    (e) => {
      var i = e.i(43476),
        s = e.i(60450),
        a = e.i(70684),
        t = e.i(32345),
        l = e.i(22016),
        n = e.i(48804);
      e.s([
        'f',
        0,
        function ({ children: e }) {
          let r = (0, n.U)();
          return r.isPending
            ? (0, i.jsx)(t.f, { height: '8rem', 'aria-busy': 'true' })
            : r.isError
              ? (0, i.jsx)(s.f, {
                  variant: 'danger',
                  title: 'Could not reach Pulse',
                  children: (0, i.jsx)(a.f, {
                    size: 'sm',
                    onClick: () => r.refetch(),
                    children: 'Try again',
                  }),
                })
              : r.data
                ? (0, i.jsx)(i.Fragment, { children: e(r.data) })
                : (0, i.jsx)(s.f, {
                    variant: 'info',
                    title: 'Sign in to continue',
                    children: (0, i.jsx)(l.default, {
                      href: '/',
                      children: 'Go to the start page',
                    }),
                  });
        },
      ]);
    },
    46213,
    (e) => {
      var i = e.i(43476),
        s = e.i(60450),
        a = e.i(70684),
        t = e.i(84294),
        l = e.i(45835),
        n = e.i(32345),
        r = e.i(33290),
        c = e.i(22016),
        d = e.i(48804),
        o = e.i(14346),
        u = e.i(72626);
      function h({ user: e }) {
        let a = (0, d.W)(),
          c = (0, d.k)(),
          { toast: o } = (0, r.f)();
        return (0, i.jsxs)('div', {
          className: u.default.page,
          children: [
            (0, i.jsx)('h1', { className: u.default.title, children: 'Settings' }),
            (0, i.jsxs)('section', {
              'aria-labelledby': 'privacy',
              className: u.default.section,
              children: [
                (0, i.jsx)('h2', {
                  id: 'privacy',
                  className: u.default.subtitle,
                  children: 'Privacy',
                }),
                (0, i.jsx)(t.f, {
                  label: 'Who can see your new posts',
                  description:
                    'Applies to posts you write outside a community. You can still change it for each post.',
                  children: (0, i.jsxs)(l.f, {
                    value: e.defaultVisibility,
                    disabled: a.isPending,
                    onChange: (e) =>
                      a.mutate(e.target.value, {
                        onSuccess: () => o({ title: 'Saved', variant: 'success', duration: 2e3 }),
                      }),
                    children: [
                      (0, i.jsx)('option', { value: 'public', children: 'Everyone' }),
                      (0, i.jsx)('option', { value: 'followers', children: 'Only my followers' }),
                    ],
                  }),
                }),
                a.isError && (0, i.jsx)(s.f, { variant: 'danger', children: a.error.message }),
              ],
            }),
            (0, i.jsxs)('section', {
              'aria-labelledby': 'blocked',
              className: u.default.section,
              children: [
                (0, i.jsx)('h2', {
                  id: 'blocked',
                  className: u.default.subtitle,
                  children: 'Blocked people',
                }),
                c.isPending && (0, i.jsx)(n.f, { height: '3rem', 'aria-busy': 'true' }),
                c.isError && (0, i.jsx)(s.f, { variant: 'danger', children: c.error.message }),
                c.data &&
                  0 === c.data.length &&
                  (0, i.jsx)('p', {
                    className: u.default.muted,
                    children: 'You have not blocked anyone.',
                  }),
                (0, i.jsx)('ul', {
                  className: u.default.list,
                  children: c.data?.map((e) =>
                    (0, i.jsx)(f, { handle: e.handle, name: e.name }, e.id),
                  ),
                }),
              ],
            }),
          ],
        });
      }
      function f({ handle: e, name: s }) {
        let { unblock: t } = (0, d.O)(e);
        return (0, i.jsxs)('li', {
          className: u.default.row,
          children: [
            (0, i.jsxs)('span', {
              children: [
                (0, i.jsx)(c.default, { href: `/u/${e}`, children: s }),
                ' ',
                (0, i.jsxs)('span', { className: u.default.muted, children: ['@', e] }),
              ],
            }),
            (0, i.jsx)(a.f, {
              size: 'sm',
              loading: t.isPending,
              onClick: () => t.mutate(),
              children: 'Unblock',
            }),
          ],
        });
      }
      e.s([
        'default',
        0,
        function () {
          return (0, i.jsx)(o.f, { children: (e) => (0, i.jsx)(h, { user: e }) });
        },
      ]);
    },
    60450,
    70684,
    32345,
    (e) => {
      var i = e.i(42667);
      e.s(['f', () => i.A], 60450);
      var s = e.i(66078);
      e.s(['f', () => s.B], 70684);
      var a = e.i(21143);
      e.s(['f', () => a.S], 32345);
    },
    84294,
    (e) => {
      var i = e.i(2675);
      e.s(['f', () => i.F]);
    },
    45835,
    (e) => {
      var i = e.i(97741);
      e.s(['f', () => i.S]);
    },
  ],
  72626,
  (e) => {
    e.v({
      list: 'qbHc2W_list',
      muted: 'qbHc2W_muted',
      page: 'qbHc2W_page',
      row: 'qbHc2W_row',
      section: 'qbHc2W_section',
      subtitle: 'qbHc2W_subtitle',
      title: 'qbHc2W_title',
    });
  },
]);
