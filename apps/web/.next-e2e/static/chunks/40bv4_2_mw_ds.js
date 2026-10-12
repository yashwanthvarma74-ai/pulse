(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([
  'object' == typeof document ? document.currentScript : void 0,
  [
    66081,
    (e) => {
      var i = e.i(43476),
        t = e.i(64300),
        n = e.i(17738),
        a = e.i(70684),
        s = e.i(33290),
        r = e.i(22016),
        l = e.i(71645),
        o = e.i(48804),
        d = e.i(47730),
        c = e.i(92276),
        h = e.i(54616),
        u = e.i(60450),
        m = e.i(79230),
        f = e.i(70361),
        x = e.i(30448),
        j = e.i(99273),
        p = e.i(26103),
        g = e.i(78060),
        y = e.i(28352),
        v = e.i(84294),
        b = e.i(58090),
        _ = e.i(45835),
        w = e.i(67726),
        C = e.i(98124),
        k = e.i(66027),
        N = e.i(12598),
        L = e.i(94108),
        S = e.i(79750);
      let $ = [
        { value: 'spam', label: 'Spam' },
        { value: 'harassment', label: 'Harassment' },
        { value: 'misinformation', label: 'Misleading information' },
        { value: 'other', label: 'Something else' },
      ];
      function G({ post: e, isOwn: t }) {
        let [n, a] = (0, l.useState)(null),
          s = (0, l.useRef)(null),
          r = (e) => {
            e ||
              (a(null), requestAnimationFrame(() => s.current?.querySelector('button')?.focus()));
          };
        return (0, i.jsxs)('span', {
          ref: s,
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
                      onAction: () => a('why'),
                      children: 'Why am I seeing this?',
                    }),
                    !t &&
                      (0, i.jsx)(b.f.Item, {
                        id: 'report',
                        onAction: () => a('report'),
                        children: 'Report this post',
                      }),
                    !t &&
                      (0, i.jsxs)(b.f.Item, {
                        id: 'block',
                        danger: !0,
                        onAction: () => a('block'),
                        children: ['Block @', e.author.handle],
                      }),
                  ],
                }),
              ],
            }),
            (0, i.jsx)(P, { post: e, open: 'why' === n, onOpenChange: r }),
            (0, i.jsx)(q, { post: e, open: 'report' === n, onOpenChange: r }),
            (0, i.jsx)(R, { post: e, open: 'block' === n, onOpenChange: r }),
          ],
        });
      }
      function P({ post: e, open: t, onOpenChange: n }) {
        let a = (0, k.f)({ queryKey: ['why', e.id], queryFn: () => L.k.why(e.id), enabled: t });
        return (0, i.jsxs)(m.f, {
          open: t,
          onOpenChange: n,
          size: 'sm',
          children: [
            (0, i.jsxs)(g.f, {
              children: [
                (0, i.jsx)(y.f, { children: 'Why am I seeing this?' }),
                (0, i.jsx)(x.f, {}),
              ],
            }),
            (0, i.jsxs)(f.f, {
              children: [
                (0, i.jsx)(j.f, {
                  children: 'These are the reasons behind where this post sits in your feed.',
                }),
                a.isPending && (0, i.jsx)(w.f, { label: 'Loading the reasons' }),
                a.isError && (0, i.jsx)(u.f, { variant: 'danger', children: a.error.message }),
                a.data &&
                  (a.data.reasons.length > 0
                    ? (0, i.jsx)('ul', {
                        className: S.default.reasons,
                        children: a.data.reasons.map((e) => (0, i.jsx)('li', { children: e }, e)),
                      })
                    : (0, i.jsx)('p', {
                        className: S.default.plain,
                        children:
                          'Nothing in particular. It is just one of the newer posts you can see.',
                      })),
              ],
            }),
          ],
        });
      }
      function q({ post: e, open: t, onOpenChange: n }) {
        let [r, o] = (0, l.useState)('spam'),
          [d, c] = (0, l.useState)(''),
          { toast: b } = (0, s.f)(),
          w = (0, h.f)({
            mutationFn: () => L.k.report(e.id, { reason: r, details: d }),
            onSuccess: () => {
              (b({
                title: 'Report sent',
                description: 'Thank you. A moderator will take a look.',
                variant: 'success',
              }),
                n(!1));
            },
          });
        return (0, i.jsx)(m.f, {
          open: t,
          onOpenChange: n,
          size: 'sm',
          children: (0, i.jsxs)('form', {
            onSubmit: (e) => {
              (e.preventDefault(), w.mutate());
            },
            children: [
              (0, i.jsxs)(g.f, {
                children: [(0, i.jsx)(y.f, { children: 'Report this post' }), (0, i.jsx)(x.f, {})],
              }),
              (0, i.jsxs)(f.f, {
                children: [
                  (0, i.jsx)(j.f, {
                    children: 'Reports go to the moderators. The author is not told who reported.',
                  }),
                  (0, i.jsxs)('div', {
                    className: S.default.fields,
                    children: [
                      (0, i.jsx)(v.f, {
                        label: 'Reason',
                        children: (0, i.jsx)(_.f, {
                          value: r,
                          onChange: (e) => o(e.target.value),
                          children: $.map((e) =>
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
                          onChange: (e) => c(e.target.value),
                        }),
                      }),
                      w.isError &&
                        (0, i.jsx)(u.f, { variant: 'danger', children: w.error.message }),
                    ],
                  }),
                ],
              }),
              (0, i.jsxs)(p.f, {
                children: [
                  (0, i.jsx)(a.f, { onClick: () => n(!1), children: 'Cancel' }),
                  (0, i.jsx)(a.f, {
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
      function R({ post: e, open: t, onOpenChange: n }) {
        let { toast: r } = (0, s.f)(),
          l = (0, N.d)(),
          o = (0, h.f)({
            mutationFn: () => L.k.block(e.author.handle),
            onSuccess: () => {
              (r({ title: `Blocked @${e.author.handle}`, variant: 'success' }),
                l.removeQueries({ queryKey: ['feed'] }),
                l.removeQueries({ queryKey: ['posts'] }),
                l.invalidateQueries({ queryKey: ['feed'] }),
                l.invalidateQueries({ queryKey: ['blocked'] }),
                n(!1));
            },
          });
        return (0, i.jsxs)(m.f, {
          open: t,
          onOpenChange: n,
          size: 'sm',
          role: 'alertdialog',
          children: [
            (0, i.jsxs)(g.f, {
              children: [
                (0, i.jsxs)(y.f, { children: ['Block @', e.author.handle, '?'] }),
                (0, i.jsx)(x.f, {}),
              ],
            }),
            (0, i.jsxs)(f.f, {
              children: [
                (0, i.jsx)(j.f, {
                  children:
                    'You will not see their posts, and they will not see yours or be able to follow you. You can undo this in your settings.',
                }),
                o.isError && (0, i.jsx)(u.f, { variant: 'danger', children: o.error.message }),
              ],
            }),
            (0, i.jsxs)(p.f, {
              children: [
                (0, i.jsx)(a.f, { onClick: () => n(!1), children: 'Cancel' }),
                (0, i.jsx)(a.f, {
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
      let T = /(^|[^a-z0-9_])@([a-z0-9_]{3,30})(?![a-z0-9_])/gi;
      function V({ text: e, className: t }) {
        return (0, i.jsx)('p', {
          className: t,
          children: (function (e) {
            let i = [],
              t = 0;
            for (let n of e.matchAll(T)) {
              let a = n.index + n[1].length;
              (a > t && i.push({ text: e.slice(t, a) }),
                i.push({ text: `@${n[2]}`, mention: n[2].toLowerCase() }),
                (t = a + 1 + n[2].length));
            }
            return (t < e.length && i.push({ text: e.slice(t) }), i);
          })(e).map((e, t) =>
            e.mention
              ? (0, i.jsx)(r.default, { href: `/u/${e.mention}`, children: e.text }, t)
              : e.text,
          ),
        });
      }
      var A = e.i(45001);
      let z = (0, l.forwardRef)(function ({ post: e, detail: l = !1, className: h, ...u }, m) {
        let { data: f } = (0, o.U)(),
          { toast: x } = (0, s.f)(),
          j = (0, o.R)(),
          p = f?.id === e.author.id,
          g = new Date(e.createdAt);
        return (0, i.jsxs)('article', {
          ref: m,
          tabIndex: 0,
          'aria-label': `Post by ${e.author.name}`,
          className: [A.default.post, h].filter(Boolean).join(' '),
          ...u,
          children: [
            (0, i.jsx)(t.f, { name: e.author.name, size: 'lg' }),
            (0, i.jsxs)('div', {
              className: A.default.body,
              children: [
                (0, i.jsxs)('header', {
                  className: A.default.meta,
                  children: [
                    (0, i.jsx)(r.default, {
                      href: `/u/${e.author.handle}`,
                      className: A.default.name,
                      children: e.author.name,
                    }),
                    (0, i.jsxs)('span', {
                      className: A.default.handle,
                      children: ['@', e.author.handle],
                    }),
                    (0, i.jsx)('time', {
                      className: A.default.time,
                      dateTime: e.createdAt,
                      title: g.toLocaleString(),
                      children: (0, d.f)(e.createdAt),
                    }),
                    'followers' === e.visibility &&
                      (0, i.jsx)(n.f, { variant: 'neutral', children: 'Followers only' }),
                    'community' === e.visibility &&
                      (0, i.jsx)(n.f, { variant: 'neutral', children: 'Members only' }),
                    e.community &&
                      (0, i.jsx)(r.default, {
                        href: `/c/${e.community.slug}`,
                        className: A.default.community,
                        children: e.community.name,
                      }),
                  ],
                }),
                (0, i.jsx)(V, { text: e.text, className: A.default.text }),
                (0, i.jsx)(c.f, { post: e }),
                (0, i.jsxs)('footer', {
                  className: A.default.actions,
                  children: [
                    (0, i.jsxs)(a.f, {
                      variant: 'ghost',
                      size: 'sm',
                      'aria-pressed': e.reacted,
                      className: A.default.like,
                      onClick: () =>
                        j.mutate(
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
                          className: A.default.replies,
                          children: ['Replies · ', e.counts.replies],
                        })
                      : (0, i.jsxs)(r.default, {
                          href: `/p/${e.id}`,
                          className: A.default.replyLink,
                          children: ['Reply · ', e.counts.replies],
                        }),
                    (0, i.jsx)('span', { className: A.default.spacer }),
                    (0, i.jsx)(G, { post: e, isOwn: p }),
                  ],
                }),
              ],
            }),
          ],
        });
      });
      e.s(['f', 0, z], 66081);
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
        t = e.i(32345);
      e.i(24856);
      var n = e.i(21138),
        a = e.i(46977);
      e.s(
        [
          'f',
          0,
          function ({ post: e }) {
            return 0 === e.media.length
              ? null
              : (0, i.jsx)('div', {
                  className: a.default.grid,
                  'data-count': e.media.length,
                  children: e.media.map((s) =>
                    'ready' === s.status && s.width && s.height
                      ? (0, i.jsx)(
                          'img',
                          {
                            className: a.default.image,
                            src: `/api/media/${s.id}/640`,
                            srcSet: n.w.map((e) => `/api/media/${s.id}/${e} ${e}w`).join(', '),
                            sizes: '(max-width: 700px) 100vw, 600px',
                            width: s.width,
                            height: s.height,
                            style: {
                              aspectRatio: 1 === e.media.length ? `${s.width} / ${s.height}` : '1',
                            },
                            loading: 'lazy',
                            decoding: 'async',
                            alt: `Photo in ${e.author.name}'s post`,
                          },
                          s.id,
                        )
                      : (0, i.jsx)(t.f, { className: a.default.image, height: '12rem' }, s.id),
                  ),
                });
          },
        ],
        92276,
      );
      var s = e.i(69778);
      (e.s(['f', () => s.D], 79230),
        e.s(['f', () => s.a], 70361),
        e.s(['f', () => s.b], 30448),
        e.s(['f', () => s.c], 99273),
        e.s(['f', () => s.d], 26103),
        e.s(['f', () => s.e], 78060),
        e.s(['f', () => s.f], 28352));
    },
    41341,
    (e) => {
      var i = e.i(43476),
        t = e.i(60450),
        n = e.i(17738),
        a = e.i(70684),
        s = e.i(32345),
        r = e.i(22016),
        l = e.i(48804),
        o = e.i(28840),
        d = e.i(92179),
        c = e.i(14346),
        h = e.i(91385);
      function u({ slug: e, user: c }) {
        let m = (0, l.S)(e),
          f = (0, l.x)(e);
        if (m.isPending) return (0, i.jsx)(s.f, { height: '8rem', 'aria-busy': 'true' });
        if (m.isError)
          return (0, i.jsx)(t.f, {
            variant: 'info',
            title: 'No such community',
            children: (0, i.jsx)(r.default, {
              href: '/communities',
              children: 'See all communities',
            }),
          });
        let x = m.data,
          j = f.join.error ?? f.leave.error;
        return (0, i.jsxs)('div', {
          className: h.default.page,
          children: [
            (0, i.jsxs)('header', {
              className: h.default.header,
              children: [
                (0, i.jsxs)('div', {
                  className: h.default.who,
                  children: [
                    (0, i.jsx)('h1', { className: h.default.name, children: x.name }),
                    (0, i.jsx)('p', { className: h.default.description, children: x.description }),
                    (0, i.jsx)('p', {
                      className: h.default.count,
                      children: (0, i.jsxs)(n.f, {
                        variant: 'neutral',
                        children: [x.memberCount, ' ', 1 === x.memberCount ? 'member' : 'members'],
                      }),
                    }),
                  ],
                }),
                (0, i.jsx)(a.f, {
                  variant: x.joined ? 'secondary' : 'primary',
                  'aria-pressed': x.joined,
                  loading: f.join.isPending || f.leave.isPending,
                  onClick: () => (x.joined ? f.leave.mutate() : f.join.mutate()),
                  children: x.joined ? 'Joined' : 'Join',
                }),
              ],
            }),
            j && (0, i.jsx)(t.f, { variant: 'danger', children: j.message }),
            x.joined
              ? (0, i.jsx)(o.f, {
                  user: c,
                  community: { id: x.id, name: x.name },
                  feedKeys: [(0, l.F)({ kind: 'community', slug: e })],
                })
              : (0, i.jsx)('p', {
                  className: h.default.note,
                  children:
                    'Join this community to post in it. You can read everything marked for everyone.',
                }),
            (0, i.jsx)(d.f, {
              source: { kind: 'community', slug: e },
              label: `Posts in ${x.name}`,
              empty: {
                title: 'No posts yet',
                description: x.joined
                  ? 'Start the conversation above.'
                  : 'Join to start the conversation.',
              },
            }),
          ],
        });
      }
      e.s([
        'default',
        0,
        function ({ slug: e }) {
          return (0, i.jsx)(c.f, { children: (t) => (0, i.jsx)(u, { slug: e, user: t }) });
        },
      ]);
    },
    14346,
    (e) => {
      var i = e.i(43476),
        t = e.i(60450),
        n = e.i(70684),
        a = e.i(32345),
        s = e.i(22016),
        r = e.i(48804);
      e.s([
        'f',
        0,
        function ({ children: e }) {
          let l = (0, r.U)();
          return l.isPending
            ? (0, i.jsx)(a.f, { height: '8rem', 'aria-busy': 'true' })
            : l.isError
              ? (0, i.jsx)(t.f, {
                  variant: 'danger',
                  title: 'Could not reach Pulse',
                  children: (0, i.jsx)(n.f, {
                    size: 'sm',
                    onClick: () => l.refetch(),
                    children: 'Try again',
                  }),
                })
              : l.data
                ? (0, i.jsx)(i.Fragment, { children: e(l.data) })
                : (0, i.jsx)(t.f, {
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
    47730,
    (e) => {
      let i = new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' }),
        t = new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' });
      e.s([
        'f',
        0,
        function (e, n = new Date()) {
          let a = new Date(e),
            s = n.getTime() - a.getTime();
          return s < 6e4
            ? 'just now'
            : s < 36e5
              ? `${Math.floor(s / 6e4)}m`
              : s < 864e5
                ? `${Math.floor(s / 36e5)}h`
                : s < 6048e5
                  ? `${Math.floor(s / 864e5)}d`
                  : (a.getFullYear() === n.getFullYear() ? i : t).format(a);
        },
      ]);
    },
    60450,
    70684,
    32345,
    (e) => {
      var i = e.i(42667);
      e.s(['f', () => i.A], 60450);
      var t = e.i(66078);
      e.s(['f', () => t.B], 70684);
      var n = e.i(21143);
      e.s(['f', () => n.S], 32345);
    },
    59760,
    (e) => {
      var i = e.i(79928);
      e.s(['f', () => i.E]);
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
  91385,
  (e) => {
    e.v({
      count: 'ntVVZq_count',
      description: 'ntVVZq_description',
      header: 'ntVVZq_header',
      name: 'ntVVZq_name',
      note: 'ntVVZq_note',
      page: 'ntVVZq_page',
      who: 'ntVVZq_who',
    });
  },
]);
