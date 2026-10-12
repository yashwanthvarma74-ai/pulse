module.exports = [
  46189,
  (a) => {
    a.v({
      empty: 'Qw150q_empty',
      field: 'Qw150q_field',
      form: 'Qw150q_form',
      list: 'Qw150q_list',
      page: 'Qw150q_page',
      replies: 'Qw150q_replies',
      subtitle: 'Qw150q_subtitle',
      title: 'Qw150q_title',
    });
  },
  7252,
  (a) => {
    'use strict';
    var b = a.i(87924),
      c = a.i(90985),
      d = a.i(35033),
      e = a.i(87436),
      f = a.i(31459),
      g = a.i(64572),
      h = a.i(66e3),
      i = a.i(52728),
      j = a.i(38246),
      k = a.i(72131);
    a.i(9241);
    var l = a.i(94455),
      m = a.i(21890),
      n = a.i(81825),
      o = a.i(83128),
      p = a.i(46189);
    function q({ id: a, user: d }) {
      let f = (0, m.z)(a),
        i = (0, m.a)(a),
        l = (0, k.useMemo)(() => i.data?.pages.flatMap((a) => a.items) ?? [], [i.data]);
      return f.isPending
        ? (0, b.jsx)(g.f, { height: '8rem', 'aria-busy': 'true' })
        : f.isError
          ? (0, b.jsxs)(c.f, {
              variant: 'info',
              title: 'This post is not available',
              children: [
                'It may have been removed, or it may not be shared with you. ',
                (0, b.jsx)(j.default, { href: '/', children: 'Back home' }),
              ],
            })
          : (0, b.jsxs)('div', {
              className: p.default.page,
              children: [
                (0, b.jsx)('h1', { className: p.default.title, children: 'Post' }),
                (0, b.jsx)(n.f, { post: f.data, detail: !0 }),
                (0, b.jsxs)('section', {
                  'aria-labelledby': 'replies-title',
                  className: p.default.replies,
                  children: [
                    (0, b.jsx)('h2', {
                      id: 'replies-title',
                      className: p.default.subtitle,
                      children: 'Replies',
                    }),
                    (0, b.jsx)(r, { postId: a, user: d }),
                    i.isPending && (0, b.jsx)(h.f, { label: 'Loading replies' }),
                    i.isError && (0, b.jsx)(c.f, { variant: 'danger', children: i.error.message }),
                    i.data &&
                      0 === l.length &&
                      (0, b.jsx)('p', {
                        className: p.default.empty,
                        children: 'No replies yet. Be the first.',
                      }),
                    (0, b.jsx)('ul', {
                      className: p.default.list,
                      children: l.map((a) =>
                        (0, b.jsx)(
                          'li',
                          { children: (0, b.jsx)(n.f, { post: a, detail: !0 }) },
                          a.id,
                        ),
                      ),
                    }),
                    i.hasNextPage &&
                      (0, b.jsx)(e.f, {
                        loading: i.isFetchingNextPage,
                        onClick: () => i.fetchNextPage(),
                        children: 'Load more replies',
                      }),
                  ],
                }),
              ],
            });
    }
    function r({ postId: a, user: g }) {
      let [h, j] = (0, k.useState)(''),
        n = (0, m.B)(a),
        o = h.length > l.T;
      return (0, b.jsxs)('form', {
        className: p.default.form,
        onSubmit: function (a) {
          (a.preventDefault(), h.trim() && !o && n.mutate(h, { onSuccess: () => j('') }));
        },
        'aria-label': 'Write a reply',
        children: [
          (0, b.jsx)(d.f, { name: g.name }),
          (0, b.jsxs)('div', {
            className: p.default.field,
            children: [
              (0, b.jsx)(f.f, {
                label: 'Your reply',
                error: o ? `${h.length - l.T} characters over the limit.` : void 0,
                children: (0, b.jsx)(i.f, {
                  rows: 2,
                  resize: 'none',
                  value: h,
                  onChange: (a) => j(a.target.value),
                }),
              }),
              n.isError && (0, b.jsx)(c.f, { variant: 'danger', children: n.error.message }),
              (0, b.jsx)('div', {
                children: (0, b.jsx)(e.f, {
                  type: 'submit',
                  variant: 'primary',
                  size: 'sm',
                  loading: n.isPending,
                  disabled: !h.trim() || o,
                  children: 'Reply',
                }),
              }),
            ],
          }),
        ],
      });
    }
    a.s([
      'default',
      0,
      function ({ id: a }) {
        return (0, b.jsx)(o.f, { children: (c) => (0, b.jsx)(q, { id: a, user: c }) });
      },
    ]);
  },
];

//# sourceMappingURL=apps_web_src_components_pages_0zhh5yjiw6r5c._.js.map
