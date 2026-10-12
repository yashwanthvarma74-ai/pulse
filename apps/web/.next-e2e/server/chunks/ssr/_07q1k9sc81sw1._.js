module.exports = [
  [
    81825,
    (a) => {
      var b = a.i(87924),
        c = a.i(35033),
        d = a.i(98441),
        e = a.i(87436),
        f = a.i(20698),
        g = a.i(38246),
        h = a.i(72131),
        i = a.i(21890),
        j = a.i(25255),
        k = a.i(63016),
        l = a.i(70025),
        m = a.i(90985),
        n = a.i(52975),
        o = a.i(42410),
        p = a.i(12278),
        q = a.i(33566),
        r = a.i(9852),
        s = a.i(8723),
        t = a.i(49099),
        u = a.i(31459),
        v = a.i(50002),
        w = a.i(38579),
        x = a.i(66e3),
        y = a.i(52728),
        z = a.i(33217),
        A = a.i(37927),
        B = a.i(69844),
        C = a.i(14582);
      let D = [
        { value: 'spam', label: 'Spam' },
        { value: 'harassment', label: 'Harassment' },
        { value: 'misinformation', label: 'Misleading information' },
        { value: 'other', label: 'Something else' },
      ];
      function E({ post: a, isOwn: c }) {
        let [d, e] = (0, h.useState)(null),
          f = (0, h.useRef)(null),
          g = (a) => {
            a ||
              (e(null), requestAnimationFrame(() => f.current?.querySelector('button')?.focus()));
          };
        return (0, b.jsxs)('span', {
          ref: f,
          children: [
            (0, b.jsxs)(v.f, {
              children: [
                (0, b.jsx)(v.f.Trigger, {
                  variant: 'ghost',
                  size: 'sm',
                  'aria-label': `More actions for ${a.author.name}'s post`,
                  children: 'More',
                }),
                (0, b.jsxs)(v.f.Content, {
                  'aria-label': 'Post actions',
                  placement: 'bottom end',
                  children: [
                    (0, b.jsx)(v.f.Item, {
                      id: 'why',
                      onAction: () => e('why'),
                      children: 'Why am I seeing this?',
                    }),
                    !c &&
                      (0, b.jsx)(v.f.Item, {
                        id: 'report',
                        onAction: () => e('report'),
                        children: 'Report this post',
                      }),
                    !c &&
                      (0, b.jsxs)(v.f.Item, {
                        id: 'block',
                        danger: !0,
                        onAction: () => e('block'),
                        children: ['Block @', a.author.handle],
                      }),
                  ],
                }),
              ],
            }),
            (0, b.jsx)(F, { post: a, open: 'why' === d, onOpenChange: g }),
            (0, b.jsx)(G, { post: a, open: 'report' === d, onOpenChange: g }),
            (0, b.jsx)(H, { post: a, open: 'block' === d, onOpenChange: g }),
          ],
        });
      }
      function F({ post: a, open: c, onOpenChange: d }) {
        let e = (0, z.f)({ queryKey: ['why', a.id], queryFn: () => B.k.why(a.id), enabled: c });
        return (0, b.jsxs)(n.f, {
          open: c,
          onOpenChange: d,
          size: 'sm',
          children: [
            (0, b.jsxs)(s.f, {
              children: [
                (0, b.jsx)(t.f, { children: 'Why am I seeing this?' }),
                (0, b.jsx)(p.f, {}),
              ],
            }),
            (0, b.jsxs)(o.f, {
              children: [
                (0, b.jsx)(q.f, {
                  children: 'These are the reasons behind where this post sits in your feed.',
                }),
                e.isPending && (0, b.jsx)(x.f, { label: 'Loading the reasons' }),
                e.isError && (0, b.jsx)(m.f, { variant: 'danger', children: e.error.message }),
                e.data &&
                  (e.data.reasons.length > 0
                    ? (0, b.jsx)('ul', {
                        className: C.default.reasons,
                        children: e.data.reasons.map((a) => (0, b.jsx)('li', { children: a }, a)),
                      })
                    : (0, b.jsx)('p', {
                        className: C.default.plain,
                        children:
                          'Nothing in particular. It is just one of the newer posts you can see.',
                      })),
              ],
            }),
          ],
        });
      }
      function G({ post: a, open: c, onOpenChange: d }) {
        let [g, i] = (0, h.useState)('spam'),
          [j, k] = (0, h.useState)(''),
          { toast: v } = (0, f.f)(),
          x = (0, l.f)({
            mutationFn: () => B.k.report(a.id, { reason: g, details: j }),
            onSuccess: () => {
              (v({
                title: 'Report sent',
                description: 'Thank you. A moderator will take a look.',
                variant: 'success',
              }),
                d(!1));
            },
          });
        return (0, b.jsx)(n.f, {
          open: c,
          onOpenChange: d,
          size: 'sm',
          children: (0, b.jsxs)('form', {
            onSubmit: (a) => {
              (a.preventDefault(), x.mutate());
            },
            children: [
              (0, b.jsxs)(s.f, {
                children: [(0, b.jsx)(t.f, { children: 'Report this post' }), (0, b.jsx)(p.f, {})],
              }),
              (0, b.jsxs)(o.f, {
                children: [
                  (0, b.jsx)(q.f, {
                    children: 'Reports go to the moderators. The author is not told who reported.',
                  }),
                  (0, b.jsxs)('div', {
                    className: C.default.fields,
                    children: [
                      (0, b.jsx)(u.f, {
                        label: 'Reason',
                        children: (0, b.jsx)(w.f, {
                          value: g,
                          onChange: (a) => i(a.target.value),
                          children: D.map((a) =>
                            (0, b.jsx)('option', { value: a.value, children: a.label }, a.value),
                          ),
                        }),
                      }),
                      (0, b.jsx)(u.f, {
                        label: 'Anything else we should know? (optional)',
                        children: (0, b.jsx)(y.f, {
                          rows: 3,
                          maxLength: 300,
                          value: j,
                          onChange: (a) => k(a.target.value),
                        }),
                      }),
                      x.isError &&
                        (0, b.jsx)(m.f, { variant: 'danger', children: x.error.message }),
                    ],
                  }),
                ],
              }),
              (0, b.jsxs)(r.f, {
                children: [
                  (0, b.jsx)(e.f, { onClick: () => d(!1), children: 'Cancel' }),
                  (0, b.jsx)(e.f, {
                    type: 'submit',
                    variant: 'primary',
                    loading: x.isPending,
                    children: 'Send report',
                  }),
                ],
              }),
            ],
          }),
        });
      }
      function H({ post: a, open: c, onOpenChange: d }) {
        let { toast: g } = (0, f.f)(),
          h = (0, A.d)(),
          i = (0, l.f)({
            mutationFn: () => B.k.block(a.author.handle),
            onSuccess: () => {
              (g({ title: `Blocked @${a.author.handle}`, variant: 'success' }),
                h.removeQueries({ queryKey: ['feed'] }),
                h.removeQueries({ queryKey: ['posts'] }),
                h.invalidateQueries({ queryKey: ['feed'] }),
                h.invalidateQueries({ queryKey: ['blocked'] }),
                d(!1));
            },
          });
        return (0, b.jsxs)(n.f, {
          open: c,
          onOpenChange: d,
          size: 'sm',
          role: 'alertdialog',
          children: [
            (0, b.jsxs)(s.f, {
              children: [
                (0, b.jsxs)(t.f, { children: ['Block @', a.author.handle, '?'] }),
                (0, b.jsx)(p.f, {}),
              ],
            }),
            (0, b.jsxs)(o.f, {
              children: [
                (0, b.jsx)(q.f, {
                  children:
                    'You will not see their posts, and they will not see yours or be able to follow you. You can undo this in your settings.',
                }),
                i.isError && (0, b.jsx)(m.f, { variant: 'danger', children: i.error.message }),
              ],
            }),
            (0, b.jsxs)(r.f, {
              children: [
                (0, b.jsx)(e.f, { onClick: () => d(!1), children: 'Cancel' }),
                (0, b.jsx)(e.f, {
                  variant: 'danger',
                  loading: i.isPending,
                  onClick: () => i.mutate(),
                  children: 'Block',
                }),
              ],
            }),
          ],
        });
      }
      a.i(9241);
      let I = /(^|[^a-z0-9_])@([a-z0-9_]{3,30})(?![a-z0-9_])/gi;
      function J({ text: a, className: c }) {
        return (0, b.jsx)('p', {
          className: c,
          children: (function (a) {
            let b = [],
              c = 0;
            for (let d of a.matchAll(I)) {
              let e = d.index + d[1].length;
              (e > c && b.push({ text: a.slice(c, e) }),
                b.push({ text: `@${d[2]}`, mention: d[2].toLowerCase() }),
                (c = e + 1 + d[2].length));
            }
            return (c < a.length && b.push({ text: a.slice(c) }), b);
          })(a).map((a, c) =>
            a.mention
              ? (0, b.jsx)(g.default, { href: `/u/${a.mention}`, children: a.text }, c)
              : a.text,
          ),
        });
      }
      var K = a.i(94716);
      let L = (0, h.forwardRef)(function ({ post: a, detail: h = !1, className: l, ...m }, n) {
        let { data: o } = (0, i.U)(),
          { toast: p } = (0, f.f)(),
          q = (0, i.R)(),
          r = o?.id === a.author.id,
          s = new Date(a.createdAt);
        return (0, b.jsxs)('article', {
          ref: n,
          tabIndex: 0,
          'aria-label': `Post by ${a.author.name}`,
          className: [K.default.post, l].filter(Boolean).join(' '),
          ...m,
          children: [
            (0, b.jsx)(c.f, { name: a.author.name, size: 'lg' }),
            (0, b.jsxs)('div', {
              className: K.default.body,
              children: [
                (0, b.jsxs)('header', {
                  className: K.default.meta,
                  children: [
                    (0, b.jsx)(g.default, {
                      href: `/u/${a.author.handle}`,
                      className: K.default.name,
                      children: a.author.name,
                    }),
                    (0, b.jsxs)('span', {
                      className: K.default.handle,
                      children: ['@', a.author.handle],
                    }),
                    (0, b.jsx)('time', {
                      className: K.default.time,
                      dateTime: a.createdAt,
                      title: s.toLocaleString(),
                      children: (0, j.f)(a.createdAt),
                    }),
                    'followers' === a.visibility &&
                      (0, b.jsx)(d.f, { variant: 'neutral', children: 'Followers only' }),
                    'community' === a.visibility &&
                      (0, b.jsx)(d.f, { variant: 'neutral', children: 'Members only' }),
                    a.community &&
                      (0, b.jsx)(g.default, {
                        href: `/c/${a.community.slug}`,
                        className: K.default.community,
                        children: a.community.name,
                      }),
                  ],
                }),
                (0, b.jsx)(J, { text: a.text, className: K.default.text }),
                (0, b.jsx)(k.f, { post: a }),
                (0, b.jsxs)('footer', {
                  className: K.default.actions,
                  children: [
                    (0, b.jsxs)(e.f, {
                      variant: 'ghost',
                      size: 'sm',
                      'aria-pressed': a.reacted,
                      className: K.default.like,
                      onClick: () =>
                        q.mutate(
                          { post: a },
                          {
                            onError: (a) =>
                              p({
                                title: 'Could not update your like',
                                description: a.message,
                                variant: 'danger',
                              }),
                          },
                        ),
                      children: ['Like · ', a.counts.reactions],
                    }),
                    h
                      ? (0, b.jsxs)('span', {
                          className: K.default.replies,
                          children: ['Replies · ', a.counts.replies],
                        })
                      : (0, b.jsxs)(g.default, {
                          href: `/p/${a.id}`,
                          className: K.default.replyLink,
                          children: ['Reply · ', a.counts.replies],
                        }),
                    (0, b.jsx)('span', { className: K.default.spacer }),
                    (0, b.jsx)(E, { post: a, isOwn: r }),
                  ],
                }),
              ],
            }),
          ],
        });
      });
      a.s(['f', 0, L], 81825);
    },
    63016,
    52975,
    42410,
    12278,
    33566,
    9852,
    8723,
    49099,
    (a) => {
      var b = a.i(87924),
        c = a.i(64572);
      a.i(9241);
      var d = a.i(94455),
        e = a.i(37849);
      a.s(
        [
          'f',
          0,
          function ({ post: a }) {
            return 0 === a.media.length
              ? null
              : (0, b.jsx)('div', {
                  className: e.default.grid,
                  'data-count': a.media.length,
                  children: a.media.map((f) =>
                    'ready' === f.status && f.width && f.height
                      ? (0, b.jsx)(
                          'img',
                          {
                            className: e.default.image,
                            src: `/api/media/${f.id}/640`,
                            srcSet: d.w.map((a) => `/api/media/${f.id}/${a} ${a}w`).join(', '),
                            sizes: '(max-width: 700px) 100vw, 600px',
                            width: f.width,
                            height: f.height,
                            style: {
                              aspectRatio: 1 === a.media.length ? `${f.width} / ${f.height}` : '1',
                            },
                            loading: 'lazy',
                            decoding: 'async',
                            alt: `Photo in ${a.author.name}'s post`,
                          },
                          f.id,
                        )
                      : (0, b.jsx)(c.f, { className: e.default.image, height: '12rem' }, f.id),
                  ),
                });
          },
        ],
        63016,
      );
      var f = a.i(32051);
      (a.s(['f', () => f.D], 52975),
        a.s(['f', () => f.a], 42410),
        a.s(['f', () => f.b], 12278),
        a.s(['f', () => f.c], 33566),
        a.s(['f', () => f.d], 9852),
        a.s(['f', () => f.e], 8723),
        a.s(['f', () => f.f], 49099));
    },
    66e3,
    (a) => {
      var b = a.i(87053);
      a.s(['f', () => b.S]);
    },
  ],
  94716,
  (a) => {
    a.v({
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
  37849,
  (a) => {
    a.v({ grid: 'oRcMWW_grid', image: 'oRcMWW_image' });
  },
  14582,
  (a) => {
    a.v({ fields: 'PDNgMG_fields', plain: 'PDNgMG_plain', reasons: 'PDNgMG_reasons' });
  },
];

//# sourceMappingURL=_07q1k9sc81sw1._.js.map
