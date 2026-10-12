(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([
  'object' == typeof document ? document.currentScript : void 0,
  [
    66081,
    (e) => {
      var a = e.i(43476),
        s = e.i(64300),
        t = e.i(17738),
        i = e.i(70684),
        n = e.i(33290),
        l = e.i(22016),
        r = e.i(71645),
        o = e.i(48804),
        d = e.i(47730),
        h = e.i(92276),
        c = e.i(54616),
        u = e.i(60450),
        f = e.i(79230),
        m = e.i(70361),
        p = e.i(30448),
        x = e.i(99273),
        j = e.i(26103),
        g = e.i(78060),
        y = e.i(28352),
        v = e.i(84294),
        _ = e.i(58090),
        b = e.i(45835),
        w = e.i(67726),
        C = e.i(98124),
        N = e.i(66027),
        k = e.i(12598),
        S = e.i(94108),
        L = e.i(79750);
      let F = [
        { value: 'spam', label: 'Spam' },
        { value: 'harassment', label: 'Harassment' },
        { value: 'misinformation', label: 'Misleading information' },
        { value: 'other', label: 'Something else' },
      ];
      function T({ post: e, isOwn: s }) {
        let [t, i] = (0, r.useState)(null),
          n = (0, r.useRef)(null),
          l = (e) => {
            e ||
              (i(null), requestAnimationFrame(() => n.current?.querySelector('button')?.focus()));
          };
        return (0, a.jsxs)('span', {
          ref: n,
          children: [
            (0, a.jsxs)(_.f, {
              children: [
                (0, a.jsx)(_.f.Trigger, {
                  variant: 'ghost',
                  size: 'sm',
                  'aria-label': `More actions for ${e.author.name}'s post`,
                  children: 'More',
                }),
                (0, a.jsxs)(_.f.Content, {
                  'aria-label': 'Post actions',
                  placement: 'bottom end',
                  children: [
                    (0, a.jsx)(_.f.Item, {
                      id: 'why',
                      onAction: () => i('why'),
                      children: 'Why am I seeing this?',
                    }),
                    !s &&
                      (0, a.jsx)(_.f.Item, {
                        id: 'report',
                        onAction: () => i('report'),
                        children: 'Report this post',
                      }),
                    !s &&
                      (0, a.jsxs)(_.f.Item, {
                        id: 'block',
                        danger: !0,
                        onAction: () => i('block'),
                        children: ['Block @', e.author.handle],
                      }),
                  ],
                }),
              ],
            }),
            (0, a.jsx)($, { post: e, open: 'why' === t, onOpenChange: l }),
            (0, a.jsx)(G, { post: e, open: 'report' === t, onOpenChange: l }),
            (0, a.jsx)(E, { post: e, open: 'block' === t, onOpenChange: l }),
          ],
        });
      }
      function $({ post: e, open: s, onOpenChange: t }) {
        let i = (0, N.f)({ queryKey: ['why', e.id], queryFn: () => S.k.why(e.id), enabled: s });
        return (0, a.jsxs)(f.f, {
          open: s,
          onOpenChange: t,
          size: 'sm',
          children: [
            (0, a.jsxs)(g.f, {
              children: [
                (0, a.jsx)(y.f, { children: 'Why am I seeing this?' }),
                (0, a.jsx)(p.f, {}),
              ],
            }),
            (0, a.jsxs)(m.f, {
              children: [
                (0, a.jsx)(x.f, {
                  children: 'These are the reasons behind where this post sits in your feed.',
                }),
                i.isPending && (0, a.jsx)(w.f, { label: 'Loading the reasons' }),
                i.isError && (0, a.jsx)(u.f, { variant: 'danger', children: i.error.message }),
                i.data &&
                  (i.data.reasons.length > 0
                    ? (0, a.jsx)('ul', {
                        className: L.default.reasons,
                        children: i.data.reasons.map((e) => (0, a.jsx)('li', { children: e }, e)),
                      })
                    : (0, a.jsx)('p', {
                        className: L.default.plain,
                        children:
                          'Nothing in particular. It is just one of the newer posts you can see.',
                      })),
              ],
            }),
          ],
        });
      }
      function G({ post: e, open: s, onOpenChange: t }) {
        let [l, o] = (0, r.useState)('spam'),
          [d, h] = (0, r.useState)(''),
          { toast: _ } = (0, n.f)(),
          w = (0, c.f)({
            mutationFn: () => S.k.report(e.id, { reason: l, details: d }),
            onSuccess: () => {
              (_({
                title: 'Report sent',
                description: 'Thank you. A moderator will take a look.',
                variant: 'success',
              }),
                t(!1));
            },
          });
        return (0, a.jsx)(f.f, {
          open: s,
          onOpenChange: t,
          size: 'sm',
          children: (0, a.jsxs)('form', {
            onSubmit: (e) => {
              (e.preventDefault(), w.mutate());
            },
            children: [
              (0, a.jsxs)(g.f, {
                children: [(0, a.jsx)(y.f, { children: 'Report this post' }), (0, a.jsx)(p.f, {})],
              }),
              (0, a.jsxs)(m.f, {
                children: [
                  (0, a.jsx)(x.f, {
                    children: 'Reports go to the moderators. The author is not told who reported.',
                  }),
                  (0, a.jsxs)('div', {
                    className: L.default.fields,
                    children: [
                      (0, a.jsx)(v.f, {
                        label: 'Reason',
                        children: (0, a.jsx)(b.f, {
                          value: l,
                          onChange: (e) => o(e.target.value),
                          children: F.map((e) =>
                            (0, a.jsx)('option', { value: e.value, children: e.label }, e.value),
                          ),
                        }),
                      }),
                      (0, a.jsx)(v.f, {
                        label: 'Anything else we should know? (optional)',
                        children: (0, a.jsx)(C.f, {
                          rows: 3,
                          maxLength: 300,
                          value: d,
                          onChange: (e) => h(e.target.value),
                        }),
                      }),
                      w.isError &&
                        (0, a.jsx)(u.f, { variant: 'danger', children: w.error.message }),
                    ],
                  }),
                ],
              }),
              (0, a.jsxs)(j.f, {
                children: [
                  (0, a.jsx)(i.f, { onClick: () => t(!1), children: 'Cancel' }),
                  (0, a.jsx)(i.f, {
                    type: 'submit',
                    variant: 'primary',
                    loading: w.isPending,
                    children: 'Send report',
                  }),
                ],
              }),
            ],
          }),
        });
      }
      function E({ post: e, open: s, onOpenChange: t }) {
        let { toast: l } = (0, n.f)(),
          r = (0, k.d)(),
          o = (0, c.f)({
            mutationFn: () => S.k.block(e.author.handle),
            onSuccess: () => {
              (l({ title: `Blocked @${e.author.handle}`, variant: 'success' }),
                r.removeQueries({ queryKey: ['feed'] }),
                r.removeQueries({ queryKey: ['posts'] }),
                r.invalidateQueries({ queryKey: ['feed'] }),
                r.invalidateQueries({ queryKey: ['blocked'] }),
                t(!1));
            },
          });
        return (0, a.jsxs)(f.f, {
          open: s,
          onOpenChange: t,
          size: 'sm',
          role: 'alertdialog',
          children: [
            (0, a.jsxs)(g.f, {
              children: [
                (0, a.jsxs)(y.f, { children: ['Block @', e.author.handle, '?'] }),
                (0, a.jsx)(p.f, {}),
              ],
            }),
            (0, a.jsxs)(m.f, {
              children: [
                (0, a.jsx)(x.f, {
                  children:
                    'You will not see their posts, and they will not see yours or be able to follow you. You can undo this in your settings.',
                }),
                o.isError && (0, a.jsx)(u.f, { variant: 'danger', children: o.error.message }),
              ],
            }),
            (0, a.jsxs)(j.f, {
              children: [
                (0, a.jsx)(i.f, { onClick: () => t(!1), children: 'Cancel' }),
                (0, a.jsx)(i.f, {
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
      let P = /(^|[^a-z0-9_])@([a-z0-9_]{3,30})(?![a-z0-9_])/gi;
      function R({ text: e, className: s }) {
        return (0, a.jsx)('p', {
          className: s,
          children: (function (e) {
            let a = [],
              s = 0;
            for (let t of e.matchAll(P)) {
              let i = t.index + t[1].length;
              (i > s && a.push({ text: e.slice(s, i) }),
                a.push({ text: `@${t[2]}`, mention: t[2].toLowerCase() }),
                (s = i + 1 + t[2].length));
            }
            return (s < e.length && a.push({ text: e.slice(s) }), a);
          })(e).map((e, s) =>
            e.mention
              ? (0, a.jsx)(l.default, { href: `/u/${e.mention}`, children: e.text }, s)
              : e.text,
          ),
        });
      }
      var z = e.i(45001);
      let A = (0, r.forwardRef)(function ({ post: e, detail: r = !1, className: c, ...u }, f) {
        let { data: m } = (0, o.U)(),
          { toast: p } = (0, n.f)(),
          x = (0, o.R)(),
          j = m?.id === e.author.id,
          g = new Date(e.createdAt);
        return (0, a.jsxs)('article', {
          ref: f,
          tabIndex: 0,
          'aria-label': `Post by ${e.author.name}`,
          className: [z.default.post, c].filter(Boolean).join(' '),
          ...u,
          children: [
            (0, a.jsx)(s.f, { name: e.author.name, size: 'lg' }),
            (0, a.jsxs)('div', {
              className: z.default.body,
              children: [
                (0, a.jsxs)('header', {
                  className: z.default.meta,
                  children: [
                    (0, a.jsx)(l.default, {
                      href: `/u/${e.author.handle}`,
                      className: z.default.name,
                      children: e.author.name,
                    }),
                    (0, a.jsxs)('span', {
                      className: z.default.handle,
                      children: ['@', e.author.handle],
                    }),
                    (0, a.jsx)('time', {
                      className: z.default.time,
                      dateTime: e.createdAt,
                      title: g.toLocaleString(),
                      children: (0, d.f)(e.createdAt),
                    }),
                    'followers' === e.visibility &&
                      (0, a.jsx)(t.f, { variant: 'neutral', children: 'Followers only' }),
                    'community' === e.visibility &&
                      (0, a.jsx)(t.f, { variant: 'neutral', children: 'Members only' }),
                    e.community &&
                      (0, a.jsx)(l.default, {
                        href: `/c/${e.community.slug}`,
                        className: z.default.community,
                        children: e.community.name,
                      }),
                  ],
                }),
                (0, a.jsx)(R, { text: e.text, className: z.default.text }),
                (0, a.jsx)(h.f, { post: e }),
                (0, a.jsxs)('footer', {
                  className: z.default.actions,
                  children: [
                    (0, a.jsxs)(i.f, {
                      variant: 'ghost',
                      size: 'sm',
                      'aria-pressed': e.reacted,
                      className: z.default.like,
                      onClick: () =>
                        x.mutate(
                          { post: e },
                          {
                            onError: (e) =>
                              p({
                                title: 'Could not update your like',
                                description: e.message,
                                variant: 'danger',
                              }),
                          },
                        ),
                      children: ['Like · ', e.counts.reactions],
                    }),
                    r
                      ? (0, a.jsxs)('span', {
                          className: z.default.replies,
                          children: ['Replies · ', e.counts.replies],
                        })
                      : (0, a.jsxs)(l.default, {
                          href: `/p/${e.id}`,
                          className: z.default.replyLink,
                          children: ['Reply · ', e.counts.replies],
                        }),
                    (0, a.jsx)('span', { className: z.default.spacer }),
                    (0, a.jsx)(T, { post: e, isOwn: j }),
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
      var a = e.i(43476),
        s = e.i(32345);
      e.i(24856);
      var t = e.i(21138),
        i = e.i(46977);
      e.s(
        [
          'f',
          0,
          function ({ post: e }) {
            return 0 === e.media.length
              ? null
              : (0, a.jsx)('div', {
                  className: i.default.grid,
                  'data-count': e.media.length,
                  children: e.media.map((n) =>
                    'ready' === n.status && n.width && n.height
                      ? (0, a.jsx)(
                          'img',
                          {
                            className: i.default.image,
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
                      : (0, a.jsx)(s.f, { className: i.default.image, height: '12rem' }, n.id),
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
      var a = e.i(43476),
        s = e.i(60450),
        t = e.i(70684),
        i = e.i(32345),
        n = e.i(22016),
        l = e.i(48804);
      e.s([
        'f',
        0,
        function ({ children: e }) {
          let r = (0, l.U)();
          return r.isPending
            ? (0, a.jsx)(i.f, { height: '8rem', 'aria-busy': 'true' })
            : r.isError
              ? (0, a.jsx)(s.f, {
                  variant: 'danger',
                  title: 'Could not reach Pulse',
                  children: (0, a.jsx)(t.f, {
                    size: 'sm',
                    onClick: () => r.refetch(),
                    children: 'Try again',
                  }),
                })
              : r.data
                ? (0, a.jsx)(a.Fragment, { children: e(r.data) })
                : (0, a.jsx)(s.f, {
                    variant: 'info',
                    title: 'Sign in to continue',
                    children: (0, a.jsx)(n.default, {
                      href: '/',
                      children: 'Go to the start page',
                    }),
                  });
        },
      ]);
    },
    96739,
    (e) => {
      var a = e.i(43476),
        s = e.i(60450),
        t = e.i(64300),
        i = e.i(59760),
        n = e.i(69798),
        l = e.i(84294),
        r = e.i(67726),
        o = e.i(22016),
        d = e.i(71645),
        h = e.i(48804),
        c = e.i(66081),
        u = e.i(14346),
        f = e.i(62306);
      function m() {
        let [e, u] = (0, d.useState)(''),
          [m, p] = (0, d.useState)('');
        (0, d.useEffect)(() => {
          let a = setTimeout(() => p(e), 300);
          return () => clearTimeout(a);
        }, [e]);
        let x = (0, h.u)(m),
          j = x.data && 0 === x.data.users.length && 0 === x.data.posts.length;
        return (0, a.jsxs)('div', {
          className: f.default.page,
          children: [
            (0, a.jsx)('h1', { className: f.default.title, children: 'Search' }),
            (0, a.jsx)(l.f, {
              label: 'Search people and posts',
              description: 'Type at least two characters.',
              children: (0, a.jsx)(n.f, {
                type: 'search',
                value: e,
                onChange: (e) => u(e.target.value),
                autoComplete: 'off',
              }),
            }),
            (0, a.jsxs)('div', {
              'aria-live': 'polite',
              children: [
                x.isFetching && (0, a.jsx)(r.f, { label: 'Searching' }),
                x.isError && (0, a.jsx)(s.f, { variant: 'danger', children: x.error.message }),
                j &&
                  (0, a.jsx)(i.f, {
                    icon: 'search',
                    title: 'No results',
                    description: 'Try a different word, or a handle.',
                  }),
              ],
            }),
            x.data &&
              x.data.users.length > 0 &&
              (0, a.jsxs)('section', {
                'aria-labelledby': 'people',
                children: [
                  (0, a.jsx)('h2', {
                    id: 'people',
                    className: f.default.subtitle,
                    children: 'People',
                  }),
                  (0, a.jsx)('ul', {
                    className: f.default.people,
                    children: x.data.users.map((e) =>
                      (0, a.jsx)(
                        'li',
                        {
                          children: (0, a.jsxs)(o.default, {
                            href: `/u/${e.handle}`,
                            className: f.default.person,
                            children: [
                              (0, a.jsx)(t.f, { name: e.name, size: 'sm' }),
                              (0, a.jsx)('span', { children: e.name }),
                              (0, a.jsxs)('span', {
                                className: f.default.handle,
                                children: ['@', e.handle],
                              }),
                            ],
                          }),
                        },
                        e.id,
                      ),
                    ),
                  }),
                ],
              }),
            x.data &&
              x.data.posts.length > 0 &&
              (0, a.jsxs)('section', {
                'aria-labelledby': 'posts',
                children: [
                  (0, a.jsx)('h2', {
                    id: 'posts',
                    className: f.default.subtitle,
                    children: 'Posts',
                  }),
                  (0, a.jsx)('ul', {
                    className: f.default.posts,
                    children: x.data.posts.map((e) =>
                      (0, a.jsx)('li', { children: (0, a.jsx)(c.f, { post: e }) }, e.id),
                    ),
                  }),
                ],
              }),
          ],
        });
      }
      e.s([
        'default',
        0,
        function () {
          return (0, a.jsx)(u.f, { children: () => (0, a.jsx)(m, {}) });
        },
      ]);
    },
    47730,
    (e) => {
      let a = new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' }),
        s = new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' });
      e.s([
        'f',
        0,
        function (e, t = new Date()) {
          let i = new Date(e),
            n = t.getTime() - i.getTime();
          return n < 6e4
            ? 'just now'
            : n < 36e5
              ? `${Math.floor(n / 6e4)}m`
              : n < 864e5
                ? `${Math.floor(n / 36e5)}h`
                : n < 6048e5
                  ? `${Math.floor(n / 864e5)}d`
                  : (i.getFullYear() === t.getFullYear() ? a : s).format(i);
        },
      ]);
    },
    60450,
    70684,
    32345,
    (e) => {
      var a = e.i(42667);
      e.s(['f', () => a.A], 60450);
      var s = e.i(66078);
      e.s(['f', () => s.B], 70684);
      var t = e.i(21143);
      e.s(['f', () => t.S], 32345);
    },
    59760,
    (e) => {
      var a = e.i(79928);
      e.s(['f', () => a.E]);
    },
    84294,
    (e) => {
      var a = e.i(2675);
      e.s(['f', () => a.F]);
    },
    69798,
    (e) => {
      var a = e.i(32925);
      e.s(['f', () => a.I]);
    },
    45835,
    (e) => {
      var a = e.i(97741);
      e.s(['f', () => a.S]);
    },
    67726,
    (e) => {
      var a = e.i(67241);
      e.s(['f', () => a.S]);
    },
    98124,
    (e) => {
      var a = e.i(58744);
      e.s(['f', () => a.T]);
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
  62306,
  (e) => {
    e.v({
      handle: 'EF6_Qa_handle',
      page: 'EF6_Qa_page',
      people: 'EF6_Qa_people',
      person: 'EF6_Qa_person',
      posts: 'EF6_Qa_posts',
      subtitle: 'EF6_Qa_subtitle',
      title: 'EF6_Qa_title',
    });
  },
]);
