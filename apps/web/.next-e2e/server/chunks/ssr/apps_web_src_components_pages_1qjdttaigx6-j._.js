module.exports = [
  59180,
  (a) => {
    a.v({
      handle: 'EF6_Qa_handle',
      page: 'EF6_Qa_page',
      people: 'EF6_Qa_people',
      person: 'EF6_Qa_person',
      posts: 'EF6_Qa_posts',
      subtitle: 'EF6_Qa_subtitle',
      title: 'EF6_Qa_title',
    });
  },
  34257,
  (a) => {
    'use strict';
    var b = a.i(87924),
      c = a.i(90985),
      d = a.i(35033),
      e = a.i(30780),
      f = a.i(3924),
      g = a.i(31459),
      h = a.i(66e3),
      i = a.i(38246),
      j = a.i(72131),
      k = a.i(21890),
      l = a.i(81825),
      m = a.i(83128),
      n = a.i(59180);
    function o() {
      let [a, m] = (0, j.useState)(''),
        [o, p] = (0, j.useState)('');
      (0, j.useEffect)(() => {
        let b = setTimeout(() => p(a), 300);
        return () => clearTimeout(b);
      }, [a]);
      let q = (0, k.u)(o),
        r = q.data && 0 === q.data.users.length && 0 === q.data.posts.length;
      return (0, b.jsxs)('div', {
        className: n.default.page,
        children: [
          (0, b.jsx)('h1', { className: n.default.title, children: 'Search' }),
          (0, b.jsx)(g.f, {
            label: 'Search people and posts',
            description: 'Type at least two characters.',
            children: (0, b.jsx)(f.f, {
              type: 'search',
              value: a,
              onChange: (a) => m(a.target.value),
              autoComplete: 'off',
            }),
          }),
          (0, b.jsxs)('div', {
            'aria-live': 'polite',
            children: [
              q.isFetching && (0, b.jsx)(h.f, { label: 'Searching' }),
              q.isError && (0, b.jsx)(c.f, { variant: 'danger', children: q.error.message }),
              r &&
                (0, b.jsx)(e.f, {
                  icon: 'search',
                  title: 'No results',
                  description: 'Try a different word, or a handle.',
                }),
            ],
          }),
          q.data &&
            q.data.users.length > 0 &&
            (0, b.jsxs)('section', {
              'aria-labelledby': 'people',
              children: [
                (0, b.jsx)('h2', {
                  id: 'people',
                  className: n.default.subtitle,
                  children: 'People',
                }),
                (0, b.jsx)('ul', {
                  className: n.default.people,
                  children: q.data.users.map((a) =>
                    (0, b.jsx)(
                      'li',
                      {
                        children: (0, b.jsxs)(i.default, {
                          href: `/u/${a.handle}`,
                          className: n.default.person,
                          children: [
                            (0, b.jsx)(d.f, { name: a.name, size: 'sm' }),
                            (0, b.jsx)('span', { children: a.name }),
                            (0, b.jsxs)('span', {
                              className: n.default.handle,
                              children: ['@', a.handle],
                            }),
                          ],
                        }),
                      },
                      a.id,
                    ),
                  ),
                }),
              ],
            }),
          q.data &&
            q.data.posts.length > 0 &&
            (0, b.jsxs)('section', {
              'aria-labelledby': 'posts',
              children: [
                (0, b.jsx)('h2', { id: 'posts', className: n.default.subtitle, children: 'Posts' }),
                (0, b.jsx)('ul', {
                  className: n.default.posts,
                  children: q.data.posts.map((a) =>
                    (0, b.jsx)('li', { children: (0, b.jsx)(l.f, { post: a }) }, a.id),
                  ),
                }),
              ],
            }),
        ],
      });
    }
    a.s([
      'default',
      0,
      function () {
        return (0, b.jsx)(m.f, { children: () => (0, b.jsx)(o, {}) });
      },
    ]);
  },
];

//# sourceMappingURL=apps_web_src_components_pages_1qjdttaigx6-j._.js.map
