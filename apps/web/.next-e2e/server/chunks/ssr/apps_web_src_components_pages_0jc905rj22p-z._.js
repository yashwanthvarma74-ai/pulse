module.exports = [
  33896,
  (a) => {
    a.v({
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
  5935,
  (a) => {
    'use strict';
    var b = a.i(87924),
      c = a.i(90985),
      d = a.i(35033),
      e = a.i(98441),
      f = a.i(87436),
      g = a.i(64572),
      h = a.i(38246),
      i = a.i(21890),
      j = a.i(11970),
      k = a.i(83128),
      l = a.i(33896);
    function m({ handle: a }) {
      let k = (0, i.G)(a),
        n = (0, i.O)(a);
      if (k.isPending) return (0, b.jsx)(g.f, { height: '8rem', 'aria-busy': 'true' });
      if (k.isError)
        return (0, b.jsxs)(c.f, {
          variant: 'info',
          title: 'No one here',
          children: [
            'We could not find @',
            a,
            '. ',
            (0, b.jsx)(h.default, { href: '/', children: 'Back home' }),
          ],
        });
      let o = k.data,
        p = n.follow.isPending || n.unfollow.isPending || n.block.isPending || n.unblock.isPending,
        q = n.follow.error ?? n.unfollow.error ?? n.block.error ?? n.unblock.error;
      return (0, b.jsxs)('div', {
        className: l.default.page,
        children: [
          (0, b.jsxs)('header', {
            className: l.default.header,
            children: [
              (0, b.jsx)(d.f, { name: o.name, size: 'xl' }),
              (0, b.jsxs)('div', {
                className: l.default.who,
                children: [
                  (0, b.jsx)('h1', { className: l.default.name, children: o.name }),
                  (0, b.jsxs)('p', { className: l.default.handle, children: ['@', o.handle] }),
                  (0, b.jsxs)('p', {
                    className: l.default.counts,
                    children: [
                      (0, b.jsx)('strong', { children: o.followerCount }),
                      ' ',
                      1 === o.followerCount ? 'follower' : 'followers',
                      ' · ',
                      (0, b.jsx)('strong', { children: o.followingCount }),
                      ' following',
                    ],
                  }),
                ],
              }),
              !o.isSelf &&
                (0, b.jsx)('div', {
                  className: l.default.actions,
                  children: o.blocked
                    ? (0, b.jsxs)(b.Fragment, {
                        children: [
                          (0, b.jsx)(e.f, { variant: 'danger', children: 'Blocked' }),
                          (0, b.jsx)(f.f, {
                            size: 'sm',
                            loading: p,
                            onClick: () => n.unblock.mutate(),
                            children: 'Unblock',
                          }),
                        ],
                      })
                    : (0, b.jsxs)(b.Fragment, {
                        children: [
                          (0, b.jsx)(f.f, {
                            size: 'sm',
                            variant: o.following ? 'secondary' : 'primary',
                            loading: p,
                            'aria-pressed': o.following,
                            onClick: () => (o.following ? n.unfollow.mutate() : n.follow.mutate()),
                            children: o.following ? 'Following' : 'Follow',
                          }),
                          (0, b.jsx)(f.f, {
                            size: 'sm',
                            variant: 'ghost',
                            loading: p,
                            onClick: () => n.block.mutate(),
                            children: 'Block',
                          }),
                        ],
                      }),
                }),
            ],
          }),
          q && (0, b.jsx)(c.f, { variant: 'danger', children: q.message }),
          o.blocked
            ? (0, b.jsx)('p', {
                className: l.default.note,
                children: 'You blocked this person, so their posts are hidden from you.',
              })
            : (0, b.jsx)(j.f, {
                source: { kind: 'user', handle: a },
                label: `Posts by ${o.name}`,
                empty: {
                  title: 'No posts to show',
                  description: o.isSelf
                    ? 'Posts you write show up here.'
                    : 'They have not posted anything you can see yet.',
                },
              }),
        ],
      });
    }
    a.s([
      'default',
      0,
      function ({ handle: a }) {
        return (0, b.jsx)(k.f, { children: () => (0, b.jsx)(m, { handle: a }) });
      },
    ]);
  },
];

//# sourceMappingURL=apps_web_src_components_pages_0jc905rj22p-z._.js.map
