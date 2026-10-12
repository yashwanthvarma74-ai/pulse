(() => {
  'use strict';
  module.exports = [
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

//# sourceMappingURL=_00atnyxd2z5wn._.js.map
