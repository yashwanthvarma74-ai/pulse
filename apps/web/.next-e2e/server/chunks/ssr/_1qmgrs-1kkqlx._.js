(() => {
  'use strict';
  module.exports = [
    83128,
    (a) => {
      var b = a.i(87924),
        c = a.i(90985),
        d = a.i(87436),
        e = a.i(64572),
        f = a.i(38246),
        g = a.i(21890);
      a.s([
        'f',
        0,
        function ({ children: a }) {
          let h = (0, g.U)();
          return h.isPending
            ? (0, b.jsx)(e.f, { height: '8rem', 'aria-busy': 'true' })
            : h.isError
              ? (0, b.jsx)(c.f, {
                  variant: 'danger',
                  title: 'Could not reach Pulse',
                  children: (0, b.jsx)(d.f, {
                    size: 'sm',
                    onClick: () => h.refetch(),
                    children: 'Try again',
                  }),
                })
              : h.data
                ? (0, b.jsx)(b.Fragment, { children: a(h.data) })
                : (0, b.jsx)(c.f, {
                    variant: 'info',
                    title: 'Sign in to continue',
                    children: (0, b.jsx)(f.default, {
                      href: '/',
                      children: 'Go to the start page',
                    }),
                  });
        },
      ]);
    },
    25255,
    (a) => {
      let b = new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' }),
        c = new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' });
      a.s([
        'f',
        0,
        function (a, d = new Date()) {
          let e = new Date(a),
            f = d.getTime() - e.getTime();
          return f < 6e4
            ? 'just now'
            : f < 36e5
              ? `${Math.floor(f / 6e4)}m`
              : f < 864e5
                ? `${Math.floor(f / 36e5)}h`
                : f < 6048e5
                  ? `${Math.floor(f / 864e5)}d`
                  : (e.getFullYear() === d.getFullYear() ? b : c).format(e);
        },
      ]);
    },
    90985,
    87436,
    64572,
    (a) => {
      var b = a.i(48616);
      a.s(['f', () => b.A], 90985);
      var c = a.i(25007);
      a.s(['f', () => c.B], 87436);
      var d = a.i(78983);
      a.s(['f', () => d.S], 64572);
    },
    30780,
    (a) => {
      var b = a.i(66524);
      a.s(['f', () => b.E]);
    },
    31459,
    (a) => {
      var b = a.i(43020);
      a.s(['f', () => b.F]);
    },
    3924,
    (a) => {
      var b = a.i(16678);
      a.s(['f', () => b.I]);
    },
    38579,
    (a) => {
      var b = a.i(30396);
      a.s(['f', () => b.S]);
    },
    52728,
    (a) => {
      var b = a.i(37581);
      a.s(['f', () => b.T]);
    },
  ];
})();

//# sourceMappingURL=_1qmgrs-1kkqlx._.js.map
