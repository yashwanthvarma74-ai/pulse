(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([
  'object' == typeof document ? document.currentScript : void 0,
  [
    66081,
    (e) => {
      var i = e.i(43476),
        a = e.i(64300),
        t = e.i(17738),
        s = e.i(70684),
        n = e.i(33290),
        r = e.i(22016),
        l = e.i(71645),
        o = e.i(48804),
        d = e.i(47730),
        h = e.i(92276),
        c = e.i(54616),
        u = e.i(60450),
        f = e.i(79230),
        m = e.i(70361),
        x = e.i(30448),
        p = e.i(99273),
        j = e.i(26103),
        g = e.i(78060),
        y = e.i(28352),
        v = e.i(84294),
        b = e.i(58090),
        w = e.i(45835),
        _ = e.i(67726),
        C = e.i(98124),
        N = e.i(66027),
        k = e.i(12598),
        L = e.i(94108),
        P = e.i(79750);
      let S = [
        { value: 'spam', label: 'Spam' },
        { value: 'harassment', label: 'Harassment' },
        { value: 'misinformation', label: 'Misleading information' },
        { value: 'other', label: 'Something else' },
      ];
      function $({ post: e, isOwn: a }) {
        let [t, s] = (0, l.useState)(null),
          n = (0, l.useRef)(null),
          r = (e) => {
            e ||
              (s(null), requestAnimationFrame(() => n.current?.querySelector('button')?.focus()));
          };
        return (0, i.jsxs)('span', {
          ref: n,
          children: [
            (0, i.jsxs)(b.f, {
              children: [
                (0, i.jsx)(b.f.Trigger, {
                  variant: 'ghost',
                  size: 'sm',
                  'aria-label': `More actions for ${e.author.name}'s post`,
                  children: 'More',
                }),
                (0, i.jsxs)(b.f.Content, {
                  'aria-label': 'Post actions',
                  placement: 'bottom end',
                  children: [
                    (0, i.jsx)(b.f.Item, {
                      id: 'why',
                      onAction: () => s('why'),
                      children: 'Why am I seeing this?',
                    }),
                    !a &&
                      (0, i.jsx)(b.f.Item, {
                        id: 'report',
                        onAction: () => s('report'),
                        children: 'Report this post',
                      }),
                    !a &&
                      (0, i.jsxs)(b.f.Item, {
                        id: 'block',
                        danger: !0,
                        onAction: () => s('block'),
                        children: ['Block @', e.author.handle],
                      }),
                  ],
                }),
              ],
            }),
            (0, i.jsx)(T, { post: e, open: 'why' === t, onOpenChange: r }),
            (0, i.jsx)(G, { post: e, open: 'report' === t, onOpenChange: r }),
            (0, i.jsx)(R, { post: e, open: 'block' === t, onOpenChange: r }),
          ],
        });
      }
      function T({ post: e, open: a, onOpenChange: t }) {
        let s = (0, N.f)({ queryKey: ['why', e.id], queryFn: () => L.k.why(e.id), enabled: a });
        return (0, i.jsxs)(f.f, {
          open: a,
          onOpenChange: t,
          size: 'sm',
          children: [
            (0, i.jsxs)(g.f, {
              children: [
                (0, i.jsx)(y.f, { children: 'Why am I seeing this?' }),
                (0, i.jsx)(x.f, {}),
              ],
            }),
            (0, i.jsxs)(m.f, {
              children: [
                (0, i.jsx)(p.f, {
                  children: 'These are the reasons behind where this post sits in your feed.',
                }),
                s.isPending && (0, i.jsx)(_.f, { label: 'Loading the reasons' }),
                s.isError && (0, i.jsx)(u.f, { variant: 'danger', children: s.error.message }),
                s.data &&
                  (s.data.reasons.length > 0
                    ? (0, i.jsx)('ul', {
                        className: P.default.reasons,
                        children: s.data.reasons.map((e) => (0, i.jsx)('li', { children: e }, e)),
                      })
                    : (0, i.jsx)('p', {
                        className: P.default.plain,
                        children:
                          'Nothing in particular. It is just one of the newer posts you can see.',
                      })),
              ],
            }),
          ],
        });
      }
      function G({ post: e, open: a, onOpenChange: t }) {
        let [r, o] = (0, l.useState)('spam'),
          [d, h] = (0, l.useState)(''),
          { toast: b } = (0, n.f)(),
          _ = (0, c.f)({
            mutationFn: () => L.k.report(e.id, { reason: r, details: d }),
            onSuccess: () => {
              (b({
                title: 'Report sent',
                description: 'Thank you. A moderator will take a look.',
                variant: 'success',
              }),
                t(!1));
            },
          });
        return (0, i.jsx)(f.f, {
          open: a,
          onOpenChange: t,
          size: 'sm',
          children: (0, i.jsxs)('form', {
            onSubmit: (e) => {
              (e.preventDefault(), _.mutate());
            },
            children: [
              (0, i.jsxs)(g.f, {
                children: [(0, i.jsx)(y.f, { children: 'Report this post' }), (0, i.jsx)(x.f, {})],
              }),
              (0, i.jsxs)(m.f, {
                children: [
                  (0, i.jsx)(p.f, {
                    children: 'Reports go to the moderators. The author is not told who reported.',
                  }),
                  (0, i.jsxs)('div', {
                    className: P.default.fields,
                    children: [
                      (0, i.jsx)(v.f, {
                        label: 'Reason',
                        children: (0, i.jsx)(w.f, {
                          value: r,
                          onChange: (e) => o(e.target.value),
                          children: S.map((e) =>
                            (0, i.jsx)('option', { value: e.value, children: e.label }, e.value),
                          ),
                        }),
                      }),
                      (0, i.jsx)(v.f, {
                        label: 'Anything else we should know? (optional)',
                        children: (0, i.jsx)(C.f, {
                          rows: 3,
                          maxLength: 300,
                          value: d,
                          onChange: (e) => h(e.target.value),
                        }),
                      }),
                      _.isError &&
                        (0, i.jsx)(u.f, { variant: 'danger', children: _.error.message }),
                    ],
                  }),
                ],
              }),
              (0, i.jsxs)(j.f, {
                children: [
                  (0, i.jsx)(s.f, { onClick: () => t(!1), children: 'Cancel' }),
                  (0, i.jsx)(s.f, {
                    type: 'submit',
                    variant: 'primary',
                    loading: _.isPending,
                    children: 'Send report',
                  }),
                ],
              }),
            ],
          }),
        });
      }
      function R({ post: e, open: a, onOpenChange: t }) {
        let { toast: r } = (0, n.f)(),
          l = (0, k.d)(),
          o = (0, c.f)({
            mutationFn: () => L.k.block(e.author.handle),
            onSuccess: () => {
              (r({ title: `Blocked @${e.author.handle}`, variant: 'success' }),
                l.removeQueries({ queryKey: ['feed'] }),
                l.removeQueries({ queryKey: ['posts'] }),
                l.invalidateQueries({ queryKey: ['feed'] }),
                l.invalidateQueries({ queryKey: ['blocked'] }),
                t(!1));
            },
          });
        return (0, i.jsxs)(f.f, {
          open: a,
          onOpenChange: t,
          size: 'sm',
          role: 'alertdialog',
          children: [
            (0, i.jsxs)(g.f, {
              children: [
                (0, i.jsxs)(y.f, { children: ['Block @', e.author.handle, '?'] }),
                (0, i.jsx)(x.f, {}),
              ],
            }),
            (0, i.jsxs)(m.f, {
              children: [
                (0, i.jsx)(p.f, {
                  children:
                    'You will not see their posts, and they will not see yours or be able to follow you. You can undo this in your settings.',
                }),
                o.isError && (0, i.jsx)(u.f, { variant: 'danger', children: o.error.message }),
              ],
            }),
            (0, i.jsxs)(j.f, {
              children: [
                (0, i.jsx)(s.f, { onClick: () => t(!1), children: 'Cancel' }),
                (0, i.jsx)(s.f, {
                  variant: 'danger',
                  loading: o.isPending,
                  onClick: () => o.mutate(),
                  children: 'Block',
                }),
              ],
            }),
          ],
        });
      }
      e.i(24856);
      let q = /(^|[^a-z0-9_])@([a-z0-9_]{3,30})(?![a-z0-9_])/gi;
      function z({ text: e, className: a }) {
        return (0, i.jsx)('p', {
          className: a,
          children: (function (e) {
            let i = [],
              a = 0;
            for (let t of e.matchAll(q)) {
              let s = t.index + t[1].length;
              (s > a && i.push({ text: e.slice(a, s) }),
                i.push({ text: `@${t[2]}`, mention: t[2].toLowerCase() }),
                (a = s + 1 + t[2].length));
            }
            return (a < e.length && i.push({ text: e.slice(a) }), i);
          })(e).map((e, a) =>
            e.mention
              ? (0, i.jsx)(r.default, { href: `/u/${e.mention}`, children: e.text }, a)
              : e.text,
          ),
        });
      }
      var M = e.i(45001);
      let A = (0, l.forwardRef)(function ({ post: e, detail: l = !1, className: c, ...u }, f) {
        let { data: m } = (0, o.U)(),
          { toast: x } = (0, n.f)(),
          p = (0, o.R)(),
          j = m?.id === e.author.id,
          g = new Date(e.createdAt);
        return (0, i.jsxs)('article', {
          ref: f,
          tabIndex: 0,
          'aria-label': `Post by ${e.author.name}`,
          className: [M.default.post, c].filter(Boolean).join(' '),
          ...u,
          children: [
            (0, i.jsx)(a.f, { name: e.author.name, size: 'lg' }),
            (0, i.jsxs)('div', {
              className: M.default.body,
              children: [
                (0, i.jsxs)('header', {
                  className: M.default.meta,
                  children: [
                    (0, i.jsx)(r.default, {
                      href: `/u/${e.author.handle}`,
                      className: M.default.name,
                      children: e.author.name,
                    }),
                    (0, i.jsxs)('span', {
                      className: M.default.handle,
                      children: ['@', e.author.handle],
                    }),
                    (0, i.jsx)('time', {
                      className: M.default.time,
                      dateTime: e.createdAt,
                      title: g.toLocaleString(),
                      children: (0, d.f)(e.createdAt),
                    }),
                    'followers' === e.visibility &&
                      (0, i.jsx)(t.f, { variant: 'neutral', children: 'Followers only' }),
                    'community' === e.visibility &&
                      (0, i.jsx)(t.f, { variant: 'neutral', children: 'Members only' }),
                    e.community &&
                      (0, i.jsx)(r.default, {
                        href: `/c/${e.community.slug}`,
                        className: M.default.community,
                        children: e.community.name,
                      }),
                  ],
                }),
                (0, i.jsx)(z, { text: e.text, className: M.default.text }),
                (0, i.jsx)(h.f, { post: e }),
                (0, i.jsxs)('footer', {
                  className: M.default.actions,
                  children: [
                    (0, i.jsxs)(s.f, {
                      variant: 'ghost',
                      size: 'sm',
                      'aria-pressed': e.reacted,
                      className: M.default.like,
                      onClick: () =>
                        p.mutate(
                          { post: e },
                          {
                            onError: (e) =>
                              x({
                                title: 'Could not update your like',
                                description: e.message,
                                variant: 'danger',
                              }),
                          },
                        ),
                      children: ['Like · ', e.counts.reactions],
                    }),
                    l
                      ? (0, i.jsxs)('span', {
                          className: M.default.replies,
                          children: ['Replies · ', e.counts.replies],
                        })
                      : (0, i.jsxs)(r.default, {
                          href: `/p/${e.id}`,
                          className: M.default.replyLink,
                          children: ['Reply · ', e.counts.replies],
                        }),
                    (0, i.jsx)('span', { className: M.default.spacer }),
                    (0, i.jsx)($, { post: e, isOwn: j }),
                  ],
                }),
              ],
            }),
          ],
        });
      });
      e.s(['f', 0, A], 66081);
    },
    92276,
    79230,
    70361,
    30448,
    99273,
    26103,
    78060,
    28352,
    (e) => {
      var i = e.i(43476),
        a = e.i(32345);
      e.i(24856);
      var t = e.i(21138),
        s = e.i(46977);
      e.s(
        [
          'f',
          0,
          function ({ post: e }) {
            return 0 === e.media.length
              ? null
              : (0, i.jsx)('div', {
                  className: s.default.grid,
                  'data-count': e.media.length,
                  children: e.media.map((n) =>
                    'ready' === n.status && n.width && n.height
                      ? (0, i.jsx)(
                          'img',
                          {
                            className: s.default.image,
                            src: `/api/media/${n.id}/640`,
                            srcSet: t.w.map((e) => `/api/media/${n.id}/${e} ${e}w`).join(', '),
                            sizes: '(max-width: 700px) 100vw, 600px',
                            width: n.width,
                            height: n.height,
                            style: {
                              aspectRatio: 1 === e.media.length ? `${n.width} / ${n.height}` : '1',
                            },
                            loading: 'lazy',
                            decoding: 'async',
                            alt: `Photo in ${e.author.name}'s post`,
                          },
                          n.id,
                        )
                      : (0, i.jsx)(a.f, { className: s.default.image, height: '12rem' }, n.id),
                  ),
                });
          },
        ],
        92276,
      );
      var n = e.i(69778);
      (e.s(['f', () => n.D], 79230),
        e.s(['f', () => n.a], 70361),
        e.s(['f', () => n.b], 30448),
        e.s(['f', () => n.c], 99273),
        e.s(['f', () => n.d], 26103),
        e.s(['f', () => n.e], 78060),
        e.s(['f', () => n.f], 28352));
    },
    14346,
    (e) => {
      var i = e.i(43476),
        a = e.i(60450),
        t = e.i(70684),
        s = e.i(32345),
        n = e.i(22016),
        r = e.i(48804);
      e.s([
        'f',
        0,
        function ({ children: e }) {
          let l = (0, r.U)();
          return l.isPending
            ? (0, i.jsx)(s.f, { height: '8rem', 'aria-busy': 'true' })
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
                    children: (0, i.jsx)(n.default, {
                      href: '/',
                      children: 'Go to the start page',
                    }),
                  });
        },
      ]);
    },
    2793,
    (e) => {
      var i = e.i(43476),
        a = e.i(60450),
        t = e.i(64300),
        s = e.i(70684),
        n = e.i(84294),
        r = e.i(32345),
        l = e.i(67726),
        o = e.i(98124),
        d = e.i(22016),
        h = e.i(71645);
      e.i(24856);
      var c = e.i(21138),
        u = e.i(48804),
        f = e.i(66081),
        m = e.i(14346),
        x = e.i(53171);
      function p({ id: e, user: t }) {
        let n = (0, u.z)(e),
          o = (0, u.a)(e),
          c = (0, h.useMemo)(() => o.data?.pages.flatMap((e) => e.items) ?? [], [o.data]);
        return n.isPending
          ? (0, i.jsx)(r.f, { height: '8rem', 'aria-busy': 'true' })
          : n.isError
            ? (0, i.jsxs)(a.f, {
                variant: 'info',
                title: 'This post is not available',
                children: [
                  'It may have been removed, or it may not be shared with you. ',
                  (0, i.jsx)(d.default, { href: '/', children: 'Back home' }),
                ],
              })
            : (0, i.jsxs)('div', {
                className: x.default.page,
                children: [
                  (0, i.jsx)('h1', { className: x.default.title, children: 'Post' }),
                  (0, i.jsx)(f.f, { post: n.data, detail: !0 }),
                  (0, i.jsxs)('section', {
                    'aria-labelledby': 'replies-title',
                    className: x.default.replies,
                    children: [
                      (0, i.jsx)('h2', {
                        id: 'replies-title',
                        className: x.default.subtitle,
                        children: 'Replies',
                      }),
                      (0, i.jsx)(j, { postId: e, user: t }),
                      o.isPending && (0, i.jsx)(l.f, { label: 'Loading replies' }),
                      o.isError &&
                        (0, i.jsx)(a.f, { variant: 'danger', children: o.error.message }),
                      o.data &&
                        0 === c.length &&
                        (0, i.jsx)('p', {
                          className: x.default.empty,
                          children: 'No replies yet. Be the first.',
                        }),
                      (0, i.jsx)('ul', {
                        className: x.default.list,
                        children: c.map((e) =>
                          (0, i.jsx)(
                            'li',
                            { children: (0, i.jsx)(f.f, { post: e, detail: !0 }) },
                            e.id,
                          ),
                        ),
                      }),
                      o.hasNextPage &&
                        (0, i.jsx)(s.f, {
                          loading: o.isFetchingNextPage,
                          onClick: () => o.fetchNextPage(),
                          children: 'Load more replies',
                        }),
                    ],
                  }),
                ],
              });
      }
      function j({ postId: e, user: r }) {
        let [l, d] = (0, h.useState)(''),
          f = (0, u.B)(e),
          m = l.length > c.T;
        return (0, i.jsxs)('form', {
          className: x.default.form,
          onSubmit: function (e) {
            (e.preventDefault(), l.trim() && !m && f.mutate(l, { onSuccess: () => d('') }));
          },
          'aria-label': 'Write a reply',
          children: [
            (0, i.jsx)(t.f, { name: r.name }),
            (0, i.jsxs)('div', {
              className: x.default.field,
              children: [
                (0, i.jsx)(n.f, {
                  label: 'Your reply',
                  error: m ? `${l.length - c.T} characters over the limit.` : void 0,
                  children: (0, i.jsx)(o.f, {
                    rows: 2,
                    resize: 'none',
                    value: l,
                    onChange: (e) => d(e.target.value),
                  }),
                }),
                f.isError && (0, i.jsx)(a.f, { variant: 'danger', children: f.error.message }),
                (0, i.jsx)('div', {
                  children: (0, i.jsx)(s.f, {
                    type: 'submit',
                    variant: 'primary',
                    size: 'sm',
                    loading: f.isPending,
                    disabled: !l.trim() || m,
                    children: 'Reply',
                  }),
                }),
              ],
            }),
          ],
        });
      }
      e.s([
        'default',
        0,
        function ({ id: e }) {
          return (0, i.jsx)(m.f, { children: (a) => (0, i.jsx)(p, { id: e, user: a }) });
        },
      ]);
    },
    47730,
    (e) => {
      let i = new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' }),
        a = new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' });
      e.s([
        'f',
        0,
        function (e, t = new Date()) {
          let s = new Date(e),
            n = t.getTime() - s.getTime();
          return n < 6e4
            ? 'just now'
            : n < 36e5
              ? `${Math.floor(n / 6e4)}m`
              : n < 864e5
                ? `${Math.floor(n / 36e5)}h`
                : n < 6048e5
                  ? `${Math.floor(n / 864e5)}d`
                  : (s.getFullYear() === t.getFullYear() ? i : a).format(s);
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
    67726,
    (e) => {
      var i = e.i(67241);
      e.s(['f', () => i.S]);
    },
    98124,
    (e) => {
      var i = e.i(58744);
      e.s(['f', () => i.T]);
    },
  ],
  45001,
  (e) => {
    e.v({
      actions: '_3LCh4G_actions',
      body: '_3LCh4G_body',
      community: '_3LCh4G_community',
      handle: '_3LCh4G_handle',
      like: '_3LCh4G_like',
      meta: '_3LCh4G_meta',
      name: '_3LCh4G_name',
      post: '_3LCh4G_post',
      replies: '_3LCh4G_replies',
      replyLink: '_3LCh4G_replyLink',
      spacer: '_3LCh4G_spacer',
      text: '_3LCh4G_text',
      time: '_3LCh4G_time',
    });
  },
  46977,
  (e) => {
    e.v({ grid: 'oRcMWW_grid', image: 'oRcMWW_image' });
  },
  79750,
  (e) => {
    e.v({ fields: 'PDNgMG_fields', plain: 'PDNgMG_plain', reasons: 'PDNgMG_reasons' });
  },
  53171,
  (e) => {
    e.v({
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
]);
