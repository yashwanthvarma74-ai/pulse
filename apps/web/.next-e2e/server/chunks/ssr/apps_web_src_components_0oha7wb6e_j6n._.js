module.exports = [
  75336,
  (a) => {
    a.v({
      accounts: '_h9jzq_accounts',
      action: '_h9jzq_action',
      demo: '_h9jzq_demo',
      landing: '_h9jzq_landing',
      note: '_h9jzq_note',
      pitch: '_h9jzq_pitch',
      role: '_h9jzq_role',
      subtitle: '_h9jzq_subtitle',
      title: '_h9jzq_title',
    });
  },
  12712,
  (a) => {
    a.v({ pill: 'W0WXcG_pill', wrap: 'W0WXcG_wrap' });
  },
  55967,
  (a) => {
    a.v({ errorText: 'z-qjHq_errorText', panel: 'z-qjHq_panel', stack: 'z-qjHq_stack' });
  },
  15424,
  (a) => {
    'use strict';
    var b = a.i(87924),
      c = a.i(37927),
      d = a.i(90985),
      e = a.i(87436),
      f = a.i(64572),
      g = a.i(46702),
      g = g,
      h = g,
      i = g,
      j = g,
      k = a.i(89800),
      k = k,
      l = a.i(72131),
      m = a.i(21890),
      n = a.i(31195),
      o = a.i(82530),
      p = a.i(11970),
      q = a.i(75336);
    function r() {
      let a = (0, m.d)(),
        c = (0, m.T)(),
        f = (0, m.s)(),
        g = a.error ?? c.error;
      return (0, b.jsxs)('section', {
        className: q.default.landing,
        'aria-labelledby': 'landing-title',
        children: [
          (0, b.jsx)('h1', { id: 'landing-title', className: q.default.title, children: 'Pulse' }),
          (0, b.jsx)('p', {
            className: q.default.pitch,
            children:
              'A social feed and communities app that stays fast, correct and private as it grows.',
          }),
          (0, b.jsxs)('div', {
            className: q.default.action,
            children: [
              (0, b.jsx)(e.f, {
                variant: 'primary',
                size: 'lg',
                loading: a.isPending,
                onClick: () => a.mutate(),
                children: 'Continue as guest',
              }),
              (0, b.jsx)('p', {
                className: q.default.note,
                children:
                  'No sign up. You get a temporary account that already follows a few people.',
              }),
            ],
          }),
          g &&
            (0, b.jsx)(d.f, { variant: 'danger', title: 'Could not sign in', children: g.message }),
          (f.data?.length ?? 0) > 0 &&
            (0, b.jsxs)('div', {
              className: q.default.demo,
              children: [
                (0, b.jsx)('h2', {
                  className: q.default.subtitle,
                  children: 'Or try a demo account',
                }),
                (0, b.jsx)('p', {
                  className: q.default.note,
                  children:
                    'Each one is set up differently. Publish from one and open another to see who sees what.',
                }),
                (0, b.jsx)('ul', {
                  className: q.default.accounts,
                  children: f.data?.map((a) =>
                    (0, b.jsxs)(
                      'li',
                      {
                        children: [
                          (0, b.jsx)(e.f, {
                            variant: 'secondary',
                            size: 'sm',
                            loading: c.isPending && c.variables === a.handle,
                            onClick: () => c.mutate(a.handle),
                            children: a.name,
                          }),
                          (0, b.jsx)('span', { className: q.default.role, children: a.role }),
                        ],
                      },
                      a.handle,
                    ),
                  ),
                }),
              ],
            }),
        ],
      });
    }
    var s = a.i(12712);
    function t({ count: a, onShow: c }) {
      return (0, b.jsx)('div', {
        className: s.default.wrap,
        role: 'status',
        children:
          a > 0 &&
          (0, b.jsx)(e.f, {
            variant: 'primary',
            size: 'sm',
            className: s.default.pill,
            onClick: c,
            children: 1 === a ? '1 new post' : `${a} new posts`,
          }),
      });
    }
    var u = a.i(55967);
    let v = {
        title: 'Your feed is empty',
        description: 'Follow people or join communities and their posts will show up here.',
      },
      w = {
        title: 'Nothing new yet',
        description: 'Follow people or join communities, or write the first post above.',
      };
    a.s(
      [
        'default',
        0,
        function () {
          let a = (0, m.U)(),
            q = (0, c.d)(),
            { newPosts: s, clearNewPosts: x } = (0, n.u)(),
            [y, z] = (0, l.useState)('ranked');
          return a.isPending
            ? (0, b.jsx)('div', {
                'aria-busy': 'true',
                'aria-label': 'Loading',
                children: (0, b.jsx)(f.f, { height: '8rem' }),
              })
            : a.isError
              ? (0, b.jsxs)(d.f, {
                  variant: 'danger',
                  title: 'Could not reach Pulse',
                  children: [
                    (0, b.jsx)('p', {
                      className: u.default.errorText,
                      children: 'Check your connection and try again.',
                    }),
                    (0, b.jsx)(e.f, {
                      size: 'sm',
                      onClick: () => a.refetch(),
                      children: 'Try again',
                    }),
                  ],
                })
              : a.data
                ? (0, b.jsxs)('div', {
                    className: u.default.stack,
                    children: [
                      (0, b.jsx)('h1', { children: (0, b.jsx)(k.V, { children: 'Home' }) }),
                      (0, b.jsx)(o.f, {
                        user: a.data,
                        feedKeys: [
                          (0, m.F)({ kind: 'home', mode: 'ranked' }),
                          (0, m.F)({ kind: 'home', mode: 'latest' }),
                        ],
                      }),
                      (0, b.jsxs)(g.T, {
                        value: y,
                        onValueChange: (a) => z(a),
                        children: [
                          (0, b.jsxs)(h.a, {
                            'aria-label': 'Feed order',
                            children: [
                              (0, b.jsx)(j.c, { value: 'ranked', children: 'For you' }),
                              (0, b.jsx)(j.c, { value: 'latest', children: 'Latest' }),
                            ],
                          }),
                          (0, b.jsx)(t, {
                            count: s,
                            onShow: () => {
                              (x(),
                                window.scrollTo({ top: 0 }),
                                q.resetQueries({ queryKey: ['feed'] }));
                            },
                          }),
                          (0, b.jsx)(i.b, {
                            value: 'ranked',
                            className: u.default.panel,
                            children:
                              'ranked' === y &&
                              (0, b.jsx)(p.f, {
                                source: { kind: 'home', mode: 'ranked' },
                                label: 'Your feed',
                                empty: v,
                              }),
                          }),
                          (0, b.jsx)(i.b, {
                            value: 'latest',
                            className: u.default.panel,
                            children:
                              'latest' === y &&
                              (0, b.jsx)(p.f, {
                                source: { kind: 'home', mode: 'latest' },
                                label: 'Latest posts',
                                empty: w,
                              }),
                          }),
                        ],
                      }),
                    ],
                  })
                : (0, b.jsx)(r, {});
        },
      ],
      15424,
    );
  },
];

//# sourceMappingURL=apps_web_src_components_0oha7wb6e_j6n._.js.map
