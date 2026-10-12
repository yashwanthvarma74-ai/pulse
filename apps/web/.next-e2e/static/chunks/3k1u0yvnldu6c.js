(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([
  'object' == typeof document ? document.currentScript : void 0,
  47498,
  (e) => {
    e.v({
      body: 'd-ODkW_body',
      composer: 'd-ODkW_composer',
      count: 'd-ODkW_count',
      failed: 'd-ODkW_failed',
      footer: 'd-ODkW_footer',
      images: 'd-ODkW_images',
      remove: 'd-ODkW_remove',
      submit: 'd-ODkW_submit',
      thumb: 'd-ODkW_thumb',
      tile: 'd-ODkW_tile',
      tools: 'd-ODkW_tools',
      visibility: 'd-ODkW_visibility',
    });
  },
  28840,
  (e) => {
    'use strict';
    var a = e.i(43476),
      i = e.i(66027),
      s = e.i(60450),
      t = e.i(64300),
      l = e.i(70684),
      n = e.i(84294),
      r = e.i(75558),
      r = r,
      o = e.i(78937),
      o = o,
      d = e.i(45835),
      c = e.i(32345),
      u = e.i(98124),
      m = e.i(33290),
      h = e.i(71645);
    e.i(24856);
    var f = e.i(21138),
      p = e.i(94108);
    let j = (e) => `pulse:draft:${e}`;
    var g = e.i(48804),
      x = e.i(47498);
    function v({ image: e, onUpdate: s, onRemove: t }) {
      return (
        (0, i.f)({
          queryKey: ['image-status', e.id],
          enabled: 'processing' === e.status,
          refetchInterval: 700,
          queryFn: async () => {
            let a = await p.k.imageStatus(e.id);
            return ('processing' !== a.status && s(a), a);
          },
        }),
        (0, a.jsxs)('div', {
          className: x.default.tile,
          children: [
            'ready' === e.status &&
              (0, a.jsx)('img', {
                src: `/api/media/${e.id}/320`,
                alt: 'Attached to your post',
                className: x.default.thumb,
              }),
            'processing' === e.status && (0, a.jsx)(c.f, { className: x.default.thumb }),
            'failed' === e.status &&
              (0, a.jsx)('p', {
                className: x.default.failed,
                children: 'Could not process this image.',
              }),
            (0, a.jsx)(r.I, {
              label: 'Remove image',
              size: 'sm',
              variant: 'secondary',
              className: x.default.remove,
              icon: (0, a.jsx)(o.I, { name: 'close', size: 14 }),
              onClick: t,
            }),
          ],
        })
      );
    }
    e.s(
      [
        'f',
        0,
        function ({ user: e, community: i, feedKeys: r }) {
          let c = `${e.id}:${i?.id ?? 'home'}`,
            [y, b] = (0, h.useState)(() =>
              (function (e) {
                try {
                  return window.localStorage.getItem(j(e)) ?? '';
                } catch {
                  return '';
                }
              })(c),
            ),
            [w, k] = (0, h.useState)(i ? 'public' : e.defaultVisibility),
            [_, N] = (0, h.useState)([]),
            [z, q] = (0, h.useState)(0),
            [C, W] = (0, h.useState)(null),
            O = (0, h.useRef)(null),
            { toast: S } = (0, m.f)(),
            T = (0, g.$)({ feedKeys: r }),
            P = y.length,
            D = P > f.T,
            I = _.some((e) => 'processing' === e.status),
            $ = (y.trim().length > 0 || _.length > 0) && !D && !I && 0 === z;
          function F(e) {
            b(e);
            try {
              e ? window.localStorage.setItem(j(c), e) : window.localStorage.removeItem(j(c));
            } catch {}
          }
          async function A(e) {
            if (!e) return;
            W(null);
            let a = f.r - _.length,
              i = Array.from(e).slice(0, a);
            for (let s of (e.length > a && W(`You can add up to ${f.r} images to a post.`), i)) {
              q((e) => e + 1);
              try {
                let e = await p.k.uploadImage(s);
                N((a) => [...a, e]);
              } catch (e) {
                W(e.message);
              } finally {
                q((e) => e - 1);
              }
            }
            O.current && (O.current.value = '');
          }
          return (0, a.jsxs)('form', {
            className: x.default.composer,
            onSubmit: function (e) {
              (e.preventDefault(),
                $ &&
                  !T.isPending &&
                  T.mutate(
                    { text: y, visibility: w, communityId: i?.id, mediaIds: _.map((e) => e.id) },
                    {
                      onSuccess: () => {
                        (F(''),
                          N([]),
                          S({
                            title: i ? `Posted in ${i.name}` : 'Posted',
                            variant: 'success',
                            duration: 2500,
                          }));
                      },
                    },
                  ));
            },
            'aria-label': i ? `New post in ${i.name}` : 'New post',
            children: [
              (0, a.jsx)(t.f, { name: e.name, size: 'lg' }),
              (0, a.jsxs)('div', {
                className: x.default.body,
                children: [
                  (0, a.jsx)(n.f, {
                    label: i ? `Post in ${i.name}` : 'What is on your mind?',
                    description: 'Mention people with @handle.',
                    error: D ? `That is ${P - f.T} too many characters.` : void 0,
                    children: (0, a.jsx)(u.f, {
                      rows: 3,
                      resize: 'none',
                      value: y,
                      onChange: (e) => F(e.target.value),
                      placeholder: 'Share something',
                    }),
                  }),
                  _.length > 0 &&
                    (0, a.jsx)('ul', {
                      className: x.default.images,
                      'aria-label': 'Attached images',
                      children: _.map((e) =>
                        (0, a.jsx)(
                          'li',
                          {
                            children: (0, a.jsx)(v, {
                              image: e,
                              onUpdate: (e) => N((a) => a.map((a) => (a.id === e.id ? e : a))),
                              onRemove: () => N((a) => a.filter((a) => a.id !== e.id)),
                            }),
                          },
                          e.id,
                        ),
                      ),
                    }),
                  C && (0, a.jsx)(s.f, { variant: 'warning', children: C }),
                  T.isError &&
                    (0, a.jsxs)(s.f, {
                      variant: 'danger',
                      title: 'Your post was not published',
                      children: [T.error.message, ' Your text is still here.'],
                    }),
                  (0, a.jsxs)('div', {
                    className: x.default.footer,
                    children: [
                      (0, a.jsxs)('div', {
                        className: x.default.tools,
                        children: [
                          (0, a.jsx)('input', {
                            ref: O,
                            type: 'file',
                            accept: 'image/jpeg,image/png,image/webp,image/gif',
                            multiple: !0,
                            hidden: !0,
                            onChange: (e) => void A(e.target.files),
                            'aria-label': 'Choose images',
                            tabIndex: -1,
                          }),
                          (0, a.jsx)(l.f, {
                            variant: 'ghost',
                            size: 'sm',
                            leadingIcon: (0, a.jsx)(o.I, { name: 'plus', size: 16 }),
                            loading: z > 0,
                            disabled: _.length >= f.r,
                            onClick: () => O.current?.click(),
                            children: 'Add photo',
                          }),
                          (0, a.jsxs)('label', {
                            className: x.default.visibility,
                            children: [
                              (0, a.jsx)('span', {
                                className: x.default.visibilityLabel,
                                children: 'Who can see this',
                              }),
                              (0, a.jsx)(d.f, {
                                size: 'sm',
                                value: w,
                                onChange: (e) => k(e.target.value),
                                children: i
                                  ? (0, a.jsxs)(a.Fragment, {
                                      children: [
                                        (0, a.jsx)('option', {
                                          value: 'public',
                                          children: 'Everyone',
                                        }),
                                        (0, a.jsx)('option', {
                                          value: 'community',
                                          children: 'Members only',
                                        }),
                                      ],
                                    })
                                  : (0, a.jsxs)(a.Fragment, {
                                      children: [
                                        (0, a.jsx)('option', {
                                          value: 'public',
                                          children: 'Everyone',
                                        }),
                                        (0, a.jsx)('option', {
                                          value: 'followers',
                                          children: 'Followers only',
                                        }),
                                      ],
                                    }),
                              }),
                            ],
                          }),
                        ],
                      }),
                      (0, a.jsxs)('div', {
                        className: x.default.submit,
                        children: [
                          (0, a.jsxs)('span', {
                            className: x.default.count,
                            'data-over': D || void 0,
                            children: [P, ' / ', f.T],
                          }),
                          (0, a.jsx)(l.f, {
                            type: 'submit',
                            variant: 'primary',
                            disabled: !$,
                            loading: T.isPending,
                            children: 'Post',
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
            ],
          });
        },
      ],
      28840,
    );
  },
  86031,
  (e) => {
    e.v({
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
  60811,
  (e) => {
    e.v({ pill: 'W0WXcG_pill', wrap: 'W0WXcG_wrap' });
  },
  39877,
  (e) => {
    e.v({ errorText: 'z-qjHq_errorText', panel: 'z-qjHq_panel', stack: 'z-qjHq_stack' });
  },
  52601,
  (e) => {
    'use strict';
    var a = e.i(43476),
      i = e.i(12598),
      s = e.i(60450),
      t = e.i(70684),
      l = e.i(32345),
      n = e.i(24350),
      n = n,
      r = n,
      o = n,
      d = n,
      c = e.i(89857),
      c = c,
      u = e.i(71645),
      m = e.i(48804),
      h = e.i(14974),
      f = e.i(28840),
      p = e.i(92179),
      j = e.i(86031);
    function g() {
      let e = (0, m.d)(),
        i = (0, m.T)(),
        l = (0, m.s)(),
        n = e.error ?? i.error;
      return (0, a.jsxs)('section', {
        className: j.default.landing,
        'aria-labelledby': 'landing-title',
        children: [
          (0, a.jsx)('h1', { id: 'landing-title', className: j.default.title, children: 'Pulse' }),
          (0, a.jsx)('p', {
            className: j.default.pitch,
            children:
              'A social feed and communities app that stays fast, correct and private as it grows.',
          }),
          (0, a.jsxs)('div', {
            className: j.default.action,
            children: [
              (0, a.jsx)(t.f, {
                variant: 'primary',
                size: 'lg',
                loading: e.isPending,
                onClick: () => e.mutate(),
                children: 'Continue as guest',
              }),
              (0, a.jsx)('p', {
                className: j.default.note,
                children:
                  'No sign up. You get a temporary account that already follows a few people.',
              }),
            ],
          }),
          n &&
            (0, a.jsx)(s.f, { variant: 'danger', title: 'Could not sign in', children: n.message }),
          (l.data?.length ?? 0) > 0 &&
            (0, a.jsxs)('div', {
              className: j.default.demo,
              children: [
                (0, a.jsx)('h2', {
                  className: j.default.subtitle,
                  children: 'Or try a demo account',
                }),
                (0, a.jsx)('p', {
                  className: j.default.note,
                  children:
                    'Each one is set up differently. Publish from one and open another to see who sees what.',
                }),
                (0, a.jsx)('ul', {
                  className: j.default.accounts,
                  children: l.data?.map((e) =>
                    (0, a.jsxs)(
                      'li',
                      {
                        children: [
                          (0, a.jsx)(t.f, {
                            variant: 'secondary',
                            size: 'sm',
                            loading: i.isPending && i.variables === e.handle,
                            onClick: () => i.mutate(e.handle),
                            children: e.name,
                          }),
                          (0, a.jsx)('span', { className: j.default.role, children: e.role }),
                        ],
                      },
                      e.handle,
                    ),
                  ),
                }),
              ],
            }),
        ],
      });
    }
    var x = e.i(60811);
    function v({ count: e, onShow: i }) {
      return (0, a.jsx)('div', {
        className: x.default.wrap,
        role: 'status',
        children:
          e > 0 &&
          (0, a.jsx)(t.f, {
            variant: 'primary',
            size: 'sm',
            className: x.default.pill,
            onClick: i,
            children: 1 === e ? '1 new post' : `${e} new posts`,
          }),
      });
    }
    var y = e.i(39877);
    let b = {
        title: 'Your feed is empty',
        description: 'Follow people or join communities and their posts will show up here.',
      },
      w = {
        title: 'Nothing new yet',
        description: 'Follow people or join communities, or write the first post above.',
      };
    e.s(
      [
        'default',
        0,
        function () {
          let e = (0, m.U)(),
            j = (0, i.d)(),
            { newPosts: x, clearNewPosts: k } = (0, h.u)(),
            [_, N] = (0, u.useState)('ranked');
          return e.isPending
            ? (0, a.jsx)('div', {
                'aria-busy': 'true',
                'aria-label': 'Loading',
                children: (0, a.jsx)(l.f, { height: '8rem' }),
              })
            : e.isError
              ? (0, a.jsxs)(s.f, {
                  variant: 'danger',
                  title: 'Could not reach Pulse',
                  children: [
                    (0, a.jsx)('p', {
                      className: y.default.errorText,
                      children: 'Check your connection and try again.',
                    }),
                    (0, a.jsx)(t.f, {
                      size: 'sm',
                      onClick: () => e.refetch(),
                      children: 'Try again',
                    }),
                  ],
                })
              : e.data
                ? (0, a.jsxs)('div', {
                    className: y.default.stack,
                    children: [
                      (0, a.jsx)('h1', { children: (0, a.jsx)(c.V, { children: 'Home' }) }),
                      (0, a.jsx)(f.f, {
                        user: e.data,
                        feedKeys: [
                          (0, m.F)({ kind: 'home', mode: 'ranked' }),
                          (0, m.F)({ kind: 'home', mode: 'latest' }),
                        ],
                      }),
                      (0, a.jsxs)(n.T, {
                        value: _,
                        onValueChange: (e) => N(e),
                        children: [
                          (0, a.jsxs)(r.a, {
                            'aria-label': 'Feed order',
                            children: [
                              (0, a.jsx)(d.c, { value: 'ranked', children: 'For you' }),
                              (0, a.jsx)(d.c, { value: 'latest', children: 'Latest' }),
                            ],
                          }),
                          (0, a.jsx)(v, {
                            count: x,
                            onShow: () => {
                              (k(),
                                window.scrollTo({ top: 0 }),
                                j.resetQueries({ queryKey: ['feed'] }));
                            },
                          }),
                          (0, a.jsx)(o.b, {
                            value: 'ranked',
                            className: y.default.panel,
                            children:
                              'ranked' === _ &&
                              (0, a.jsx)(p.f, {
                                source: { kind: 'home', mode: 'ranked' },
                                label: 'Your feed',
                                empty: b,
                              }),
                          }),
                          (0, a.jsx)(o.b, {
                            value: 'latest',
                            className: y.default.panel,
                            children:
                              'latest' === _ &&
                              (0, a.jsx)(p.f, {
                                source: { kind: 'home', mode: 'latest' },
                                label: 'Latest posts',
                                empty: w,
                              }),
                          }),
                        ],
                      }),
                    ],
                  })
                : (0, a.jsx)(g, {});
        },
      ],
      52601,
    );
  },
]);
