module.exports = [
  38806,
  (a) => {
    a.v({
      form: 'EFJuWW_form',
      list: 'EFJuWW_list',
      meta: 'EFJuWW_meta',
      page: 'EFJuWW_page',
      subtitle: 'EFJuWW_subtitle',
      title: 'EFJuWW_title',
    });
  },
  27130,
  (a) => {
    'use strict';
    var b = a.i(87924),
      c = a.i(90985),
      d = a.i(98441),
      e = a.i(87436),
      f = a.i(38185),
      g = a.i(85135),
      h = a.i(19272),
      h = h,
      i = h,
      j = h,
      k = a.i(31459),
      l = a.i(3924),
      m = a.i(64572),
      n = a.i(52728),
      o = a.i(38246),
      p = a.i(50944),
      q = a.i(72131);
    a.i(9241);
    var r = a.i(94455),
      s = a.i(21890),
      t = a.i(83128),
      u = a.i(38806);
    function v() {
      let a = (0, s.l)(),
        t = (0, s.N)(),
        v = (0, p.useRouter)(),
        [w, x] = (0, q.useState)(''),
        [y, z] = (0, q.useState)('');
      return (0, b.jsxs)('div', {
        className: u.default.page,
        children: [
          (0, b.jsx)('h1', { className: u.default.title, children: 'Communities' }),
          a.isPending && (0, b.jsx)(m.f, { height: '10rem', 'aria-busy': 'true' }),
          a.isError && (0, b.jsx)(c.f, { variant: 'danger', children: a.error.message }),
          a.data &&
            (0, b.jsx)('ul', {
              className: u.default.list,
              children: a.data.map((a) =>
                (0, b.jsx)(
                  'li',
                  {
                    children: (0, b.jsxs)(f.f, {
                      children: [
                        (0, b.jsxs)(i.d, {
                          children: [
                            (0, b.jsx)(j.e, {
                              children: (0, b.jsx)(o.default, {
                                href: `/c/${a.slug}`,
                                children: a.name,
                              }),
                            }),
                            (0, b.jsx)(h.b, { children: a.description || 'No description yet.' }),
                          ],
                        }),
                        (0, b.jsxs)(g.f, {
                          className: u.default.meta,
                          children: [
                            (0, b.jsxs)(d.f, {
                              variant: 'neutral',
                              children: [
                                a.memberCount,
                                ' ',
                                1 === a.memberCount ? 'member' : 'members',
                              ],
                            }),
                            a.joined && (0, b.jsx)(d.f, { variant: 'accent', children: 'Joined' }),
                          ],
                        }),
                      ],
                    }),
                  },
                  a.id,
                ),
              ),
            }),
          (0, b.jsxs)('form', {
            className: u.default.form,
            onSubmit: function (a) {
              (a.preventDefault(),
                t.mutate(
                  { name: w, description: y },
                  { onSuccess: (a) => v.push(`/c/${a.slug}`) },
                ));
            },
            'aria-labelledby': 'new-community',
            children: [
              (0, b.jsx)('h2', {
                id: 'new-community',
                className: u.default.subtitle,
                children: 'Start a community',
              }),
              (0, b.jsx)(k.f, {
                label: 'Name',
                children: (0, b.jsx)(l.f, {
                  value: w,
                  maxLength: r.e,
                  onChange: (a) => x(a.target.value),
                }),
              }),
              (0, b.jsx)(k.f, {
                label: 'Description (optional)',
                children: (0, b.jsx)(n.f, {
                  rows: 2,
                  maxLength: r.o,
                  value: y,
                  onChange: (a) => z(a.target.value),
                }),
              }),
              t.isError && (0, b.jsx)(c.f, { variant: 'danger', children: t.error.message }),
              (0, b.jsx)('div', {
                children: (0, b.jsx)(e.f, {
                  type: 'submit',
                  variant: 'primary',
                  loading: t.isPending,
                  disabled: w.trim().length < 3,
                  children: 'Create community',
                }),
              }),
            ],
          }),
        ],
      });
    }
    a.s(
      [
        'default',
        0,
        function () {
          return (0, b.jsx)(t.f, { children: () => (0, b.jsx)(v, {}) });
        },
      ],
      27130,
    );
  },
];

//# sourceMappingURL=apps_web_src_components_pages_0b6hnns21s2ab._.js.map
