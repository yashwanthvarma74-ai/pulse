(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([
  'object' == typeof document ? document.currentScript : void 0,
  18901,
  (e) => {
    e.v({
      actions: 'Pt42ta_actions',
      counts: 'Pt42ta_counts',
      handle: 'Pt42ta_handle',
      header: 'Pt42ta_header',
      name: 'Pt42ta_name',
      note: 'Pt42ta_note',
      page: 'Pt42ta_page',
      who: 'Pt42ta_who',
    });
  },
  72050,
  (e) => {
    'use strict';
    var o = e.i(43476),
      l = e.i(60450),
      n = e.i(64300),
      s = e.i(17738),
      i = e.i(70684),
      a = e.i(32345),
      t = e.i(22016),
      r = e.i(48804),
      d = e.i(92179),
      c = e.i(14346),
      h = e.i(18901);
    function f({ handle: e }) {
      let c = (0, r.G)(e),
        u = (0, r.O)(e);
      if (c.isPending) return (0, o.jsx)(a.f, { height: '8rem', 'aria-busy': 'true' });
      if (c.isError)
        return (0, o.jsxs)(l.f, {
          variant: 'info',
          title: 'No one here',
          children: [
            'We could not find @',
            e,
            '. ',
            (0, o.jsx)(t.default, { href: '/', children: 'Back home' }),
          ],
        });
      let m = c.data,
        g = u.follow.isPending || u.unfollow.isPending || u.block.isPending || u.unblock.isPending,
        j = u.follow.error ?? u.unfollow.error ?? u.block.error ?? u.unblock.error;
      return (0, o.jsxs)('div', {
        className: h.default.page,
        children: [
          (0, o.jsxs)('header', {
            className: h.default.header,
            children: [
              (0, o.jsx)(n.f, { name: m.name, size: 'xl' }),
              (0, o.jsxs)('div', {
                className: h.default.who,
                children: [
                  (0, o.jsx)('h1', { className: h.default.name, children: m.name }),
                  (0, o.jsxs)('p', { className: h.default.handle, children: ['@', m.handle] }),
                  (0, o.jsxs)('p', {
                    className: h.default.counts,
                    children: [
                      (0, o.jsx)('strong', { children: m.followerCount }),
                      ' ',
                      1 === m.followerCount ? 'follower' : 'followers',
                      ' · ',
                      (0, o.jsx)('strong', { children: m.followingCount }),
                      ' following',
                    ],
                  }),
                ],
              }),
              !m.isSelf &&
                (0, o.jsx)('div', {
                  className: h.default.actions,
                  children: m.blocked
                    ? (0, o.jsxs)(o.Fragment, {
                        children: [
                          (0, o.jsx)(s.f, { variant: 'danger', children: 'Blocked' }),
                          (0, o.jsx)(i.f, {
                            size: 'sm',
                            loading: g,
                            onClick: () => u.unblock.mutate(),
                            children: 'Unblock',
                          }),
                        ],
                      })
                    : (0, o.jsxs)(o.Fragment, {
                        children: [
                          (0, o.jsx)(i.f, {
                            size: 'sm',
                            variant: m.following ? 'secondary' : 'primary',
                            loading: g,
                            'aria-pressed': m.following,
                            onClick: () => (m.following ? u.unfollow.mutate() : u.follow.mutate()),
                            children: m.following ? 'Following' : 'Follow',
                          }),
                          (0, o.jsx)(i.f, {
                            size: 'sm',
                            variant: 'ghost',
                            loading: g,
                            onClick: () => u.block.mutate(),
                            children: 'Block',
                          }),
                        ],
                      }),
                }),
            ],
          }),
          j && (0, o.jsx)(l.f, { variant: 'danger', children: j.message }),
          m.blocked
            ? (0, o.jsx)('p', {
                className: h.default.note,
                children: 'You blocked this person, so their posts are hidden from you.',
              })
            : (0, o.jsx)(d.f, {
                source: { kind: 'user', handle: e },
                label: `Posts by ${m.name}`,
                empty: {
                  title: 'No posts to show',
                  description: m.isSelf
                    ? 'Posts you write show up here.'
                    : 'They have not posted anything you can see yet.',
                },
              }),
        ],
      });
    }
    e.s([
      'default',
      0,
      function ({ handle: e }) {
        return (0, o.jsx)(c.f, { children: () => (0, o.jsx)(f, { handle: e }) });
      },
    ]);
  },
]);
