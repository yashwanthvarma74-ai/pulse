module.exports = [
  [
    58668,
    (a) => {
      var b = a.i(87924),
        c = a.i(35033),
        d = a.i(98441),
        e = a.i(50002),
        f = a.i(22703),
        g = a.i(38246),
        h = a.i(50944),
        i = a.i(21890),
        j = a.i(3716);
      let k = [
          { href: '/', label: 'Home' },
          { href: '/communities', label: 'Communities' },
          { href: '/search', label: 'Search' },
        ],
        l = [
          { value: 'system', label: 'Theme: match system' },
          { value: 'light', label: 'Theme: light' },
          { value: 'dark', label: 'Theme: dark' },
          { value: 'high-contrast', label: 'Theme: high contrast' },
        ];
      a.s([
        'default',
        0,
        function () {
          let { data: a } = (0, i.U)(),
            m = (0, h.usePathname)(),
            n = (0, h.useRouter)(),
            o = (0, i.y)(!!a),
            p = (0, i.s)(),
            q = (0, i.T)(),
            r = (0, i.r)(),
            { preference: s, setTheme: t } = (0, f.i)(),
            u = o.data ?? 0,
            v = (a) => ('/' === a ? '/' === m : m.startsWith(a));
          return (0, b.jsx)('header', {
            className: j.default.header,
            children: (0, b.jsxs)('div', {
              className: j.default.inner,
              children: [
                (0, b.jsx)(g.default, { href: '/', className: j.default.brand, children: 'Pulse' }),
                a &&
                  (0, b.jsxs)('nav', {
                    'aria-label': 'Main',
                    className: j.default.nav,
                    children: [
                      k.map((a) =>
                        (0, b.jsx)(
                          g.default,
                          {
                            href: a.href,
                            className: j.default.link,
                            'aria-current': v(a.href) ? 'page' : void 0,
                            children: a.label,
                          },
                          a.href,
                        ),
                      ),
                      (0, b.jsxs)(g.default, {
                        href: '/notifications',
                        className: j.default.link,
                        'aria-current': v('/notifications') ? 'page' : void 0,
                        children: [
                          'Notifications',
                          u > 0 &&
                            (0, b.jsx)(d.f, {
                              variant: 'accent',
                              className: j.default.count,
                              'aria-label': `${u} unread`,
                              children: u > 99 ? '99+' : u,
                            }),
                        ],
                      }),
                    ],
                  }),
                (0, b.jsxs)(e.f, {
                  children: [
                    (0, b.jsx)(e.f.Trigger, {
                      variant: 'ghost',
                      size: 'sm',
                      'aria-label': a ? `Account menu for ${a.name}` : 'Display settings',
                      children: a
                        ? (0, b.jsxs)(b.Fragment, {
                            children: [
                              (0, b.jsx)(c.f, { name: a.name, size: 'sm' }),
                              (0, b.jsx)('span', { className: j.default.name, children: a.name }),
                            ],
                          })
                        : 'Display',
                    }),
                    (0, b.jsxs)(e.f.Content, {
                      'aria-label': 'Account',
                      placement: 'bottom end',
                      children: [
                        a &&
                          (0, b.jsx)(e.f.Item, {
                            id: 'profile',
                            onAction: () => n.push(`/u/${a.handle}`),
                            children: 'Your profile',
                          }),
                        a &&
                          (0, b.jsx)(e.f.Item, {
                            id: 'settings',
                            onAction: () => n.push('/settings'),
                            children: 'Settings and blocked people',
                          }),
                        a?.moderator &&
                          (0, b.jsx)(e.f.Item, {
                            id: 'moderation',
                            onAction: () => n.push('/moderation'),
                            children: 'Moderation queue',
                          }),
                        l.map((a) =>
                          (0, b.jsxs)(
                            e.f.Item,
                            {
                              id: `theme-${a.value}`,
                              onAction: () => t(a.value),
                              children: [a.label, s === a.value ? ' (current)' : ''],
                            },
                            a.value,
                          ),
                        ),
                        a && (p.data?.length ?? 0) > 0 && (0, b.jsx)(e.f.Separator, {}),
                        a &&
                          p.data?.map((c) =>
                            (0, b.jsxs)(
                              e.f.Item,
                              {
                                id: `demo-${c.handle}`,
                                textValue: `Switch to ${c.name}`,
                                disabled: c.handle === a.handle,
                                onAction: () =>
                                  q.mutate(c.handle, { onSuccess: () => n.push('/') }),
                                children: ['Switch to ', c.name],
                              },
                              c.handle,
                            ),
                          ),
                        a && (0, b.jsx)(e.f.Separator, {}),
                        a &&
                          (0, b.jsx)(e.f.Item, {
                            id: 'logout',
                            danger: !0,
                            onAction: () => r.mutate(void 0, { onSuccess: () => n.push('/') }),
                            children: 'Sign out',
                          }),
                      ],
                    }),
                  ],
                }),
              ],
            }),
          });
        },
      ]);
    },
    66594,
    (a) => {
      var b = a.i(87924),
        c = a.i(42871),
        d = a.i(99745),
        e = a.i(18544),
        f = a.i(12552),
        g = a.i(33791),
        h = a.i(12794),
        i = class extends g.f {
          #a;
          #b;
          #c;
          constructor(a = {}) {
            (super(),
              (this.config = a),
              (this.#a = new Set()),
              (this.#b = new Map()),
              (this.#c = 0));
          }
          build(a, b, c) {
            let d = new h.I({
              client: a,
              mutationCache: this,
              mutationId: ++this.#c,
              options: a.defaultMutationOptions(b),
              state: c,
            });
            return (this.add(d), d);
          }
          add(a) {
            this.#a.add(a);
            let b = j(a);
            if ('string' == typeof b) {
              let c = this.#b.get(b);
              c ? c.push(a) : this.#b.set(b, [a]);
            }
            this.notify({ type: 'added', mutation: a });
          }
          remove(a) {
            if (this.#a.delete(a)) {
              let b = j(a);
              if ('string' == typeof b) {
                let c = this.#b.get(b);
                if (c)
                  if (c.length > 1) {
                    let b = c.indexOf(a);
                    -1 !== b && c.splice(b, 1);
                  } else c[0] === a && this.#b.delete(b);
              }
            }
            this.notify({ type: 'removed', mutation: a });
          }
          canRun(a) {
            let b = j(a);
            if ('string' != typeof b) return !0;
            {
              let c = this.#b.get(b)?.find((a) => 'pending' === a.state.status);
              return !c || c === a;
            }
          }
          runNext(a) {
            let b = j(a);
            return 'string' == typeof b
              ? (this.#b
                  .get(b)
                  ?.find((b) => b !== a && b.state.isPaused)
                  ?.continue() ?? Promise.resolve())
              : Promise.resolve();
          }
          clear() {
            e.f.batch(() => {
              (this.#a.forEach((a) => {
                this.notify({ type: 'removed', mutation: a });
              }),
                this.#a.clear(),
                this.#b.clear());
            });
          }
          getAll() {
            return Array.from(this.#a);
          }
          find(a) {
            let b = { exact: !0, ...a };
            return this.getAll().find((a) => (0, c.L)(b, a));
          }
          findAll(a = {}) {
            return this.getAll().filter((b) => (0, c.L)(a, b));
          }
          notify(a) {
            e.f.batch(() => {
              this.listeners.forEach((b) => {
                b(a);
              });
            });
          }
          resumePausedMutations() {
            let a = this.getAll().filter((a) => a.state.isPaused);
            return e.f.batch(() => Promise.all(a.map((a) => a.continue().catch(c.z))));
          }
        };
      function j(a) {
        return a.options.scope?.id;
      }
      var k = g,
        l = a.i(76644),
        m = class extends k.f {
          #d;
          constructor(a = {}) {
            (super(), (this.config = a), (this.#d = new Map()));
          }
          build(a, b, d) {
            let e = b.queryKey,
              f = b.queryHash ?? (0, c.J)(e, b),
              g = this.get(f);
            return (
              g ||
                ((g = new l.X({
                  client: a,
                  queryKey: e,
                  queryHash: f,
                  options: a.defaultQueryOptions(b),
                  state: d,
                  defaultOptions: a.getQueryDefaults(e),
                })),
                this.add(g)),
              g
            );
          }
          add(a) {
            this.#d.has(a.queryHash) ||
              (this.#d.set(a.queryHash, a), this.notify({ type: 'added', query: a }));
          }
          remove(a) {
            this.#d.get(a.queryHash) === a &&
              (a.destroy(),
              this.#d.delete(a.queryHash),
              this.notify({ type: 'removed', query: a }));
          }
          clear() {
            e.f.batch(() => {
              this.getAll().forEach((a) => {
                this.remove(a);
              });
            });
          }
          get(a) {
            return this.#d.get(a);
          }
          getAll() {
            return [...this.#d.values()];
          }
          find(a) {
            let b = { exact: !0, ...a };
            return this.getAll().find((a) => (0, c.N)(b, a));
          }
          findAll(a = {}) {
            let b = this.getAll();
            return Object.keys(a).length > 0 ? b.filter((b) => (0, c.N)(a, b)) : b;
          }
          notify(a) {
            e.f.batch(() => {
              this.listeners.forEach((b) => {
                b(a);
              });
            });
          }
          onFocus() {
            e.f.batch(() => {
              this.getAll().forEach((a) => {
                a.onFocus();
              });
            });
          }
          onOnline() {
            e.f.batch(() => {
              this.getAll().forEach((a) => {
                a.onOnline();
              });
            });
          }
        },
        n = class {
          #e;
          #f;
          #g;
          #h;
          #i;
          #j;
          #k;
          #l;
          constructor(a = {}) {
            ((this.#e = a.queryCache || new m()),
              (this.#f = a.mutationCache || new i()),
              (this.#g = a.defaultOptions || {}),
              (this.#h = new Map()),
              (this.#i = new Map()),
              (this.#j = 0));
          }
          mount() {
            (this.#j++,
              1 === this.#j &&
                ((this.#k = d.f.subscribe(async (a) => {
                  a && (await this.resumePausedMutations(), this.#e.onFocus());
                })),
                (this.#l = f.f.subscribe(async (a) => {
                  a && (await this.resumePausedMutations(), this.#e.onOnline());
                }))));
          }
          unmount() {
            (this.#j--,
              0 === this.#j && (this.#k?.(), (this.#k = void 0), this.#l?.(), (this.#l = void 0)));
          }
          isFetching(a) {
            return this.#e.findAll({ ...a, fetchStatus: 'fetching' }).length;
          }
          isMutating(a) {
            return this.#f.findAll({ ...a, status: 'pending' }).length;
          }
          getQueryData(a) {
            let b = this.defaultQueryOptions({ queryKey: a });
            return this.#e.get(b.queryHash)?.state.data;
          }
          ensureQueryData(a) {
            let b = this.defaultQueryOptions(a),
              d = this.#e.build(this, b),
              e = d.state.data;
            return void 0 === e
              ? this.fetchQuery(a)
              : (a.revalidateIfStale &&
                  d.isStaleByTime((0, c.S)(b.staleTime, d)) &&
                  this.prefetchQuery(b),
                Promise.resolve(e));
          }
          getQueriesData(a) {
            return this.#e.findAll(a).map(({ queryKey: a, state: b }) => [a, b.data]);
          }
          setQueryData(a, b, d) {
            let e = this.defaultQueryOptions({ queryKey: a }),
              f = this.#e.get(e.queryHash)?.state.data,
              g = (0, c.b)(b, f);
            if (void 0 !== g) return this.#e.build(this, e).setData(g, { ...d, manual: !0 });
          }
          setQueriesData(a, b, c) {
            return e.f.batch(() =>
              this.#e.findAll(a).map(({ queryKey: a }) => [a, this.setQueryData(a, b, c)]),
            );
          }
          getQueryState(a) {
            let b = this.defaultQueryOptions({ queryKey: a });
            return this.#e.get(b.queryHash)?.state;
          }
          removeQueries(a) {
            let b = this.#e;
            e.f.batch(() => {
              b.findAll(a).forEach((a) => {
                b.remove(a);
              });
            });
          }
          resetQueries(a, b) {
            let c = this.#e;
            return e.f.batch(() => {
              let d = c.findAll(a),
                e = new Set(d);
              return (
                d.forEach((a) => {
                  a.reset();
                }),
                this.refetchQueries({ type: 'active', predicate: (a) => e.has(a) }, b)
              );
            });
          }
          cancelQueries(a, b = {}) {
            let d = { revert: !0, ...b };
            return Promise.all(e.f.batch(() => this.#e.findAll(a).map((a) => a.cancel(d))))
              .then(c.z)
              .catch(c.z);
          }
          invalidateQueries(a, b = {}) {
            return e.f.batch(() =>
              (this.#e.findAll(a).forEach((a) => {
                a.invalidate();
              }),
              a?.refetchType === 'none')
                ? Promise.resolve()
                : this.refetchQueries({ ...a, type: a?.refetchType ?? a?.type ?? 'active' }, b),
            );
          }
          refetchQueries(a, b = {}) {
            let d = { ...b, cancelRefetch: b.cancelRefetch ?? !0 };
            return Promise.all(
              e.f.batch(() =>
                this.#e
                  .findAll(a)
                  .filter((a) => !a.isDisabled() && !a.isStatic())
                  .map((a) => {
                    let b = a.fetch(void 0, d);
                    return (
                      d.throwOnError || (b = b.catch(c.z)),
                      'paused' === a.state.fetchStatus ? Promise.resolve() : b
                    );
                  }),
              ),
            ).then(c.z);
          }
          async query(a) {
            let b = this.defaultQueryOptions(a);
            void 0 === b.retry && (b.retry = !1);
            let d = this.#e.build(this, b),
              e = d.isStaleByTime((0, c.S)(b.staleTime, d)) ? await d.fetch(b) : d.state.data,
              f = b.select;
            return f ? f(e) : e;
          }
          fetchQuery(a) {
            let b = this.defaultQueryOptions(a);
            void 0 === b.retry && (b.retry = !1);
            let d = this.#e.build(this, b);
            return d.isStaleByTime((0, c.S)(b.staleTime, d))
              ? d.fetch(b)
              : Promise.resolve(d.state.data);
          }
          prefetchQuery(a) {
            return this.fetchQuery(a).then(c.z).catch(c.z);
          }
          infiniteQuery(a) {
            return ((a._type = 'infinite'), this.query(a));
          }
          fetchInfiniteQuery(a) {
            return ((a._type = 'infinite'), this.fetchQuery(a));
          }
          prefetchInfiniteQuery(a) {
            return this.fetchInfiniteQuery(a).then(c.z).catch(c.z);
          }
          ensureInfiniteQueryData(a) {
            return ((a._type = 'infinite'), this.ensureQueryData(a));
          }
          resumePausedMutations() {
            return f.f.isOnline() ? this.#f.resumePausedMutations() : Promise.resolve();
          }
          getQueryCache() {
            return this.#e;
          }
          getMutationCache() {
            return this.#f;
          }
          getDefaultOptions() {
            return this.#g;
          }
          setDefaultOptions(a) {
            this.#g = a;
          }
          setQueryDefaults(a, b) {
            this.#h.set((0, c.q)(a), { queryKey: a, defaultOptions: b });
          }
          getQueryDefaults(a) {
            let b = [...this.#h.values()],
              d = {};
            return (
              b.forEach((b) => {
                (0, c.P)(a, b.queryKey) && Object.assign(d, b.defaultOptions);
              }),
              d
            );
          }
          setMutationDefaults(a, b) {
            this.#i.set((0, c.q)(a), { mutationKey: a, defaultOptions: b });
          }
          getMutationDefaults(a) {
            let b = [...this.#i.values()],
              d = {};
            return (
              b.forEach((b) => {
                (0, c.P)(a, b.mutationKey) && Object.assign(d, b.defaultOptions);
              }),
              d
            );
          }
          defaultQueryOptions(a) {
            if (a._defaulted) return a;
            let b = {
              ...this.#g.queries,
              ...this.getQueryDefaults(a.queryKey),
              ...a,
              _defaulted: !0,
            };
            return (
              b.queryHash || (b.queryHash = (0, c.J)(b.queryKey, b)),
              void 0 === b.refetchOnReconnect &&
                (b.refetchOnReconnect = 'always' !== b.networkMode),
              void 0 === b.throwOnError && (b.throwOnError = !!b.suspense),
              !b.networkMode && b.persister && (b.networkMode = 'offlineFirst'),
              b.queryFn === c.V && (b.enabled = !1),
              b
            );
          }
          defaultMutationOptions(a) {
            return a?._defaulted
              ? a
              : {
                  ...this.#g.mutations,
                  ...(a?.mutationKey && this.getMutationDefaults(a.mutationKey)),
                  ...a,
                  _defaulted: !0,
                };
          }
          clear() {
            (this.#e.clear(), this.#f.clear());
          }
        },
        o = a.i(37927),
        p = a.i(22703),
        q = a.i(13902),
        q = q,
        r = a.i(72131),
        s = a.i(31195);
      a.s(
        [
          'default',
          0,
          function ({ children: a }) {
            let [c] = (0, r.useState)(() => new n());
            return (0, b.jsx)(p.J, {
              children: (0, b.jsx)(q.T, {
                children: (0, b.jsx)(o.P, {
                  client: c,
                  children: (0, b.jsx)(s.y, { children: a }),
                }),
              }),
            });
          },
        ],
        66594,
      );
    },
    31954,
    (a) => {
      var b = a.i(87924),
        c = a.i(22703),
        d = a.i(47283);
      a.s([
        'default',
        0,
        function () {
          return (0, b.jsx)(d.default, {
            id: 'theme-init',
            strategy: 'beforeInteractive',
            children: (0, c.w)(),
          });
        },
      ]);
    },
    22703,
    (a) => {
      var b = a.i(57188);
      (a.i(89800), a.i(25007), a.i(56061), a.i(16678), a.i(37581));
      var c = a.i(87924),
        d = a.i(72131),
        e = a.i(29152);
      function f(...a) {
        return (b) => {
          for (let c of a) 'function' == typeof c ? c(b) : c && (c.current = b);
        };
      }
      var g = a.i(12604);
      (0, d.forwardRef)(function (
        { children: a, description: h, indeterminate: i = !1, invalid: j, className: k, ...l },
        m,
      ) {
        let n = (0, d.useRef)(null),
          o = (0, g.u)({
            id: l.id,
            disabled: l.disabled,
            required: l.required,
            invalid: j,
            'aria-describedby': l['aria-describedby'],
          });
        return (
          (0, d.useEffect)(() => {
            n.current && (n.current.indeterminate = i);
          }, [i]),
          (0, c.jsxs)('label', {
            className: (0, e.c)(
              'mrd_Checkbox-module_root__mY3qk',
              o.disabled && 'mrd_Checkbox-module_disabled__x7-eg',
              k,
            ),
            children: [
              (0, c.jsx)('input', {
                ref: f(m, n),
                type: 'checkbox',
                ...l,
                ...o,
                className: 'mrd_Checkbox-module_input__2kt-h',
              }),
              (0, c.jsxs)('span', {
                className: 'mrd_Checkbox-module_box__OCPee',
                'aria-hidden': 'true',
                children: [
                  (0, c.jsx)(b.I, {
                    name: 'check',
                    size: 14,
                    className: 'mrd_Checkbox-module_check__4HYWn',
                  }),
                  (0, c.jsx)(b.I, {
                    name: 'minus',
                    size: 14,
                    className: 'mrd_Checkbox-module_dash__5Dkdl',
                  }),
                ],
              }),
              (a || h) &&
                (0, c.jsxs)('span', {
                  className: 'mrd_Checkbox-module_text__EmtRj',
                  children: [
                    a &&
                      (0, c.jsx)('span', {
                        className: 'mrd_Checkbox-module_label__cwRtI',
                        children: a,
                      }),
                    h &&
                      (0, c.jsx)('span', {
                        className: 'mrd_Checkbox-module_description__rMhG1',
                        children: h,
                      }),
                  ],
                }),
            ],
          })
        );
      });
      var h = a.i(8520),
        i = a.i(59039);
      let [j, k] = (0, h.c)('RadioGroup', 'Radio');
      (0, d.forwardRef)(function (
        { value: a, children: b, description: d, className: f, disabled: g, onChange: h, ...i },
        j,
      ) {
        let l = k(),
          m = g || l.disabled;
        return (0, c.jsxs)('label', {
          className: (0, e.c)(
            'mrd_Radio-module_root__kAjTD',
            m && 'mrd_Radio-module_disabled__0-cna',
            f,
          ),
          children: [
            (0, c.jsx)('input', {
              ref: j,
              type: 'radio',
              name: l.name,
              value: a,
              checked: l.value === a,
              disabled: m,
              onChange: (b) => {
                (l.select(a), h?.(b));
              },
              className: 'mrd_Radio-module_input__7R8ZN',
              ...i,
            }),
            (0, c.jsx)('span', {
              className: 'mrd_Radio-module_circle__6v2W0',
              'aria-hidden': 'true',
            }),
            (0, c.jsxs)('span', {
              className: 'mrd_Radio-module_text__wmNPT',
              children: [
                b &&
                  (0, c.jsx)('span', { className: 'mrd_Radio-module_label__vAFIP', children: b }),
                d &&
                  (0, c.jsx)('span', {
                    className: 'mrd_Radio-module_description__bEB8u',
                    children: d,
                  }),
              ],
            }),
          ],
        });
      });
      ((0, d.forwardRef)(function ({ children: a, className: b, disabled: d, ...f }, g) {
        return (0, c.jsxs)('label', {
          className: (0, e.c)(
            'mrd_Switch-module_root__Y5Ydi',
            d && 'mrd_Switch-module_disabled__2aZ0V',
            b,
          ),
          children: [
            (0, c.jsx)('input', {
              ref: g,
              type: 'checkbox',
              role: 'switch',
              disabled: d,
              className: 'mrd_Switch-module_input__5BPNu',
              ...f,
            }),
            (0, c.jsx)('span', {
              className: 'mrd_Switch-module_track__7ObdZ',
              'aria-hidden': 'true',
              children: (0, c.jsx)('span', { className: 'mrd_Switch-module_thumb__-FTeK' }),
            }),
            a && (0, c.jsx)('span', { className: 'mrd_Switch-module_label__LrH7V', children: a }),
          ],
        });
      }),
        a.i(30396),
        a.i(27590),
        a.i(39543),
        a.i(87053),
        a.i(78983));
      var l = a.i(76893),
        m = a.i(78088),
        n = a.i(71655),
        o = a.i(15908);
      let p = (0, d.createContext)(null);
      var q = a.i(35010);
      let r = {
          badInput: !1,
          customError: !1,
          patternMismatch: !1,
          rangeOverflow: !1,
          rangeUnderflow: !1,
          stepMismatch: !1,
          tooLong: !1,
          tooShort: !1,
          typeMismatch: !1,
          valueMissing: !1,
          valid: !0,
        },
        s = { ...r, customError: !0, valid: !1 },
        t = { isInvalid: !1, validationDetails: r, validationErrors: [] },
        u = (0, d.createContext)({}),
        v = '__reactAriaFormValidationState';
      function w(a) {
        if (a[v]) {
          let {
            realtimeValidation: b,
            displayValidation: c,
            updateValidation: d,
            resetValidation: e,
            commitValidation: f,
          } = a[v];
          return {
            realtimeValidation: b,
            displayValidation: c,
            updateValidation: d,
            resetValidation: e,
            commitValidation: f,
          };
        }
        return (function (a) {
          let {
            isInvalid: b,
            validationState: c,
            name: e,
            value: f,
            builtinValidation: g,
            validate: h,
            validationBehavior: i = 'aria',
          } = a;
          c && (b ||= 'invalid' === c);
          let j =
              void 0 !== b ? { isInvalid: b, validationErrors: [], validationDetails: s } : null,
            k = (0, d.useMemo)(
              () =>
                h && null != f
                  ? y(
                      (function (a, b) {
                        if ('function' == typeof a) {
                          let c = a(b);
                          if (c && 'boolean' != typeof c) return x(c);
                        }
                        return [];
                      })(h, f),
                    )
                  : null,
              [h, f],
            );
          g?.validationDetails.valid && (g = void 0);
          let l = (0, d.useContext)(u),
            m = (0, d.useMemo)(
              () => (e ? (Array.isArray(e) ? e.flatMap((a) => x(l[a])) : x(l[e])) : []),
              [l, e],
            ),
            [n, o] = (0, d.useState)(l),
            [p, q] = (0, d.useState)(!1);
          l !== n && (o(l), q(!1));
          let r = (0, d.useMemo)(() => y(p ? [] : m), [p, m]),
            v = (0, d.useRef)(t),
            [w, A] = (0, d.useState)(t),
            B = (0, d.useRef)(t),
            [C, D] = (0, d.useState)(!1);
          return (
            (0, d.useEffect)(() => {
              if (!C) return;
              D(!1);
              let a = k || g || v.current;
              z(a, B.current) || ((B.current = a), A(a));
            }),
            {
              realtimeValidation: j || r || k || g || t,
              displayValidation: 'native' === i ? j || r || w : j || r || k || g || w,
              updateValidation(a) {
                'aria' !== i || z(w, a) ? (v.current = a) : A(a);
              },
              resetValidation() {
                (z(t, B.current) || ((B.current = t), A(t)), 'native' === i && D(!1), q(!0));
              },
              commitValidation() {
                ('native' === i && D(!0), q(!0));
              },
            }
          );
        })(a);
      }
      function x(a) {
        return a ? (Array.isArray(a) ? a : [a]) : [];
      }
      function y(a) {
        return a.length ? { isInvalid: !0, validationErrors: a, validationDetails: s } : null;
      }
      function z(a, b) {
        return (
          a === b ||
          (!!a &&
            !!b &&
            a.isInvalid === b.isInvalid &&
            a.validationErrors.length === b.validationErrors.length &&
            a.validationErrors.every((a, c) => a === b.validationErrors[c]) &&
            Object.entries(a.validationDetails).every(([a, c]) => b.validationDetails[a] === c))
        );
      }
      let A = (0, d.createContext)(null);
      var B = a.i(81086),
        C = a.i(63663),
        D = a.i(76873);
      let E = (0, d.createContext)({});
      var F = a.i(22128);
      let G = (0, d.createContext)({}),
        H = (0, F.L)(function (a, b) {
          [a, b] = (0, m.T)(a, b, G);
          let { hoverProps: c, isHovered: e } = (0, B.f)({ ...a, isDisabled: a.disabled }),
            {
              isFocused: f,
              isFocusVisible: g,
              focusProps: h,
            } = (0, D.f)({ isTextInput: !0, autoFocus: a.autoFocus }),
            i = !!a['aria-invalid'] && 'false' !== a['aria-invalid'],
            j = (0, m.U)({
              ...a,
              values: {
                isHovered: e,
                isFocused: f,
                isFocusVisible: g,
                isDisabled: a.disabled || !1,
                isInvalid: i,
              },
              defaultClassName: 'react-aria-Input',
            });
          return d.default.createElement(m.P.input, {
            ...(0, C.f)(
              ((a) => {
                let { onHoverStart: b, onHoverChange: c, onHoverEnd: d, ...e } = a;
                return e;
              })(a),
              h,
              c,
            ),
            ...j,
            ref: b,
            'data-focused': f || void 0,
            'data-disabled': a.disabled || void 0,
            'data-hovered': e || void 0,
            'data-focus-visible': g || void 0,
            'data-invalid': i || void 0,
          });
        });
      var I = a.i(35783),
        J = a.i(49552);
      let K = (0, d.createContext)({}),
        L = (0, d.createContext)(null),
        M = (0, d.forwardRef)(function (a, b) {
          let { render: c } = (0, d.useContext)(L);
          return d.default.createElement(d.default.Fragment, null, c(a, b));
        });
      function N(a, b) {
        let c = a?.renderDropIndicator,
          e = a?.isVirtualDragging?.(),
          f = (0, d.useCallback)(
            (a) => {
              if (e || b?.isDropTarget(a))
                return c ? c(a) : d.default.createElement(M, { target: a });
            },
            [b?.target, e, c],
          );
        return a?.useDropIndicator ? f : void 0;
      }
      var O = a.i(5896),
        P = a.i(71595),
        Q = a.i(8748),
        R = a.i(87175);
      let S = new WeakMap();
      function T(a, b) {
        let c = S.get(a);
        if (!c) throw Error('Unknown list');
        return `${c.id}-option-${'string' == typeof b ? b.replace(/\s*/g, '') : '' + b}`;
      }
      var U = a.i(8682),
        V = a.i(64665),
        W = a.i(50995),
        X = a.i(37552),
        Y = a.i(29147),
        Z = a.i(15099),
        $ = a.i(60143),
        _ = a.i(90617),
        aa = a.i(67834),
        ab = a.i(81920),
        ac = a.i(70558),
        ad = a.i(5891),
        ae = a.i(90761),
        af = a.i(90260);
      class ag {
        constructor(a) {
          ((this.keyMap = new Map()),
            (this.firstKey = null),
            (this.lastKey = null),
            (this.iterable = a));
          let b = (a) => {
            if ((this.keyMap.set(a.key, a), a.childNodes && 'section' === a.type))
              for (let c of a.childNodes) b(c);
          };
          for (let c of a) b(c);
          let c = null,
            d = 0,
            e = 0;
          for (let [a, b] of this.keyMap)
            (c
              ? ((c.nextKey = a), (b.prevKey = c.key))
              : ((this.firstKey = a), (b.prevKey = void 0)),
              'item' === b.type && (b.index = d++),
              ('section' === b.type || 'item' === b.type) && e++,
              ((c = b).nextKey = void 0));
          ((this._size = e), (this.lastKey = c?.key ?? null));
        }
        *[Symbol.iterator]() {
          yield* this.iterable;
        }
        get size() {
          return this._size;
        }
        getKeys() {
          return this.keyMap.keys();
        }
        getKeyBefore(a) {
          let b = this.keyMap.get(a);
          return b ? (b.prevKey ?? null) : null;
        }
        getKeyAfter(a) {
          let b = this.keyMap.get(a);
          return b ? (b.nextKey ?? null) : null;
        }
        getFirstKey() {
          return this.firstKey;
        }
        getLastKey() {
          return this.lastKey;
        }
        getItem(a) {
          return this.keyMap.get(a) ?? null;
        }
        at(a) {
          let b = [...this.getKeys()];
          return this.getItem(b[a]);
        }
        getChildren(a) {
          let b = this.keyMap.get(a);
          return b?.childNodes || [];
        }
      }
      var ah = a.i(2318),
        ai = a.i(93733),
        aj = a.i(31858);
      function ak(a) {
        let { filter: b, layoutDelegate: c } = a,
          e = (0, ah.f)(a),
          f = (0, d.useMemo)(
            () => (a.disabledKeys ? new Set(a.disabledKeys) : new Set()),
            [a.disabledKeys],
          ),
          g = (0, d.useCallback)((a) => new ag(b ? b(a) : a), [b]),
          h = (0, d.useMemo)(
            () => ({ suppressTextValueWarning: a.suppressTextValueWarning }),
            [a.suppressTextValueWarning],
          ),
          i = (0, aj.f)(a, g, h),
          j = (0, d.useMemo)(() => new (0, ai.f)(i, e, { layoutDelegate: c }), [i, e, c]);
        return (al(i, j), { collection: i, disabledKeys: f, selectionManager: j });
      }
      function al(a, b) {
        let c = (0, d.useRef)(null);
        (0, d.useEffect)(() => {
          if (null != b.focusedKey && !a.getItem(b.focusedKey) && c.current) {
            let d = c.current.getKeyAfter(b.focusedKey),
              e = null;
            for (; null != d;) {
              let f = a.getItem(d);
              if (f && 'item' === f.type && !b.isDisabled(d)) {
                e = d;
                break;
              }
              d = c.current.getKeyAfter(d);
            }
            if (null == e)
              for (d = c.current.getKeyBefore(b.focusedKey); null != d;) {
                let f = a.getItem(d);
                if (f && 'item' === f.type && !b.isDisabled(d)) {
                  e = d;
                  break;
                }
                d = c.current.getKeyBefore(d);
              }
            b.setFocusedKey(e);
          }
          c.current = a;
        }, [a, b]);
      }
      var am = a.i(26803),
        an = a.i(77537),
        ao = a.i(34906),
        ap = a.i(31946),
        aq = a.i(25260),
        ar = a.i(91634);
      let as = (0, d.createContext)(null),
        at = (0, d.createContext)(null),
        au = (0, d.forwardRef)(function (a, b) {
          [a, b] = (0, m.T)(a, b, as);
          let c = (0, d.useContext)(at);
          return c
            ? d.default.createElement(aw, { state: c, props: a, listBoxRef: b })
            : d.default.createElement(ab.U, { content: d.default.createElement(ab.G, a) }, (c) =>
                d.default.createElement(av, { props: a, listBoxRef: b, collection: c }),
              );
        });
      function av({ props: a, listBoxRef: b, collection: c }) {
        a = { ...a, collection: c, children: null, items: null };
        let { layoutDelegate: e } = (0, d.useContext)(J.l),
          f = ak({ ...a, layoutDelegate: e });
        return d.default.createElement(aw, { state: f, props: a, listBoxRef: b });
      }
      function aw({ state: a, props: b, listBoxRef: c }) {
        let e, f, g, h, i;
        [b, c] = (0, m.T)(b, c, q.M);
        let {
            dragAndDropHooks: j,
            layout: k = 'stack',
            orientation: l = 'vertical',
            filter: n,
          } = b,
          p =
            ((e = (0, d.useMemo)(
              () => (n ? a.collection.filter(n) : a.collection),
              [a.collection, n],
            )),
            (f = a.selectionManager.withCollection(e)),
            al(e, f),
            { collection: e, selectionManager: f, disabledKeys: a.disabledKeys }),
          { collection: r, selectionManager: s } = p,
          t = !!j?.useDraggableCollectionState,
          u = !!j?.useDroppableCollectionState,
          { direction: v } = (0, aq.f)(),
          { disabledBehavior: w, disabledKeys: x } = s,
          y = (0, an.f)({ usage: 'search', sensitivity: 'base' }),
          {
            isVirtualized: z,
            layoutDelegate: A,
            dropTargetDelegate: B,
            CollectionRoot: E,
          } = (0, d.useContext)(J.l),
          F = (0, d.useMemo)(
            () =>
              b.keyboardDelegate ||
              new (0, af.f)({
                collection: r,
                collator: y,
                ref: c,
                disabledKeys: x,
                disabledBehavior: w,
                layout: k,
                orientation: l,
                direction: v,
                layoutDelegate: A,
              }),
            [r, y, c, w, x, l, v, b.keyboardDelegate, k, A],
          ),
          { listBoxProps: G } = (function (a, b, c) {
            let d = (0, o.f)(a, { labelable: !0 }),
              e = a.selectionBehavior || 'toggle',
              f = a.orientation || 'vertical',
              g = a.linkBehavior || ('replace' === e ? 'action' : 'override');
            'toggle' === e && 'action' === g && (g = 'override');
            let { listProps: h } = (0, X.f)({
                ...a,
                ref: c,
                selectionManager: b.selectionManager,
                collection: b.collection,
                disabledKeys: b.disabledKeys,
                linkBehavior: g,
              }),
              { focusWithinProps: i } = (0, U.f)({
                onFocusWithin: a.onFocus,
                onBlurWithin: a.onBlur,
                onFocusWithinChange: a.onFocusChange,
              }),
              j = (0, V.H)(a.id);
            S.set(b, {
              id: j,
              shouldUseVirtualFocus: a.shouldUseVirtualFocus,
              shouldSelectOnPressUp: a.shouldSelectOnPressUp,
              shouldFocusOnHover: a.shouldFocusOnHover,
              isVirtualized: a.isVirtualized,
              onAction: a.onAction,
              linkBehavior: g,
              UNSTABLE_itemBehavior: a.UNSTABLE_itemBehavior,
            });
            let { labelProps: k, fieldProps: l } = (0, W.f)({
              ...a,
              id: j,
              labelElementType: 'span',
            });
            return {
              labelProps: k,
              listBoxProps: (0, C.f)(
                d,
                i,
                'multiple' === b.selectionManager.selectionMode
                  ? { 'aria-multiselectable': 'true' }
                  : {},
                { role: 'listbox', 'aria-orientation': f, ...(0, C.f)(l, h) },
              ),
            };
          })(
            {
              ...b,
              shouldSelectOnPressUp: t || b.shouldSelectOnPressUp,
              keyboardDelegate: F,
              isVirtualized: z,
            },
            p,
            c,
          );
        ((0, d.useRef)(t), (0, d.useRef)(u), (0, d.useEffect)(() => {}, [t, u]));
        let H = !1,
          I = null,
          M = (0, d.useRef)(null);
        if (t && j) {
          ((g = j.useDraggableCollectionState({
            collection: r,
            selectionManager: s,
            preview: j.renderDragPreview ? M : void 0,
          })),
            j.useDraggableCollection({}, g, c));
          let a = j.DragPreview;
          I = j.renderDragPreview
            ? d.default.createElement(a, { ref: M }, j.renderDragPreview)
            : null;
        }
        if (u && j) {
          h = j.useDroppableCollectionState({ collection: r, selectionManager: s });
          let a =
            j.dropTargetDelegate ||
            B ||
            new j.ListDropTargetDelegate(r, c, { orientation: l, layout: k, direction: v });
          ((i = j.useDroppableCollection({ keyboardDelegate: F, dropTargetDelegate: a }, h, c)),
            (H = h.isDropTarget({ type: 'root' })));
        }
        let { focusProps: O, isFocused: P, isFocusVisible: T } = (0, D.f)(),
          Y = 0 === p.collection.size,
          Z = {
            isDropTarget: H,
            isEmpty: Y,
            isFocused: P,
            isFocusVisible: T,
            layout: b.layout || 'stack',
            orientation: l,
            state: p,
          },
          $ = (0, m.U)({
            ...b,
            children: void 0,
            defaultClassName: 'react-aria-ListBox',
            values: Z,
          }),
          _ = null;
        Y &&
          b.renderEmptyState &&
          (_ = d.default.createElement(
            'div',
            { role: 'option', style: { display: 'contents' } },
            b.renderEmptyState(Z),
          ));
        let aa = (0, o.f)(b, { global: !0 });
        return d.default.createElement(
          ac.v,
          null,
          d.default.createElement(
            m.P.div,
            {
              ...(0, C.f)(aa, $, G, O, i?.collectionProps),
              ref: c,
              slot: b.slot || void 0,
              onScroll: b.onScroll,
              'data-drop-target': H || void 0,
              'data-empty': Y || void 0,
              'data-focused': P || void 0,
              'data-focus-visible': T || void 0,
              'data-layout': b.layout || 'stack',
              'data-orientation': l,
            },
            d.default.createElement(
              m.g,
              {
                values: [
                  [as, b],
                  [at, p],
                  [K, { dragAndDropHooks: j, dragState: g, dropState: h }],
                  [Q.c, { elementType: 'div' }],
                  [L, { render: az }],
                  [J.G, { name: 'ListBoxSection', render: ax }],
                ],
              },
              d.default.createElement(
                R.P,
                null,
                d.default.createElement(E, {
                  collection: r,
                  scrollRef: c,
                  persistedKeys: (function (a, b, c) {
                    let e = a.focusedKey,
                      f = null;
                    if (
                      b?.isVirtualDragging?.() &&
                      c?.target?.type === 'item' &&
                      ((f = c.target.key), 'after' === c.target.dropPosition)
                    ) {
                      let a = c.collection.getKeyAfter(f),
                        b = null;
                      if (null != a) {
                        let d = c.collection.getItem(f)?.level ?? 0;
                        for (; null != a;) {
                          let e = c.collection.getItem(a);
                          if (!e) break;
                          if ('item' !== e.type) {
                            a = c.collection.getKeyAfter(a);
                            continue;
                          }
                          if ((e.level ?? 0) <= d) break;
                          ((b = a), (a = c.collection.getKeyAfter(a)));
                        }
                      }
                      f = a ?? b ?? f;
                    }
                    return (0, d.useMemo)(() => new Set([e, f].filter((a) => null != a)), [e, f]);
                  })(s, j, h),
                  renderDropIndicator: N(j, h),
                }),
              ),
            ),
            _,
            I,
          ),
        );
      }
      function ax(a, b, c, e = 'react-aria-ListBoxSection') {
        let f = (0, d.useContext)(at),
          { dragAndDropHooks: g, dropState: h } = (0, d.useContext)(K),
          { CollectionBranch: i } = (0, d.useContext)(J.l),
          [j, k] = (0, m.Z)(),
          { headingProps: l, groupProps: n } = (function (a) {
            let { heading: b, 'aria-label': c } = a,
              d = (0, V.H)();
            return {
              itemProps: { role: 'presentation' },
              headingProps: b
                ? {
                    id: d,
                    role: 'presentation',
                    onMouseDown: (a) => {
                      a.preventDefault();
                    },
                  }
                : {},
              groupProps: { role: 'group', 'aria-label': c, 'aria-labelledby': b ? d : void 0 },
            };
          })({ heading: k, 'aria-label': a['aria-label'] ?? void 0 }),
          p = (0, m.U)({ ...a, id: void 0, children: void 0, defaultClassName: e, values: void 0 }),
          q = (0, o.f)(a, { global: !0 });
        return (
          delete q.id,
          d.default.createElement(
            m.P.section,
            { ...(0, C.f)(q, p, n), ref: b },
            d.default.createElement(
              O.f.Provider,
              { value: { ...l, ref: j } },
              d.default.createElement(i, {
                collection: f.collection,
                parent: c,
                renderDropIndicator: N(g, h),
              }),
            ),
          )
        );
      }
      ae.A;
      let ay = (0, ab.N)(ae.x, function (a, b, c) {
        let e = (0, ar.f)(b),
          f = (0, d.useContext)(at),
          { dragAndDropHooks: g, dragState: h, dropState: i } = (0, d.useContext)(K),
          j = h && !(h.isDisabled || h.selectionManager.isDisabled(c.key)),
          {
            optionProps: k,
            labelProps: l,
            descriptionProps: p,
            ...q
          } = (function (a, b, c) {
            let { key: d } = a,
              e = S.get(b),
              f = a.isDisabled ?? b.selectionManager.isDisabled(d),
              g = a.isSelected ?? b.selectionManager.isSelected(d),
              h = a.shouldSelectOnPressUp ?? e?.shouldSelectOnPressUp,
              i = a.shouldFocusOnHover ?? e?.shouldFocusOnHover,
              j = a.shouldUseVirtualFocus ?? e?.shouldUseVirtualFocus,
              k = a.isVirtualized ?? e?.isVirtualized,
              l = (0, V.i)(),
              m = (0, V.i)(),
              n = {
                role: 'option',
                'aria-disabled': f || void 0,
                'aria-selected': 'none' !== b.selectionManager.selectionMode ? g : void 0,
                'aria-label': a['aria-label'],
                'aria-labelledby': l,
                'aria-describedby': m,
              },
              p = b.collection.getItem(d);
            if (k) {
              let a = Number(p?.index);
              ((n['aria-posinset'] = Number.isNaN(a) ? void 0 : a + 1),
                (n['aria-setsize'] = (0, aa.f)(b.collection)));
            }
            let q = e?.onAction ? () => e?.onAction?.(d) : void 0,
              r = T(b, d),
              {
                itemProps: s,
                isPressed: t,
                isFocused: u,
                hasAction: v,
                allowsSelection: w,
              } = (0, $.f)({
                selectionManager: b.selectionManager,
                key: d,
                ref: c,
                shouldSelectOnPressUp: h,
                allowsDifferentPressOrigin: h && i,
                isVirtualized: k,
                shouldUseVirtualFocus: j,
                isDisabled: f,
                onAction: q || p?.props?.onAction ? (0, Y.f)(p?.props?.onAction, q) : void 0,
                linkBehavior: e?.linkBehavior,
                UNSTABLE_itemBehavior: e?.UNSTABLE_itemBehavior,
                id: r,
              }),
              { hoverProps: x } = (0, B.f)({
                isDisabled: f || !i,
                onHoverStart() {
                  (0, Z.v)() ||
                    (b.selectionManager.setFocused(!0), b.selectionManager.setFocusedKey(d));
                },
              }),
              y = (0, o.f)(p?.props);
            delete y.id;
            let z = (0, _.J)(p?.props);
            return {
              optionProps: { ...n, ...(0, C.f)(y, s, x, z), id: r },
              labelProps: { id: l },
              descriptionProps: { id: m },
              isFocused: u,
              isFocusVisible: u && b.selectionManager.isFocused && (0, Z.v)(),
              isSelected: g,
              isDisabled: f,
              isPressed: t,
              allowsSelection: w,
              hasAction: v,
            };
          })({ key: c.key, 'aria-label': a?.['aria-label'] }, f, e),
          { hoverProps: r, isHovered: s } = (0, B.f)({
            isDisabled: !q.allowsSelection && !q.hasAction && !j,
            onHoverStart: c.props.onHoverStart,
            onHoverChange: c.props.onHoverChange,
            onHoverEnd: c.props.onHoverEnd,
          }),
          { keyboardProps: t } = (0, ap.f)(a),
          { focusProps: u } = (0, ao.f)(a),
          v = null;
        h && g && (v = g.useDraggableItem({ key: c.key, hasAction: q.hasAction }, h));
        let w = null;
        i &&
          g &&
          (w = g.useDroppableItem(
            { target: { type: 'item', key: c.key, dropPosition: 'on' } },
            i,
            e,
          ));
        let x = h && h.isDragging(c.key),
          y = (0, m.U)({
            ...a,
            id: void 0,
            children: a.children,
            defaultClassName: 'react-aria-ListBoxItem',
            values: {
              ...q,
              isHovered: s,
              selectionMode: f.selectionManager.selectionMode,
              selectionBehavior: f.selectionManager.selectionBehavior,
              allowsDragging: !!h,
              isDragging: x,
              isDropTarget: w?.isDropTarget,
            },
          });
        (0, d.useEffect)(() => {}, [c.textValue]);
        let z = a.href ? m.P.a : m.P.div,
          A = (0, o.f)(a, { global: !0 });
        return (
          delete A.id,
          delete A.onClick,
          a.href && null == k.tabIndex && (k.tabIndex = -1),
          d.default.createElement(
            z,
            {
              ...(0, C.f)(A, y, k, r, t, u, v?.dragProps, w?.dropProps),
              ref: e,
              'data-allows-dragging': !!h || void 0,
              'data-selected': q.isSelected || void 0,
              'data-disabled': q.isDisabled || void 0,
              'data-hovered': s || void 0,
              'data-focused': q.isFocused || void 0,
              'data-focus-visible': q.isFocusVisible || void 0,
              'data-pressed': q.isPressed || void 0,
              'data-dragging': x || void 0,
              'data-drop-target': w?.isDropTarget || void 0,
              'data-selection-mode':
                'none' === f.selectionManager.selectionMode
                  ? void 0
                  : f.selectionManager.selectionMode,
            },
            d.default.createElement(
              m.g,
              {
                values: [
                  [n.Q, { slots: { [m.X]: l, label: l, description: p } }],
                  [P.f, { isSelected: q.isSelected }],
                ],
              },
              y.children,
            ),
          )
        );
      });
      function az(a, b) {
        b = (0, ar.f)(b);
        let { dragAndDropHooks: c, dropState: e } = (0, d.useContext)(K),
          { dropIndicatorProps: f, isHidden: g, isDropTarget: h } = c.useDropIndicator(a, e, b);
        return g
          ? null
          : d.default.createElement(aA, { ...a, dropIndicatorProps: f, isDropTarget: h, ref: b });
      }
      let aA = (0, d.forwardRef)(function (a, b) {
        let { dropIndicatorProps: c, isDropTarget: e, ...f } = a,
          g = (0, m.U)({
            ...f,
            defaultClassName: 'react-aria-DropIndicator',
            values: { isDropTarget: e },
          });
        return d.default.createElement(
          d.default.Fragment,
          null,
          d.default.createElement(m.P.div, {
            ...c,
            ...g,
            role: 'option',
            ref: b,
            'data-drop-target': e || void 0,
          }),
        );
      });
      (0, ab.N)(ae.j, function (a, b, c) {
        let e = (0, d.useContext)(at),
          { isLoading: f, onLoadMore: g, scrollOffset: h, ...i } = a,
          j = (0, d.useRef)(null),
          k = (0, d.useMemo)(
            () => ({ onLoadMore: g, collection: e?.collection, sentinelRef: j, scrollOffset: h }),
            [g, h, e?.collection],
          );
        (0, am.f)(k, j);
        let l = (0, m.U)({
          ...i,
          id: void 0,
          children: c.rendered,
          defaultClassName: 'react-aria-ListBoxLoadingIndicator',
          values: void 0,
        });
        return d.default.createElement(
          d.default.Fragment,
          null,
          d.default.createElement(
            'div',
            { style: { position: 'relative', width: 0, height: 0 }, inert: (0, ad.f)(!0) },
            d.default.createElement('div', {
              'data-testid': 'loadMoreSentinel',
              ref: j,
              style: { position: 'absolute', height: 1, width: 1 },
            }),
          ),
          f &&
            l.children &&
            d.default.createElement(
              d.default.Fragment,
              null,
              d.default.createElement(
                m.P.div,
                {
                  ...(0, C.f)((0, o.f)(a, { global: !0 }), { tabIndex: -1 }),
                  ...l,
                  role: 'option',
                  ref: b,
                },
                l.children,
              ),
            ),
        );
      });
      var aB = a.i(6427),
        aC = a.i(8504),
        aD = a.i(12758),
        aE = a.i(24178),
        aF = a.i(41836),
        aG = a.i(43807),
        aH = a.i(60921),
        aI = {};
      aI = {
        'ar-AE': {
          buttonLabel: 'عرض المقترحات',
          countAnnouncement: (a, b) =>
            `${b.plural(a.optionCount, { one: () => `${b.number(a.optionCount)} خيار`, other: () => `${b.number(a.optionCount)} خيارات` })} متاحة.`,
          focusAnnouncement: (a, b) =>
            `${b.select({ true: () => `المجموعة المدخلة ${a.groupTitle}, مع ${b.plural(a.groupCount, { one: () => `${b.number(a.groupCount)} خيار`, other: () => `${b.number(a.groupCount)} خيارات` })}. `, other: '' }, a.isGroupChange)}${a.optionText}${b.select({ true: ', محدد', other: '' }, a.isSelected)}`,
          listboxLabel: 'مقترحات',
          selectedAnnouncement: (a) => `${a.optionText}، محدد`,
        },
        'bg-BG': {
          buttonLabel: 'Покажи предложения',
          countAnnouncement: (a, b) =>
            `${b.plural(a.optionCount, { one: () => `${b.number(a.optionCount)} опция`, other: () => `${b.number(a.optionCount)} опции` })} на разположение.`,
          focusAnnouncement: (a, b) =>
            `${b.select({ true: () => `Въведена група ${a.groupTitle}, с ${b.plural(a.groupCount, { one: () => `${b.number(a.groupCount)} опция`, other: () => `${b.number(a.groupCount)} опции` })}. `, other: '' }, a.isGroupChange)}${a.optionText}${b.select({ true: ', избрани', other: '' }, a.isSelected)}`,
          listboxLabel: 'Предложения',
          selectedAnnouncement: (a) => `${a.optionText}, избрани`,
        },
        'cs-CZ': {
          buttonLabel: 'Zobrazit doporučení',
          countAnnouncement: (a, b) =>
            `K dispozici ${b.plural(a.optionCount, { one: () => `je ${b.number(a.optionCount)} možnost`, other: () => `jsou/je ${b.number(a.optionCount)} možnosti/-\xed` })}.`,
          focusAnnouncement: (a, b) =>
            `${b.select({ true: () => `Zadan\xe1 skupina „${a.groupTitle}“ ${b.plural(a.groupCount, { one: () => `s ${b.number(a.groupCount)} možnost\xed`, other: () => `se ${b.number(a.groupCount)} možnostmi` })}. `, other: '' }, a.isGroupChange)}${a.optionText}${b.select({ true: ' (vybráno)', other: '' }, a.isSelected)}`,
          listboxLabel: 'Návrhy',
          selectedAnnouncement: (a) => `${a.optionText}, vybr\xe1no`,
        },
        'da-DK': {
          buttonLabel: 'Vis forslag',
          countAnnouncement: (a, b) =>
            `${b.plural(a.optionCount, { one: () => `${b.number(a.optionCount)} mulighed tilg\xe6ngelig`, other: () => `${b.number(a.optionCount)} muligheder tilg\xe6ngelige` })}.`,
          focusAnnouncement: (a, b) =>
            `${b.select({ true: () => `Angivet gruppe ${a.groupTitle}, med ${b.plural(a.groupCount, { one: () => `${b.number(a.groupCount)} mulighed`, other: () => `${b.number(a.groupCount)} muligheder` })}. `, other: '' }, a.isGroupChange)}${a.optionText}${b.select({ true: ', valgt', other: '' }, a.isSelected)}`,
          listboxLabel: 'Forslag',
          selectedAnnouncement: (a) => `${a.optionText}, valgt`,
        },
        'de-DE': {
          buttonLabel: 'Empfehlungen anzeigen',
          countAnnouncement: (a, b) =>
            `${b.plural(a.optionCount, { one: () => `${b.number(a.optionCount)} Option`, other: () => `${b.number(a.optionCount)} Optionen` })} verf\xfcgbar.`,
          focusAnnouncement: (a, b) =>
            `${b.select({ true: () => `Eingetretene Gruppe ${a.groupTitle}, mit ${b.plural(a.groupCount, { one: () => `${b.number(a.groupCount)} Option`, other: () => `${b.number(a.groupCount)} Optionen` })}. `, other: '' }, a.isGroupChange)}${a.optionText}${b.select({ true: ', ausgewählt', other: '' }, a.isSelected)}`,
          listboxLabel: 'Empfehlungen',
          selectedAnnouncement: (a) => `${a.optionText}, ausgew\xe4hlt`,
        },
        'el-GR': {
          buttonLabel: 'Προβολή προτάσεων',
          countAnnouncement: (a, b) =>
            `${b.plural(a.optionCount, { one: () => `${b.number(a.optionCount)} επιλογή`, other: () => `${b.number(a.optionCount)} επιλογές ` })} διαθέσιμες.`,
          focusAnnouncement: (a, b) =>
            `${b.select({ true: () => `Εισαγμένη ομάδα ${a.groupTitle}, με ${b.plural(a.groupCount, { one: () => `${b.number(a.groupCount)} επιλογή`, other: () => `${b.number(a.groupCount)} επιλογές` })}. `, other: '' }, a.isGroupChange)}${a.optionText}${b.select({ true: ', επιλεγμένο', other: '' }, a.isSelected)}`,
          listboxLabel: 'Προτάσεις',
          selectedAnnouncement: (a) => `${a.optionText}, επιλέχθηκε`,
        },
        'en-US': {
          focusAnnouncement: (a, b) =>
            `${b.select({ true: () => `Entered group ${a.groupTitle}, with ${b.plural(a.groupCount, { one: () => `${b.number(a.groupCount)} option`, other: () => `${b.number(a.groupCount)} options` })}. `, other: '' }, a.isGroupChange)}${a.optionText}${b.select({ true: ', selected', other: '' }, a.isSelected)}`,
          countAnnouncement: (a, b) =>
            `${b.plural(a.optionCount, { one: () => `${b.number(a.optionCount)} option`, other: () => `${b.number(a.optionCount)} options` })} available.`,
          selectedAnnouncement: (a) => `${a.optionText}, selected`,
          buttonLabel: 'Show suggestions',
          listboxLabel: 'Suggestions',
        },
        'es-ES': {
          buttonLabel: 'Mostrar sugerencias',
          countAnnouncement: (a, b) =>
            `${b.plural(a.optionCount, { one: () => `${b.number(a.optionCount)} opci\xf3n`, other: () => `${b.number(a.optionCount)} opciones` })} disponible(s).`,
          focusAnnouncement: (a, b) =>
            `${b.select({ true: () => `Se ha unido al grupo ${a.groupTitle}, con ${b.plural(a.groupCount, { one: () => `${b.number(a.groupCount)} opci\xf3n`, other: () => `${b.number(a.groupCount)} opciones` })}. `, other: '' }, a.isGroupChange)}${a.optionText}${b.select({ true: ', seleccionado', other: '' }, a.isSelected)}`,
          listboxLabel: 'Sugerencias',
          selectedAnnouncement: (a) => `${a.optionText}, seleccionado`,
        },
        'et-EE': {
          buttonLabel: 'Kuva soovitused',
          countAnnouncement: (a, b) =>
            `${b.plural(a.optionCount, { one: () => `${b.number(a.optionCount)} valik`, other: () => `${b.number(a.optionCount)} valikud` })} saadaval.`,
          focusAnnouncement: (a, b) =>
            `${b.select({ true: () => `Sisestatud r\xfchm ${a.groupTitle}, valikuga ${b.plural(a.groupCount, { one: () => `${b.number(a.groupCount)} valik`, other: () => `${b.number(a.groupCount)} valikud` })}. `, other: '' }, a.isGroupChange)}${a.optionText}${b.select({ true: ', valitud', other: '' }, a.isSelected)}`,
          listboxLabel: 'Soovitused',
          selectedAnnouncement: (a) => `${a.optionText}, valitud`,
        },
        'fi-FI': {
          buttonLabel: 'Näytä ehdotukset',
          countAnnouncement: (a, b) =>
            `${b.plural(a.optionCount, { one: () => `${b.number(a.optionCount)} vaihtoehto`, other: () => `${b.number(a.optionCount)} vaihtoehtoa` })} saatavilla.`,
          focusAnnouncement: (a, b) =>
            `${b.select({ true: () => `Siirtyi ryhm\xe4\xe4n ${a.groupTitle}, jossa ${b.plural(a.groupCount, { one: () => `${b.number(a.groupCount)} vaihtoehto`, other: () => `${b.number(a.groupCount)} vaihtoehtoa` })}.`, other: '' }, a.isGroupChange)}${a.optionText}${b.select({ true: ', valittu', other: '' }, a.isSelected)}`,
          listboxLabel: 'Ehdotukset',
          selectedAnnouncement: (a) => `${a.optionText}, valittu`,
        },
        'fr-FR': {
          buttonLabel: 'Afficher les suggestions',
          countAnnouncement: (a, b) =>
            `${b.plural(a.optionCount, { one: () => `${b.number(a.optionCount)} option`, other: () => `${b.number(a.optionCount)} options` })} disponible(s).`,
          focusAnnouncement: (a, b) =>
            `${b.select({ true: () => `Groupe ${a.groupTitle} rejoint, avec ${b.plural(a.groupCount, { one: () => `${b.number(a.groupCount)} option`, other: () => `${b.number(a.groupCount)} options` })}. `, other: '' }, a.isGroupChange)}${a.optionText}${b.select({ true: ', sélectionné(s)', other: '' }, a.isSelected)}`,
          listboxLabel: 'Suggestions',
          selectedAnnouncement: (a) => `${a.optionText}, s\xe9lectionn\xe9`,
        },
        'he-IL': {
          buttonLabel: 'הצג הצעות',
          countAnnouncement: (a, b) =>
            `${b.plural(a.optionCount, { one: () => `אפשרות ${b.number(a.optionCount)}`, other: () => `${b.number(a.optionCount)} אפשרויות` })} במצב זמין.`,
          focusAnnouncement: (a, b) =>
            `${b.select({ true: () => `נכנס לקבוצה ${a.groupTitle}, עם ${b.plural(a.groupCount, { one: () => `אפשרות ${b.number(a.groupCount)}`, other: () => `${b.number(a.groupCount)} אפשרויות` })}. `, other: '' }, a.isGroupChange)}${a.optionText}${b.select({ true: ', נבחר', other: '' }, a.isSelected)}`,
          listboxLabel: 'הצעות',
          selectedAnnouncement: (a) => `${a.optionText}, נבחר`,
        },
        'hr-HR': {
          buttonLabel: 'Prikaži prijedloge',
          countAnnouncement: (a, b) =>
            `Dostupno još: ${b.plural(a.optionCount, { one: () => `${b.number(a.optionCount)} opcija`, other: () => `${b.number(a.optionCount)} opcije/a` })}.`,
          focusAnnouncement: (a, b) =>
            `${b.select({ true: () => `Unesena skupina ${a.groupTitle}, s ${b.plural(a.groupCount, { one: () => `${b.number(a.groupCount)} opcijom`, other: () => `${b.number(a.groupCount)} opcije/a` })}. `, other: '' }, a.isGroupChange)}${a.optionText}${b.select({ true: ', odabranih', other: '' }, a.isSelected)}`,
          listboxLabel: 'Prijedlozi',
          selectedAnnouncement: (a) => `${a.optionText}, odabrano`,
        },
        'hu-HU': {
          buttonLabel: 'Javaslatok megjelenítése',
          countAnnouncement: (a, b) =>
            `${b.plural(a.optionCount, { one: () => `${b.number(a.optionCount)} lehetős\xe9g`, other: () => `${b.number(a.optionCount)} lehetős\xe9g` })} \xe1ll rendelkez\xe9sre.`,
          focusAnnouncement: (a, b) =>
            `${b.select({ true: () => `Bel\xe9pett a(z) ${a.groupTitle} csoportba, amely ${b.plural(a.groupCount, { one: () => `${b.number(a.groupCount)} lehetős\xe9get`, other: () => `${b.number(a.groupCount)} lehetős\xe9get` })} tartalmaz. `, other: '' }, a.isGroupChange)}${a.optionText}${b.select({ true: ', kijelölve', other: '' }, a.isSelected)}`,
          listboxLabel: 'Javaslatok',
          selectedAnnouncement: (a) => `${a.optionText}, kijel\xf6lve`,
        },
        'it-IT': {
          buttonLabel: 'Mostra suggerimenti',
          countAnnouncement: (a, b) =>
            `${b.plural(a.optionCount, { one: () => `${b.number(a.optionCount)} opzione disponibile`, other: () => `${b.number(a.optionCount)} opzioni disponibili` })}.`,
          focusAnnouncement: (a, b) =>
            `${b.select({ true: () => `Ingresso nel gruppo ${a.groupTitle}, con ${b.plural(a.groupCount, { one: () => `${b.number(a.groupCount)} opzione`, other: () => `${b.number(a.groupCount)} opzioni` })}. `, other: '' }, a.isGroupChange)}${a.optionText}${b.select({ true: ', selezionato', other: '' }, a.isSelected)}`,
          listboxLabel: 'Suggerimenti',
          selectedAnnouncement: (a) => `${a.optionText}, selezionato`,
        },
        'ja-JP': {
          buttonLabel: '候補を表示',
          countAnnouncement: (a, b) =>
            `${b.plural(a.optionCount, { one: () => `${b.number(a.optionCount)} 個のオプション`, other: () => `${b.number(a.optionCount)} 個のオプション` })}を利用できます。`,
          focusAnnouncement: (a, b) =>
            `${b.select({ true: () => `入力されたグループ ${a.groupTitle}、${b.plural(a.groupCount, { one: () => `${b.number(a.groupCount)} 個のオプション`, other: () => `${b.number(a.groupCount)} 個のオプション` })}を含む。`, other: '' }, a.isGroupChange)}${a.optionText}${b.select({ true: '、選択済み', other: '' }, a.isSelected)}`,
          listboxLabel: '候補',
          selectedAnnouncement: (a) => `${a.optionText}、選択済み`,
        },
        'ko-KR': {
          buttonLabel: '제안 사항 표시',
          countAnnouncement: (a, b) =>
            `${b.plural(a.optionCount, { one: () => `${b.number(a.optionCount)}개 옵션`, other: () => `${b.number(a.optionCount)}개 옵션` })}을 사용할 수 있습니다.`,
          focusAnnouncement: (a, b) =>
            `${b.select({ true: () => `입력한 그룹 ${a.groupTitle}, ${b.plural(a.groupCount, { one: () => `${b.number(a.groupCount)}개 옵션`, other: () => `${b.number(a.groupCount)}개 옵션` })}. `, other: '' }, a.isGroupChange)}${a.optionText}${b.select({ true: ', 선택됨', other: '' }, a.isSelected)}`,
          listboxLabel: '제안',
          selectedAnnouncement: (a) => `${a.optionText}, 선택됨`,
        },
        'lt-LT': {
          buttonLabel: 'Rodyti pasiūlymus',
          countAnnouncement: (a, b) =>
            `Yra ${b.plural(a.optionCount, { one: () => `${b.number(a.optionCount)} parinktis`, other: () => `${b.number(a.optionCount)} parinktys (-ių)` })}.`,
          focusAnnouncement: (a, b) =>
            `${b.select({ true: () => `Įvesta grupė ${a.groupTitle}, su ${b.plural(a.groupCount, { one: () => `${b.number(a.groupCount)} parinktimi`, other: () => `${b.number(a.groupCount)} parinktimis (-ių)` })}. `, other: '' }, a.isGroupChange)}${a.optionText}${b.select({ true: ', pasirinkta', other: '' }, a.isSelected)}`,
          listboxLabel: 'Pasiūlymai',
          selectedAnnouncement: (a) => `${a.optionText}, pasirinkta`,
        },
        'lv-LV': {
          buttonLabel: 'Rādīt ieteikumus',
          countAnnouncement: (a, b) =>
            `Pieejamo opciju skaits: ${b.plural(a.optionCount, { one: () => `${b.number(a.optionCount)} opcija`, other: () => `${b.number(a.optionCount)} opcijas` })}.`,
          focusAnnouncement: (a, b) =>
            `${b.select({ true: () => `Ievadīta grupa ${a.groupTitle}, ar ${b.plural(a.groupCount, { one: () => `${b.number(a.groupCount)} opciju`, other: () => `${b.number(a.groupCount)} opcijām` })}. `, other: '' }, a.isGroupChange)}${a.optionText}${b.select({ true: ', atlasīta', other: '' }, a.isSelected)}`,
          listboxLabel: 'Ieteikumi',
          selectedAnnouncement: (a) => `${a.optionText}, atlasīta`,
        },
        'nb-NO': {
          buttonLabel: 'Vis forslag',
          countAnnouncement: (a, b) =>
            `${b.plural(a.optionCount, { one: () => `${b.number(a.optionCount)} alternativ`, other: () => `${b.number(a.optionCount)} alternativer` })} finnes.`,
          focusAnnouncement: (a, b) =>
            `${b.select({ true: () => `Angitt gruppe ${a.groupTitle}, med ${b.plural(a.groupCount, { one: () => `${b.number(a.groupCount)} alternativ`, other: () => `${b.number(a.groupCount)} alternativer` })}. `, other: '' }, a.isGroupChange)}${a.optionText}${b.select({ true: ', valgt', other: '' }, a.isSelected)}`,
          listboxLabel: 'Forslag',
          selectedAnnouncement: (a) => `${a.optionText}, valgt`,
        },
        'nl-NL': {
          buttonLabel: 'Suggesties weergeven',
          countAnnouncement: (a, b) =>
            `${b.plural(a.optionCount, { one: () => `${b.number(a.optionCount)} optie`, other: () => `${b.number(a.optionCount)} opties` })} beschikbaar.`,
          focusAnnouncement: (a, b) =>
            `${b.select({ true: () => `Groep ${a.groupTitle} ingevoerd met ${b.plural(a.groupCount, { one: () => `${b.number(a.groupCount)} optie`, other: () => `${b.number(a.groupCount)} opties` })}. `, other: '' }, a.isGroupChange)}${a.optionText}${b.select({ true: ', geselecteerd', other: '' }, a.isSelected)}`,
          listboxLabel: 'Suggesties',
          selectedAnnouncement: (a) => `${a.optionText}, geselecteerd`,
        },
        'pl-PL': {
          buttonLabel: 'Wyświetlaj sugestie',
          countAnnouncement: (a, b) =>
            `dostępna/dostępne(-nych) ${b.plural(a.optionCount, { one: () => `${b.number(a.optionCount)} opcja`, other: () => `${b.number(a.optionCount)} opcje(-i)` })}.`,
          focusAnnouncement: (a, b) =>
            `${b.select({ true: () => `Dołączono do grupy ${a.groupTitle}, z ${b.plural(a.groupCount, { one: () => `${b.number(a.groupCount)} opcją`, other: () => `${b.number(a.groupCount)} opcjami` })}. `, other: '' }, a.isGroupChange)}${a.optionText}${b.select({ true: ', wybrano', other: '' }, a.isSelected)}`,
          listboxLabel: 'Sugestie',
          selectedAnnouncement: (a) => `${a.optionText}, wybrano`,
        },
        'pt-BR': {
          buttonLabel: 'Mostrar sugestões',
          countAnnouncement: (a, b) =>
            `${b.plural(a.optionCount, { one: () => `${b.number(a.optionCount)} op\xe7\xe3o`, other: () => `${b.number(a.optionCount)} op\xe7\xf5es` })} dispon\xedvel.`,
          focusAnnouncement: (a, b) =>
            `${b.select({ true: () => `Grupo inserido ${a.groupTitle}, com ${b.plural(a.groupCount, { one: () => `${b.number(a.groupCount)} op\xe7\xe3o`, other: () => `${b.number(a.groupCount)} op\xe7\xf5es` })}. `, other: '' }, a.isGroupChange)}${a.optionText}${b.select({ true: ', selecionado', other: '' }, a.isSelected)}`,
          listboxLabel: 'Sugestões',
          selectedAnnouncement: (a) => `${a.optionText}, selecionado`,
        },
        'pt-PT': {
          buttonLabel: 'Apresentar sugestões',
          countAnnouncement: (a, b) =>
            `${b.plural(a.optionCount, { one: () => `${b.number(a.optionCount)} op\xe7\xe3o`, other: () => `${b.number(a.optionCount)} op\xe7\xf5es` })} dispon\xedvel.`,
          focusAnnouncement: (a, b) =>
            `${b.select({ true: () => `Grupo introduzido ${a.groupTitle}, com ${b.plural(a.groupCount, { one: () => `${b.number(a.groupCount)} op\xe7\xe3o`, other: () => `${b.number(a.groupCount)} op\xe7\xf5es` })}. `, other: '' }, a.isGroupChange)}${a.optionText}${b.select({ true: ', selecionado', other: '' }, a.isSelected)}`,
          listboxLabel: 'Sugestões',
          selectedAnnouncement: (a) => `${a.optionText}, selecionado`,
        },
        'ro-RO': {
          buttonLabel: 'Afișare sugestii',
          countAnnouncement: (a, b) =>
            `${b.plural(a.optionCount, { one: () => `${b.number(a.optionCount)} opțiune`, other: () => `${b.number(a.optionCount)} opțiuni` })} disponibile.`,
          focusAnnouncement: (a, b) =>
            `${b.select({ true: () => `Grup ${a.groupTitle} introdus, cu ${b.plural(a.groupCount, { one: () => `${b.number(a.groupCount)} opțiune`, other: () => `${b.number(a.groupCount)} opțiuni` })}. `, other: '' }, a.isGroupChange)}${a.optionText}${b.select({ true: ', selectat', other: '' }, a.isSelected)}`,
          listboxLabel: 'Sugestii',
          selectedAnnouncement: (a) => `${a.optionText}, selectat`,
        },
        'ru-RU': {
          buttonLabel: 'Показать предложения',
          countAnnouncement: (a, b) =>
            `${b.plural(a.optionCount, { one: () => `${b.number(a.optionCount)} параметр`, other: () => `${b.number(a.optionCount)} параметров` })} доступно.`,
          focusAnnouncement: (a, b) =>
            `${b.select({ true: () => `Введенная группа ${a.groupTitle}, с ${b.plural(a.groupCount, { one: () => `${b.number(a.groupCount)} параметром`, other: () => `${b.number(a.groupCount)} параметрами` })}. `, other: '' }, a.isGroupChange)}${a.optionText}${b.select({ true: ', выбранными', other: '' }, a.isSelected)}`,
          listboxLabel: 'Предложения',
          selectedAnnouncement: (a) => `${a.optionText}, выбрано`,
        },
        'sk-SK': {
          buttonLabel: 'Zobraziť návrhy',
          countAnnouncement: (a, b) =>
            `${b.plural(a.optionCount, { one: () => `${b.number(a.optionCount)} možnosť`, other: () => `${b.number(a.optionCount)} možnosti/-\xed` })} k dispoz\xedcii.`,
          focusAnnouncement: (a, b) =>
            `${b.select({ true: () => `Zadan\xe1 skupina ${a.groupTitle}, s ${b.plural(a.groupCount, { one: () => `${b.number(a.groupCount)} možnosťou`, other: () => `${b.number(a.groupCount)} možnosťami` })}. `, other: '' }, a.isGroupChange)}${a.optionText}${b.select({ true: ', vybraté', other: '' }, a.isSelected)}`,
          listboxLabel: 'Návrhy',
          selectedAnnouncement: (a) => `${a.optionText}, vybrat\xe9`,
        },
        'sl-SI': {
          buttonLabel: 'Prikaži predloge',
          countAnnouncement: (a, b) =>
            `Na voljo je ${b.plural(a.optionCount, { one: () => `${b.number(a.optionCount)} opcija`, other: () => `${b.number(a.optionCount)} opcije` })}.`,
          focusAnnouncement: (a, b) =>
            `${b.select({ true: () => `Vnesena skupina ${a.groupTitle}, z ${b.plural(a.groupCount, { one: () => `${b.number(a.groupCount)} opcija`, other: () => `${b.number(a.groupCount)} opcije` })}. `, other: '' }, a.isGroupChange)}${a.optionText}${b.select({ true: ', izbrano', other: '' }, a.isSelected)}`,
          listboxLabel: 'Predlogi',
          selectedAnnouncement: (a) => `${a.optionText}, izbrano`,
        },
        'sr-SP': {
          buttonLabel: 'Prikaži predloge',
          countAnnouncement: (a, b) =>
            `Dostupno još: ${b.plural(a.optionCount, { one: () => `${b.number(a.optionCount)} opcija`, other: () => `${b.number(a.optionCount)} opcije/a` })}.`,
          focusAnnouncement: (a, b) =>
            `${b.select({ true: () => `Unesena grupa ${a.groupTitle}, s ${b.plural(a.groupCount, { one: () => `${b.number(a.groupCount)} opcijom`, other: () => `${b.number(a.groupCount)} optione/a` })}. `, other: '' }, a.isGroupChange)}${a.optionText}${b.select({ true: ', izabranih', other: '' }, a.isSelected)}`,
          listboxLabel: 'Predlozi',
          selectedAnnouncement: (a) => `${a.optionText}, izabrano`,
        },
        'sv-SE': {
          buttonLabel: 'Visa förslag',
          countAnnouncement: (a, b) =>
            `${b.plural(a.optionCount, { one: () => `${b.number(a.optionCount)} alternativ`, other: () => `${b.number(a.optionCount)} alternativ` })} tillg\xe4ngliga.`,
          focusAnnouncement: (a, b) =>
            `${b.select({ true: () => `Ingick i gruppen ${a.groupTitle} med ${b.plural(a.groupCount, { one: () => `${b.number(a.groupCount)} alternativ`, other: () => `${b.number(a.groupCount)} alternativ` })}. `, other: '' }, a.isGroupChange)}${a.optionText}${b.select({ true: ', valda', other: '' }, a.isSelected)}`,
          listboxLabel: 'Förslag',
          selectedAnnouncement: (a) => `${a.optionText}, valda`,
        },
        'tr-TR': {
          buttonLabel: 'Önerileri göster',
          countAnnouncement: (a, b) =>
            `${b.plural(a.optionCount, { one: () => `${b.number(a.optionCount)} se\xe7enek`, other: () => `${b.number(a.optionCount)} se\xe7enekler` })} kullanılabilir.`,
          focusAnnouncement: (a, b) =>
            `${b.select({ true: () => `Girilen grup ${a.groupTitle}, ile ${b.plural(a.groupCount, { one: () => `${b.number(a.groupCount)} se\xe7enek`, other: () => `${b.number(a.groupCount)} se\xe7enekler` })}. `, other: '' }, a.isGroupChange)}${a.optionText}${b.select({ true: ', seçildi', other: '' }, a.isSelected)}`,
          listboxLabel: 'Öneriler',
          selectedAnnouncement: (a) => `${a.optionText}, se\xe7ildi`,
        },
        'uk-UA': {
          buttonLabel: 'Показати пропозиції',
          countAnnouncement: (a, b) =>
            `${b.plural(a.optionCount, { one: () => `${b.number(a.optionCount)} параметр`, other: () => `${b.number(a.optionCount)} параметри(-ів)` })} доступно.`,
          focusAnnouncement: (a, b) =>
            `${b.select({ true: () => `Введена група ${a.groupTitle}, з ${b.plural(a.groupCount, { one: () => `${b.number(a.groupCount)} параметр`, other: () => `${b.number(a.groupCount)} параметри(-ів)` })}. `, other: '' }, a.isGroupChange)}${a.optionText}${b.select({ true: ', вибрано', other: '' }, a.isSelected)}`,
          listboxLabel: 'Пропозиції',
          selectedAnnouncement: (a) => `${a.optionText}, вибрано`,
        },
        'zh-CN': {
          buttonLabel: '显示建议',
          countAnnouncement: (a, b) =>
            `有 ${b.plural(a.optionCount, { one: () => `${b.number(a.optionCount)} 个选项`, other: () => `${b.number(a.optionCount)} 个选项` })}可用。`,
          focusAnnouncement: (a, b) =>
            `${b.select({ true: () => `进入了 ${a.groupTitle} 组，其中有 ${b.plural(a.groupCount, { one: () => `${b.number(a.groupCount)} 个选项`, other: () => `${b.number(a.groupCount)} 个选项` })}. `, other: '' }, a.isGroupChange)}${a.optionText}${b.select({ true: ', 已选择', other: '' }, a.isSelected)}`,
          listboxLabel: '建议',
          selectedAnnouncement: (a) => `${a.optionText}, 已选择`,
        },
        'zh-TW': {
          buttonLabel: '顯示建議',
          countAnnouncement: (a, b) =>
            `${b.plural(a.optionCount, { one: () => `${b.number(a.optionCount)} 選項`, other: () => `${b.number(a.optionCount)} 選項` })} 可用。`,
          focusAnnouncement: (a, b) =>
            `${b.select({ true: () => `輸入的群組 ${a.groupTitle}, 有 ${b.plural(a.groupCount, { one: () => `${b.number(a.groupCount)} 選項`, other: () => `${b.number(a.groupCount)} 選項` })}. `, other: '' }, a.isGroupChange)}${a.optionText}${b.select({ true: ', 已選取', other: '' }, a.isSelected)}`,
          listboxLabel: '建議',
          selectedAnnouncement: (a) => `${a.optionText}, 已選取`,
        },
      };
      var aJ = a.i(84252),
        aK = a.i(56856),
        aL = a.i(82775);
      function aM(a, b, c) {
        let e = (0, aL.f)((a) => {
          c && !a.defaultPrevented && c(b);
        });
        (0, d.useEffect)(() => {
          let b = a?.current?.form;
          return (
            b?.addEventListener('reset', e),
            () => {
              b?.removeEventListener('reset', e);
            }
          );
        }, [a]);
      }
      var aN = a.i(22088),
        aO = a.i(28650),
        aP = a.i(58888),
        aQ = a.i(65683),
        aR = a.i(89641),
        aS = a.i(9130),
        aT = a.i(59486),
        aU = a.i(75477),
        aV = a.i(38680);
      function aW(a, b, c) {
        return null == a && null != b ? (c.getItem(b)?.textValue ?? '') : a;
      }
      var aX = a.i(25364);
      let aY = (0, d.createContext)(null),
        aZ = (0, d.createContext)(null),
        a$ = (0, F.L)(function (a, b) {
          [a, b] = (0, m.T)(a, b, aY);
          let {
              children: c,
              isDisabled: e = !1,
              isInvalid: f = !1,
              isRequired: g = !1,
              isReadOnly: h = !1,
            } = a,
            i = (0, d.useMemo)(
              () =>
                d.default.createElement(
                  as.Provider,
                  { value: { items: a.items ?? a.defaultItems } },
                  'function' == typeof c
                    ? c({
                        isOpen: !1,
                        isDisabled: e,
                        isInvalid: f,
                        isRequired: g,
                        defaultChildren: null,
                        isReadOnly: h,
                      })
                    : c,
                ),
              [c, e, f, g, h, a.items, a.defaultItems],
            );
          return d.default.createElement(ab.U, { content: i }, (c) =>
            d.default.createElement(a0, { props: a, collection: c, comboBoxRef: b }),
          );
        }),
        a_ = [I.z, l.C, G, q.S, E, n.Q];
      function a0({ props: a, collection: b, comboBoxRef: c }) {
        var e;
        let f,
          g,
          h,
          i,
          { name: j, formValue: k = 'key', allowsCustomValue: r } = a;
        r && (k = 'text');
        let { validationBehavior: s } = (0, m.C)(A) || {},
          t = a.validationBehavior ?? s ?? 'native',
          { contains: u } =
            ((e = { sensitivity: 'base' }),
            (f = (0, an.f)({ usage: 'search', ...e })),
            (g = (0, d.useCallback)(
              (a, b) =>
                0 === b.length ||
                ((a = a.normalize('NFC')),
                (b = b.normalize('NFC')),
                0 === f.compare(a.slice(0, b.length), b)),
              [f],
            )),
            (h = (0, d.useCallback)(
              (a, b) =>
                0 === b.length ||
                ((a = a.normalize('NFC')),
                (b = b.normalize('NFC')),
                0 === f.compare(a.slice(-b.length), b)),
              [f],
            )),
            (i = (0, d.useCallback)(
              (a, b) => {
                if (0 === b.length) return !0;
                a = a.normalize('NFC');
                let c = 0,
                  d = (b = b.normalize('NFC')).length;
                for (; c + d <= a.length; c++) {
                  let e = a.slice(c, c + d);
                  if (0 === f.compare(b, e)) return !0;
                }
                return !1;
              },
              [f],
            )),
            (0, d.useMemo)(() => ({ startsWith: g, endsWith: h, contains: i }), [g, h, i])),
          x = (function (a) {
            let {
                defaultFilter: b,
                menuTrigger: c = 'input',
                allowsEmptyCollection: e = !1,
                allowsCustomValue: f,
                shouldCloseOnBlur: g = !0,
                selectionMode: h = 'single',
              } = a,
              [i, j] = (0, d.useState)(!1),
              [k, l] = (0, d.useState)(!1),
              [m, n] = (0, d.useState)(null),
              o = (0, d.useRef)(!1),
              p = (0, d.useMemo)(
                () =>
                  void 0 !== a.defaultValue
                    ? a.defaultValue
                    : 'single' === h
                      ? (a.defaultSelectedKey ?? null)
                      : [],
                [a.defaultValue, a.defaultSelectedKey, h],
              ),
              q = (0, d.useMemo)(
                () => (void 0 !== a.value ? a.value : 'single' === h ? a.selectedKey : void 0),
                [a.value, a.selectedKey, h],
              ),
              [r, s] = (0, aT.f)(q, p, a.onChange),
              t = 'single' === h && Array.isArray(r) ? r[0] : r,
              u = (b) => {
                if ('single' === h) {
                  let c = Array.isArray(b) ? (b[0] ?? null) : b;
                  (s(c), c !== t && a.onSelectionChange?.(c));
                } else {
                  let a = [];
                  (Array.isArray(b) ? (a = b) : null != b && (a = [b]), s(a));
                }
              },
              {
                collection: v,
                selectionManager: x,
                disabledKeys: y,
              } = ak({
                ...a,
                items: a.items ?? a.defaultItems,
                selectionMode: h,
                disallowEmptySelection: 'single' === h,
                allowDuplicateSelectionEvents: !0,
                selectedKeys: (0, d.useMemo)(
                  () =>
                    (function (a) {
                      if (void 0 !== a) return null === a ? [] : Array.isArray(a) ? a : [a];
                    })(t),
                  [t],
                ),
                onSelectionChange: (b) => {
                  if ('all' !== b)
                    if ('single' === h) {
                      let c = b.values().next().value ?? null;
                      c === t ? (a.onSelectionChange?.(c), Q(), N()) : u(c);
                    } else u([...b]);
                },
              }),
              z = 'single' === h ? x.firstSelectedKey : null,
              A = (0, d.useMemo)(
                () => [...x.selectedKeys].map((a) => v.getItem(a)).filter((a) => null != a),
                [x.selectedKeys, v],
              ),
              [B, C] = (0, aT.f)(
                a.inputValue,
                aW(a.defaultInputValue, z, v) || '',
                a.onInputChange,
              ),
              [D] = (0, d.useState)(t),
              [E] = (0, d.useState)(B),
              F = (0, d.useMemo)(() => {
                var c;
                return null == a.items && b
                  ? new ag(
                      (function a(b, c, d, e) {
                        let f = [];
                        for (let g of c)
                          if ('section' === g.type && g.hasChildNodes) {
                            let c = a(b, (0, aU.V)(g, b), d, e);
                            [...c].some((a) => 'item' === a.type) &&
                              f.push({ ...g, childNodes: c });
                          } else
                            'item' === g.type && e(g.textValue, d)
                              ? f.push({ ...g })
                              : 'item' !== g.type && f.push({ ...g });
                        return f;
                      })((c = v), c, B, b),
                    )
                  : v;
              }, [v, B, b, a.items]),
              [G, H] = (0, d.useState)(F),
              I = (0, d.useRef)('focus'),
              J = (0, aV.f)({
                ...a,
                onOpenChange: (b) => {
                  (a.onOpenChange && a.onOpenChange(b, b ? I.current : void 0),
                    x.setFocused(b),
                    b || x.setFocusedKey(null));
                },
                isOpen: void 0,
                defaultOpen: void 0,
              }),
              K = (b = null, d) => {
                let f = 'manual' === d || ('focus' === d && 'focus' === c);
                (e || F.size > 0 || (f && v.size > 0) || a.items) &&
                  (f && !J.isOpen && void 0 === a.items && j(!0), (I.current = d), n(b), J.open());
              },
              L = (0, d.useCallback)(() => {
                H(i ? v : F);
              }, [i, v, F]),
              M = (0, d.useCallback)(
                (a = null) => {
                  (J.isOpen && L(), n(a), J.toggle());
                },
                [J, L],
              ),
              N = (0, d.useCallback)(() => {
                J.isOpen && (L(), J.close());
              }, [J, L]),
              [O, P] = (0, d.useState)(B),
              Q = () => {
                let a = null != z ? (v.getItem(z)?.textValue ?? '') : '';
                (P(a), C(a));
              },
              R = (0, d.useRef)(t),
              S = (0, d.useRef)(null != z ? (v.getItem(z)?.textValue ?? '') : '');
            (0, d.useEffect)(() => {
              (k && (F.size > 0 || e) && !J.isOpen && B !== O && 'manual' !== c && K(null, 'input'),
                i || e || !J.isOpen || 0 !== F.size || ((o.current = !0), N()),
                k &&
                  o.current &&
                  F.size > 0 &&
                  !J.isOpen &&
                  'manual' !== c &&
                  ((o.current = !1), K(null, 'input')),
                null != t && t !== R.current && 'single' === h && N(),
                B !== O &&
                  (x.setFocusedKey(null),
                  j(!1),
                  'single' === h &&
                    '' === B &&
                    (void 0 === a.inputValue || void 0 === q) &&
                    u(null)),
                t !== R.current && (void 0 === a.inputValue || void 0 === q)
                  ? Q()
                  : O !== B && P(B));
              let b = null != z ? (v.getItem(z)?.textValue ?? '') : '';
              (k ||
                null == z ||
                void 0 !== a.inputValue ||
                z !== R.current ||
                S.current === b ||
                (P(b), C(b)),
                (R.current = t),
                (S.current = b));
            });
            let T = w({
                ...a,
                value: (0, d.useMemo)(
                  () =>
                    Array.isArray(t) && 0 === t.length
                      ? null
                      : { inputValue: B, value: t, selectedKey: z },
                  [B, z, t],
                ),
              }),
              U = () => {
                if ('multiple' === h) {
                  (P(B), N());
                  return;
                }
                ((R.current = null), u(null), N());
              },
              V = (b = !1) => {
                if (void 0 !== q && void 0 !== a.inputValue) {
                  let c = null != z ? (v.getItem(z)?.textValue ?? '') : '';
                  ((b || 'multiple' === h || B !== c) &&
                    (a.onSelectionChange?.(z), a.onChange?.(t)),
                    P(c),
                    N());
                } else (Q(), N());
              },
              W = () => {
                ((o.current = !1),
                  f ? (B === (null != z ? (v.getItem(z)?.textValue ?? '') : '') ? V() : U()) : V());
              },
              X = (0, d.useRef)([B, t]),
              Y = (0, d.useMemo)(() => (J.isOpen ? (i ? v : F) : G), [J.isOpen, v, F, i, G]),
              Z = a.defaultSelectedKey ?? ('single' === h ? D : null);
            return {
              ...T,
              ...J,
              focusStrategy: m,
              toggle: (b = null, d) => {
                let f = 'manual' === d || ('focus' === d && 'focus' === c);
                (e || F.size > 0 || (f && v.size > 0) || a.items || J.isOpen) &&
                  (f && !J.isOpen && void 0 === a.items && j(!0),
                  J.isOpen || (I.current = d),
                  M(b));
              },
              open: K,
              close: W,
              selectionManager: x,
              value: t,
              defaultValue: p ?? D,
              setValue: u,
              selectedKey: z,
              selectedItems: A,
              defaultSelectedKey: Z,
              setSelectedKey: u,
              disabledKeys: y,
              isFocused: k,
              setFocused: (b) => {
                (b
                  ? ((X.current = [B, t]), 'focus' !== c || a.isReadOnly || K(null, 'focus'))
                  : (g && W(), (B !== X.current[0] || t !== X.current[1]) && T.commitValidation()),
                  l(b));
              },
              selectedItem: A[0] ?? null,
              collection: Y,
              inputValue: B,
              defaultInputValue: aW(a.defaultInputValue, Z, v) ?? E,
              setInputValue: C,
              commit: () => {
                J.isOpen && null != x.focusedKey
                  ? x.isSelected(x.focusedKey) && 'single' === h
                    ? V(!0)
                    : x.select(x.focusedKey)
                  : W();
              },
              revert: () => {
                ((o.current = !1), f && null == z ? U() : V());
              },
            };
          })({
            ...a,
            defaultFilter: a.defaultFilter || u,
            items: a.items,
            children: void 0,
            collection: b,
            validationBehavior: t,
          }),
          y = (0, d.useRef)(null),
          z = (0, d.useRef)(null),
          B = (0, d.useRef)(null),
          D = (0, d.useRef)(null),
          F = (0, d.useRef)(null),
          [H, J] = (0, m.Z)(!a['aria-label'] && !a['aria-labelledby']),
          [K, L] = (0, d.useState)('label'),
          {
            buttonProps: M,
            inputProps: N,
            listBoxProps: O,
            labelProps: P,
            descriptionProps: Q,
            errorMessageProps: R,
            valueProps: U,
            ...X
          } = (function (a, b) {
            var c, e, f;
            let g,
              h,
              i,
              {
                buttonRef: j,
                popoverRef: k,
                inputRef: l,
                listBoxRef: m,
                keyboardDelegate: n,
                layoutDelegate: p,
                shouldFocusWrap: q,
                isReadOnly: r,
                isDisabled: s,
              } = a,
              t = (0, d.useRef)(null);
            j = j ?? t;
            let u = (0, aO.f)((c = aI) && c.__esModule ? c.default : c, '@react-aria/combobox'),
              { menuTriggerProps: x, menuProps: y } = (0, aP.f)(
                { type: 'listbox', isDisabled: s || r },
                b,
                j,
              );
            S.set(b, { id: y.id });
            let { collection: z } = b,
              { disabledKeys: A } = b.selectionManager,
              B = (0, d.useMemo)(
                () =>
                  n || new (0, af.f)({ collection: z, disabledKeys: A, ref: m, layoutDelegate: p }),
                [n, p, z, A, m],
              ),
              { collectionProps: D } = (0, aQ.f)({
                selectionManager: b.selectionManager,
                keyboardDelegate: B,
                disallowTypeAhead: !0,
                disallowEmptySelection: !0,
                shouldFocusWrap: q,
                ref: l,
                isVirtualized: !0,
              }),
              E = (0, _.U)(),
              { keyboardProps: F } = (0, ap.f)({
                shortcuts: {
                  Enter: (a) => {
                    let c = b.isOpen;
                    if (b.isOpen && m.current && null != b.selectionManager.focusedKey) {
                      let d = b.collection.getItem(b.selectionManager.focusedKey);
                      if (d?.props.href) {
                        let e = m.current.querySelector(
                          `[data-key="${CSS.escape(b.selectionManager.focusedKey.toString())}"]`,
                        );
                        return (
                          e instanceof HTMLAnchorElement &&
                            E.open(e, a, d.props.href, d.props.routerOptions),
                          b.close(),
                          { shouldPreventDefault: c }
                        );
                      }
                      if (d?.props.onAction)
                        return (d.props.onAction(), b.close(), { shouldPreventDefault: c });
                    }
                    return (b.commit(), { shouldPreventDefault: c });
                  },
                  Tab: () => {
                    if (b.isOpen && m.current && null != b.selectionManager.focusedKey) {
                      let a = b.collection.getItem(b.selectionManager.focusedKey);
                      if (a?.props.href) return (b.close(), { shouldPreventDefault: !1 });
                      if (a?.props.onAction)
                        return (
                          a.props.onAction(),
                          b.close(),
                          { shouldPreventDefault: !1, shouldContinuePropagation: !0 }
                        );
                    }
                    return (
                      b.isOpen && b.commit(),
                      { shouldPreventDefault: !1, shouldContinuePropagation: !0 }
                    );
                  },
                  Escape: () => {
                    let c = !1;
                    return (
                      (!b.selectionManager.isEmpty || '' === b.inputValue || a.allowsCustomValue) &&
                        (c = !0),
                      b.revert(),
                      { shouldContinuePropagation: c }
                    );
                  },
                },
              }),
              { keyboardProps: G } = (0, ap.f)({
                shortcuts: {
                  ArrowDown: () => (b.open('first', 'manual'), { shouldPreventDefault: !1 }),
                  ArrowUp: () => (b.open('last', 'manual'), { shouldPreventDefault: !1 }),
                  ArrowLeft: () => (
                    b.selectionManager.setFocusedKey(null),
                    { shouldPreventDefault: !1 }
                  ),
                  ArrowRight: () => (
                    b.selectionManager.setFocusedKey(null),
                    { shouldPreventDefault: !1 }
                  ),
                },
                allowRepeats: !0,
              }),
              H = (function (a = []) {
                let b = (0, V.H)(),
                  [c, e] = (0, d.useState)(!0),
                  [f, g] = (0, d.useState)(a);
                return (
                  f.some((b, c) => !Object.is(b, a[c])) && (e(!0), g(a)),
                  (0, d.useEffect)(() => {
                    c && !document.getElementById(b) && e(!1);
                  }, [b, c, f]),
                  c ? b : void 0
                );
              })([b.selectionManager.selectedKeys, b.selectionManager.selectionMode]),
              { isInvalid: I, validationErrors: J, validationDetails: K } = b.displayValidation,
              {
                labelProps: L,
                inputProps: M,
                descriptionProps: N,
                errorMessageProps: O,
              } = (function (a, b) {
                let {
                    inputElementType: c = 'input',
                    isDisabled: e = !1,
                    isRequired: f = !1,
                    isReadOnly: g = !1,
                    type: h = 'text',
                    validationBehavior: i = 'aria',
                  } = a,
                  [j, k] = (0, aT.f)(a.value, a.defaultValue || '', a.onChange),
                  { focusableProps: l } = (0, aR.F)(a, b),
                  m = w({ ...a, value: j }),
                  { isInvalid: n, validationErrors: p, validationDetails: q } = m.displayValidation,
                  {
                    labelProps: r,
                    fieldProps: s,
                    descriptionProps: t,
                    errorMessageProps: u,
                  } = (function (a) {
                    let { description: b, errorMessage: c, isInvalid: d, validationState: e } = a,
                      { labelProps: f, fieldProps: g } = (0, W.f)(a),
                      h = (0, V.i)([!!b, !!c, d, e]),
                      i = (0, V.i)([!!b, !!c, d, e]);
                    return {
                      labelProps: f,
                      fieldProps: (g = (0, C.f)(g, {
                        'aria-describedby':
                          [h, i, a['aria-describedby']].filter(Boolean).join(' ') || void 0,
                      })),
                      descriptionProps: { id: h },
                      errorMessageProps: { id: i },
                    };
                  })({ ...a, isInvalid: n, errorMessage: a.errorMessage || p }),
                  v = (0, o.f)(a, { labelable: !0 }),
                  x = { type: h, pattern: a.pattern },
                  [y] = (0, d.useState)(j);
                return (
                  aM(b, a.defaultValue ?? y, k),
                  !(function (a, b, c) {
                    let { validationBehavior: e, focus: f } = a;
                    (0, aS.f)(() => {
                      if (
                        'native' === e &&
                        c?.current &&
                        'setCustomValidity' in c.current &&
                        !c.current.disabled
                      ) {
                        var a;
                        let d,
                          e = b.realtimeValidation.isInvalid
                            ? b.realtimeValidation.validationErrors.join(' ') || 'Invalid value.'
                            : '';
                        (c.current.setCustomValidity(e),
                          c.current.hasAttribute('title') || (c.current.title = ''),
                          b.realtimeValidation.isInvalid ||
                            b.updateValidation({
                              isInvalid: !(a = c.current).validity.valid,
                              validationDetails: {
                                badInput: (d = a.validity).badInput,
                                customError: d.customError,
                                patternMismatch: d.patternMismatch,
                                rangeOverflow: d.rangeOverflow,
                                rangeUnderflow: d.rangeUnderflow,
                                stepMismatch: d.stepMismatch,
                                tooLong: d.tooLong,
                                tooShort: d.tooShort,
                                typeMismatch: d.typeMismatch,
                                valueMissing: d.valueMissing,
                                valid: d.valid,
                              },
                              validationErrors: a.validationMessage ? [a.validationMessage] : [],
                            }));
                      }
                    });
                    let g = (0, d.useRef)(!1),
                      h = (0, aL.f)(() => {
                        g.current || b.resetValidation();
                      }),
                      i = (0, aL.f)((a) => {
                        b.displayValidation.isInvalid || b.commitValidation();
                        let d = c?.current?.form;
                        (!a.defaultPrevented &&
                          c &&
                          d &&
                          (function (a) {
                            for (let b = 0; b < a.elements.length; b++) {
                              let c = a.elements[b];
                              if (c.validity?.valid === !1) return c;
                            }
                            return null;
                          })(d) === c.current &&
                          (f ? f() : c.current?.focus(), (0, Z.I)('keyboard')),
                          a.preventDefault());
                      }),
                      j = (0, aL.f)(() => {
                        b.commitValidation();
                      });
                    (0, d.useEffect)(() => {
                      let a = c?.current;
                      if (!a) return;
                      let b = a.form,
                        d = b?.reset;
                      return (
                        b &&
                          (b.reset = () => {
                            ((g.current =
                              !window.event ||
                              ('message' === window.event.type &&
                                (0, aG.t)(window.event) instanceof MessagePort)),
                              d?.call(b),
                              (g.current = !1));
                          }),
                        a.addEventListener('invalid', i),
                        a.addEventListener('change', j),
                        b?.addEventListener('reset', h),
                        () => {
                          (a.removeEventListener('invalid', i),
                            a.removeEventListener('change', j),
                            b?.removeEventListener('reset', h),
                            b && (b.reset = d));
                        }
                      );
                    }, [c, e]);
                  })(a, m, b),
                  {
                    labelProps: r,
                    inputProps: (0, C.f)(v, 'input' === c ? x : void 0, {
                      disabled: e,
                      readOnly: g,
                      required: f && 'native' === i,
                      'aria-required': (f && 'aria' === i) || void 0,
                      'aria-invalid': n || void 0,
                      'aria-errormessage': a['aria-errormessage'],
                      'aria-activedescendant': a['aria-activedescendant'],
                      'aria-autocomplete': a['aria-autocomplete'],
                      'aria-haspopup': a['aria-haspopup'],
                      'aria-controls': a['aria-controls'],
                      value: j,
                      onChange: (a) => k((0, aG.t)(a).value),
                      autoComplete: a.autoComplete,
                      autoCapitalize: a.autoCapitalize,
                      maxLength: a.maxLength,
                      minLength: a.minLength,
                      name: a.name,
                      form: a.form,
                      placeholder: a.placeholder,
                      inputMode: a.inputMode,
                      autoCorrect: a.autoCorrect,
                      spellCheck: a.spellCheck,
                      [parseInt(d.default.version, 10) >= 17 ? 'enterKeyHint' : 'enterkeyhint']:
                        a.enterKeyHint,
                      onCopy: a.onCopy,
                      onCut: a.onCut,
                      onPaste: a.onPaste,
                      onCompositionEnd: a.onCompositionEnd,
                      onCompositionStart: a.onCompositionStart,
                      onCompositionUpdate: a.onCompositionUpdate,
                      onSelect: a.onSelect,
                      onBeforeInput: a.onBeforeInput,
                      onInput: a.onInput,
                      ...l,
                      ...s,
                    }),
                    descriptionProps: t,
                    errorMessageProps: u,
                    isInvalid: n,
                    validationErrors: p,
                    validationDetails: q,
                  }
                );
              })(
                {
                  ...a,
                  isRequired:
                    'multiple' === a.selectionMode
                      ? a.isRequired && b.selectionManager.isEmpty
                      : a.isRequired,
                  onChange: b.setInputValue,
                  onKeyDown: r
                    ? a.onKeyDown
                    : (0, Y.f)(b.isOpen && D.onKeyDown, F.onKeyDown, G.onKeyDown, a.onKeyDown),
                  onBlur: (c) => {
                    let d = (0, aG.C)(j.current, c.relatedTarget),
                      e = (0, aG.C)(k.current, c.relatedTarget);
                    d || e || (a.onBlur && a.onBlur(c), b.setFocused(!1));
                  },
                  value: b.inputValue,
                  defaultValue: b.defaultInputValue,
                  onFocus: (c) => {
                    b.isFocused || (a.onFocus && a.onFocus(c), b.setFocused(!0));
                  },
                  autoComplete: 'off',
                  validate: void 0,
                  [v]: b,
                  'aria-describedby':
                    [H, a['aria-describedby']].filter(Boolean).join(' ') || void 0,
                },
                l,
              );
            aM(l, b.defaultValue, b.setValue);
            let P = (0, aN.f)({
                id: x.id,
                'aria-label': u.format('buttonLabel'),
                'aria-labelledby': a['aria-labelledby'] || L.id,
              }),
              Q = (0, aN.f)({
                id: y.id,
                'aria-label': u.format('listboxLabel'),
                'aria-labelledby': a['aria-labelledby'] || L.id,
              }),
              R = (0, d.useRef)(0),
              U =
                null != b.selectionManager.focusedKey && b.isOpen
                  ? b.collection.getItem(b.selectionManager.focusedKey)
                  : void 0,
              X = U?.parentKey ?? null,
              $ = b.selectionManager.focusedKey ?? null,
              ab = (0, d.useRef)(X),
              ac = (0, d.useRef)($);
            (0, d.useEffect)(() => {
              if ((0, aJ.G)() && null != U && null != $ && $ !== ac.current) {
                let a = b.selectionManager.isSelected($),
                  c = null != X ? b.collection.getItem(X) : null,
                  d = c?.['aria-label'] || ('string' == typeof c?.rendered ? c.rendered : '') || '',
                  e = u.format('focusAnnouncement', {
                    isGroupChange: (c && X !== ab.current) ?? !1,
                    groupTitle: d,
                    groupCount: c ? [...(0, aU.V)(c, b.collection)].length : 0,
                    optionText: U['aria-label'] || U.textValue || '',
                    isSelected: a,
                  });
                (0, aD.f)(e);
              }
              ((ab.current = X), (ac.current = $));
            });
            let ad = (0, aa.f)(b.collection),
              ae = (0, d.useRef)(ad),
              ag = (0, d.useRef)(b.isOpen);
            (0, d.useEffect)(() => {
              let a =
                b.isOpen !== ag.current && (null == b.selectionManager.focusedKey || (0, aJ.G)());
              if (b.isOpen && (a || ad !== ae.current)) {
                let a = u.format('countAnnouncement', { optionCount: ad });
                (0, aD.f)(a);
              }
              ((ae.current = ad), (ag.current = b.isOpen));
            });
            let ah = (0, d.useRef)(b.selectedKey);
            return (
              (0, d.useEffect)(() => {
                if ((0, aJ.G)() && b.isFocused && b.selectedItem && b.selectedKey !== ah.current) {
                  let a = b.selectedItem['aria-label'] || b.selectedItem.textValue || '',
                    c = u.format('selectedAnnouncement', { optionText: a });
                  (0, aD.f)(c);
                }
                ah.current = b.selectedKey;
              }),
              (0, d.useEffect)(() => {
                if (b.isOpen) return (0, aE.P)([l.current, k.current].filter((a) => null != a));
              }, [b.isOpen, l, k]),
              (e = () => {
                !U &&
                  l.current &&
                  (0, aG.z)((0, aH.o)(l.current)) === l.current &&
                  (0, aF.r)(l.current, null);
              }),
              (f = [U]),
              (g = (0, d.useRef)(!0)),
              (h = (0, d.useRef)(null)),
              (i = (0, aL.f)(e)),
              (0, d.useEffect)(
                () => (
                  (g.current = !0),
                  () => {
                    g.current = !1;
                  }
                ),
                [],
              ),
              (0, d.useEffect)(() => {
                let a = h.current;
                (g.current
                  ? (g.current = !1)
                  : (!a || f.some((b, c) => !Object.is(b, a[c]))) && i(),
                  (h.current = f));
              }, f),
              (0, aK.f)(
                m,
                'react-aria-item-action',
                b.isOpen
                  ? () => {
                      b.close();
                    }
                  : void 0,
              ),
              {
                labelProps: {
                  ...L,
                  onClick:
                    ('htmlFor' in L && L.htmlFor) || a.isDisabled
                      ? void 0
                      : () => {
                          (l.current?.focus(), (0, Z.I)('keyboard'));
                        },
                },
                buttonProps: {
                  ...x,
                  ...P,
                  excludeFromTabOrder: !0,
                  preventFocusOnPress: !0,
                  onPress: (a) => {
                    'touch' === a.pointerType && (l.current?.focus(), b.toggle(null, 'manual'));
                  },
                  onPressStart: (a) => {
                    'touch' !== a.pointerType &&
                      (l.current?.focus(),
                      b.toggle(
                        'keyboard' === a.pointerType || 'virtual' === a.pointerType
                          ? 'first'
                          : null,
                        'manual',
                      ));
                  },
                  isDisabled: s || r,
                },
                inputProps: (0, C.f)(M, {
                  role: 'combobox',
                  'aria-expanded': x['aria-expanded'],
                  'aria-controls': b.isOpen ? y.id : void 0,
                  'aria-autocomplete': 'list',
                  'aria-activedescendant': U ? T(b, U.key) : void 0,
                  onTouchEnd: (a) => {
                    if (s || r) return;
                    if (a.timeStamp - R.current < 500) {
                      (a.preventDefault(), l.current?.focus());
                      return;
                    }
                    let c = (0, aG.t)(a).getBoundingClientRect(),
                      d = a.changedTouches[0],
                      e = Math.ceil(c.left + 0.5 * c.width),
                      f = Math.ceil(c.top + 0.5 * c.height);
                    d.clientX === e &&
                      d.clientY === f &&
                      (a.preventDefault(),
                      l.current?.focus(),
                      b.toggle(null, 'manual'),
                      (R.current = a.timeStamp));
                  },
                  autoCorrect: 'off',
                  spellCheck: 'false',
                }),
                listBoxProps: (0, C.f)(y, Q, {
                  onAction: void 0,
                  autoFocus: b.focusStrategy || !0,
                  shouldUseVirtualFocus: !0,
                  shouldSelectOnPressUp: !0,
                  shouldFocusOnHover: !0,
                  linkBehavior: 'selection',
                  UNSTABLE_itemBehavior: 'action',
                }),
                valueProps: { id: H },
                descriptionProps: N,
                errorMessageProps: O,
                isInvalid: I,
                validationErrors: J,
                validationDetails: K,
              }
            );
          })(
            {
              ...(0, m.h)(a),
              label: J,
              inputRef: z,
              buttonRef: y,
              listBoxRef: D,
              popoverRef: F,
              name: 'text' === k ? j : void 0,
              validationBehavior: t,
              labelElementType: K,
            },
            x,
          ),
          [$, ab] = (0, d.useState)(null),
          ac = (0, d.useCallback)(() => {
            if (z.current && !B.current) {
              let a = y.current?.getBoundingClientRect(),
                b = z.current.getBoundingClientRect(),
                c = a ? Math.min(a.left, b.left) : b.left;
              ab((a ? Math.max(a.right, b.right) : b.right) - c + 'px');
            }
          }, [y, z, ab]);
        (0, aX.f)({ ref: z, onResize: ac });
        let ad = (0, d.useMemo)(
            () => ({
              get current() {
                return B.current || z.current;
              },
            }),
            [B, z],
          ),
          ae = (0, d.useMemo)(
            () => ({
              isOpen: x.isOpen,
              isDisabled: a.isDisabled || !1,
              isInvalid: X.isInvalid || !1,
              isRequired: a.isRequired || !1,
              isReadOnly: a.isReadOnly || !1,
            }),
            [x.isOpen, a.isDisabled, X.isInvalid, a.isRequired, a.isReadOnly],
          ),
          ah = (0, m.U)({ ...a, values: ae, defaultClassName: 'react-aria-ComboBox' }),
          ai = (0, o.f)(a, { global: !0 });
        delete ai.id;
        let aj = [];
        if (j && 'key' === k) {
          let b = Array.isArray(x.value) ? x.value : [x.value];
          (0 === b.length && (b = [null]),
            (aj = b.map((b, c) =>
              d.default.createElement('input', {
                key: c,
                type: 'hidden',
                name: j,
                form: a.form,
                value: b ?? '',
              }),
            )));
        }
        return d.default.createElement(
          m.g,
          {
            values: [
              [aZ, x],
              [I.z, { ...P, elementType: K, ref: H }],
              [l.C, { ...M, ref: y, isPressed: x.isOpen }],
              [G, { ...N, ref: z }],
              [
                q.S,
                {
                  ...N,
                  ref: (0, d.useCallback)((a) => {
                    ((z.current = a),
                      a && L('input' === a.tagName.toLowerCase() ? 'label' : 'span'));
                  }, []),
                  value: x.inputValue,
                  onChange: (a) => x.setInputValue(a),
                },
              ],
              [aB.f, x],
              [
                aC.g,
                {
                  ref: F,
                  triggerRef: ad,
                  scrollRef: D,
                  placement: 'bottom start',
                  isNonModal: !0,
                  trigger: 'ComboBox',
                  style: { '--trigger-width': $ },
                  clearContexts: a_,
                },
              ],
              [as, { ...O, ref: D }],
              [at, x],
              [n.Q, { slots: { description: Q, errorMessage: R } }],
              [E, { ref: B, isInvalid: X.isInvalid, isDisabled: a.isDisabled || !1 }],
              [p, X],
              [a1, U],
            ],
          },
          d.default.createElement(
            m.P.div,
            {
              ...ai,
              ...ah,
              ref: c,
              slot: a.slot || void 0,
              'data-focused': x.isFocused || void 0,
              'data-open': x.isOpen || void 0,
              'data-disabled': a.isDisabled || void 0,
              'data-readonly': a.isReadOnly || void 0,
              'data-invalid': X.isInvalid || void 0,
              'data-required': a.isRequired || void 0,
            },
            ah.children,
            aj,
          ),
        );
      }
      let a1 = (0, d.createContext)(null);
      var a2 = a.i(72063);
      let a3 = (0, d.createContext)(null);
      function a4(a) {
        return a && 'object' == typeof a && 'id' in a ? String(a.id) : String(a);
      }
      function a5({
        value: a,
        defaultValue: b = null,
        onChange: f,
        getKey: g = a4,
        children: h,
        disabled: j,
        invalid: k,
        className: l,
        'aria-label': m,
      }) {
        let [n, o] = (0, i.u)({ value: a, defaultValue: b, onChange: f }),
          p = (0, d.useRef)(new Map());
        return (0, c.jsx)(a3.Provider, {
          value: { getKey: g, register: (a, b) => p.current.set(a, b) },
          children: (0, c.jsx)(a$, {
            'aria-label': m,
            selectedKey: null == n ? null : g(n),
            onSelectionChange: (a) => {
              o(null === a ? null : (p.current.get(String(a)) ?? null));
            },
            isDisabled: j,
            isInvalid: k,
            menuTrigger: 'focus',
            allowsEmptyCollection: !0,
            className: (0, e.c)('mrd_Combobox-module_root__9zp44', l),
            children: h,
          }),
        });
      }
      ((a5.Label = function ({ className: a, children: b }) {
        return (0, c.jsx)(I.Q, {
          className: (0, e.c)('mrd_Combobox-module_label__KVkZO', a),
          children: b,
        });
      }),
        (a5.Description = function ({ children: a }) {
          return (0, c.jsx)(n.p, {
            slot: 'description',
            className: 'mrd_Combobox-module_description__Ezq3h',
            children: a,
          });
        }),
        (a5.Input = function ({ placeholder: a, size: d = 'md' }) {
          return (0, c.jsxs)('div', {
            className: 'mrd_Combobox-module_inputWrap__LWRcs',
            children: [
              (0, c.jsx)(H, {
                placeholder: a,
                className: (0, e.c)(a2.f.control, a2.f[d], 'mrd_Combobox-module_input__-HTv1'),
              }),
              (0, c.jsx)(l.K, {
                className: 'mrd_Combobox-module_toggle__U-id0',
                children: (0, c.jsx)(b.I, { name: 'chevron-down', size: 16 }),
              }),
            ],
          });
        }),
        (a5.List = function ({ emptyMessage: a = 'No results found.', children: b }) {
          return (0, c.jsx)(aC.V, {
            className: 'mrd_Combobox-module_popover__Ijy89',
            offset: 6,
            children: (0, c.jsx)(au, {
              className: 'mrd_Combobox-module_list__dh-us',
              renderEmptyState: () =>
                (0, c.jsx)('div', { className: 'mrd_Combobox-module_empty__Ahw5K', children: a }),
              children: b,
            }),
          });
        }),
        (a5.Option = function ({ value: a, textValue: e, disabled: f, children: g }) {
          let { getKey: h, register: i } = (function (a) {
              let b = (0, d.useContext)(a3);
              if (!b) throw Error(`<${a}> must be rendered inside <Combobox>.`);
              return b;
            })('Combobox.Option'),
            j = h(a);
          return (
            i(j, a),
            (0, c.jsx)(ay, {
              id: j,
              textValue: e ?? ('string' == typeof g ? g : j),
              isDisabled: f,
              className: 'mrd_Combobox-module_option__vhhn5',
              children: ({ isSelected: a }) =>
                (0, c.jsxs)(c.Fragment, {
                  children: [
                    (0, c.jsx)('span', {
                      className: 'mrd_Combobox-module_optionText__PoNcV',
                      children: g,
                    }),
                    a &&
                      (0, c.jsx)(b.I, {
                        name: 'check',
                        size: 16,
                        className: 'mrd_Combobox-module_check__9yQbP',
                      }),
                  ],
                }),
            })
          );
        }),
        a.i(32051));
      var a6 = a.i(49215),
        a7 = a.i(88240);
      let a8 = 'u' > typeof document ? d.useLayoutEffect : d.useEffect,
        a9 = { top: 'bottom', bottom: 'top', left: 'right', right: 'left' };
      function ba(a, b, c, d, e) {
        let f = 0,
          g = 0;
        return (
          'top' === c || 'bottom' === c
            ? ((f = 'bottom' === c ? a.bottom + e : a.top - b.height - e),
              (g =
                'start' === d
                  ? a.left
                  : 'end' === d
                    ? a.right - b.width
                    : a.left + a.width / 2 - b.width / 2))
            : ((g = 'right' === c ? a.right + e : a.left - b.width - e),
              (f =
                'start' === d
                  ? a.top
                  : 'end' === d
                    ? a.bottom - b.height
                    : a.top + a.height / 2 - b.height / 2)),
          { top: f, left: g }
        );
      }
      let [bb, bc] = (0, h.c)('Popover', 'Popover part');
      function bd({ open: a, defaultOpen: b = !1, onOpenChange: e, children: f }) {
        let [g, h] = (0, i.u)({ value: a, defaultValue: b, onChange: e }),
          j = (0, d.useRef)(null),
          k = (0, d.useId)();
        return (0, c.jsx)(bb, {
          value: { open: g, setOpen: h, triggerRef: j, contentId: k },
          children: f,
        });
      }
      function be({
        placement: a = 'bottom',
        align: b = 'start',
        className: f,
        children: g,
        ...h
      }) {
        let { setOpen: i, triggerRef: j, contentId: k } = bc(),
          l = (0, d.useRef)(null),
          m = (function (
            a,
            b,
            {
              open: c,
              placement: e = 'bottom',
              align: f = 'start',
              offset: g = 6,
              matchWidth: h = !1,
            },
          ) {
            let [i, j] = (0, d.useState)(null);
            return (
              a8(() => {
                let c = () => {
                  let c = a.current,
                    d = b.current;
                  if (!c || !d) return;
                  let i = c.getBoundingClientRect(),
                    k = d.getBoundingClientRect(),
                    l = window.innerWidth,
                    m = window.innerHeight,
                    n = e,
                    o = ba(i, k, n, f, g),
                    p = (a) =>
                      a.top < 8 ||
                      a.left < 8 ||
                      a.top + k.height > m - 8 ||
                      a.left + k.width > l - 8;
                  if (p(o)) {
                    let a = ba(i, k, a9[n], f, g);
                    p(a) || ((n = a9[n]), (o = a));
                  }
                  let q = Math.min(Math.max(o.left, 8), Math.max(8, l - k.width - 8));
                  j({
                    top: Math.min(Math.max(o.top, 8), Math.max(8, m - k.height - 8)),
                    left: q,
                    placement: n,
                    minWidth: h ? i.width : void 0,
                  });
                };
                return (
                  c(),
                  window.addEventListener('resize', c),
                  window.addEventListener('scroll', c, !0),
                  () => {
                    (window.removeEventListener('resize', c),
                      window.removeEventListener('scroll', c, !0));
                  }
                );
              }, [c, e, f, g, h, a, b]),
              i
            );
          })(j, l, { open: !0, placement: a, align: b });
        return (
          (0, a7.u)(() => i(!1)),
          (function (a, b, c = !0) {
            let e = (0, d.useRef)(b);
            e.current = b;
            let f = (0, d.useRef)(a);
            ((f.current = a),
              (0, d.useEffect)(() => {
                if (!c) return;
                let a = (a) => {
                  let b = a.target;
                  b && (f.current.some((a) => a.current?.contains(b)) || e.current(a));
                };
                return (
                  document.addEventListener('pointerdown', a),
                  () => document.removeEventListener('pointerdown', a)
                );
              }, [c]));
          })([l, j], () => i(!1)),
          (0, a7.a)(l, { active: !0, trap: !1, restoreFocus: !0 }),
          (0, c.jsx)('div', {
            ref: l,
            id: k,
            role: 'dialog',
            tabIndex: -1,
            className: (0, e.c)('mrd_Popover-module_content__O07fj', f),
            'data-placement': m?.placement ?? a,
            style: { top: m?.top ?? 0, left: m?.left ?? 0, opacity: +!!m },
            ...h,
            children: g,
          })
        );
      }
      ((bd.Trigger = function ({ children: a }) {
        let { open: b, setOpen: c, triggerRef: e, contentId: g } = bc();
        if (!(0, d.isValidElement)(a))
          throw Error('<Popover.Trigger> needs a single element child.');
        let h = a.ref,
          i = a.props.onClick;
        return (0, d.cloneElement)(a, {
          ref: f(h, e),
          'aria-haspopup': 'dialog',
          'aria-expanded': b,
          'aria-controls': b ? g : void 0,
          onClick: (a) => {
            (i?.(a), c(!b));
          },
        });
      }),
        (bd.Content = function (a) {
          let { open: b } = bc();
          return b ? (0, c.jsx)(a6.P, { children: (0, c.jsx)(be, { ...a }) }) : null;
        }),
        a.i(74978),
        a.i(46702),
        a.i(13902));
      let [bf, bg] = (0, h.c)('Accordion', 'Accordion.Item');
      (a.i(48616), a.i(19272), a.i(43020), a.i(66524), a.i(29206));
      let bh = (0, d.createContext)(null),
        bi = 'meridian-theme',
        bj = ['light', 'dark', 'high-contrast'];
      a.s(
        [
          'J',
          0,
          function ({
            children: a,
            defaultTheme: b = 'system',
            storageKey: e = bi,
            persist: f = !0,
          }) {
            let [g, h] = (0, d.useState)(b),
              [i, j] = (0, d.useState)('light');
            ((0, d.useEffect)(() => {
              if (!f) return;
              let a = (function (a) {
                try {
                  let b = window.localStorage.getItem(a);
                  if ('system' === b || bj.includes(b)) return b;
                } catch {}
                return null;
              })(e);
              a && h(a);
            }, [f, e]),
              (0, d.useEffect)(() => {
                j('light');
                let a = ['(prefers-color-scheme: dark)', '(prefers-contrast: more)'].map((a) =>
                    window.matchMedia(a),
                  ),
                  b = () => j('light');
                return (
                  a.forEach((a) => a.addEventListener?.('change', b)),
                  () => a.forEach((a) => a.removeEventListener?.('change', b))
                );
              }, []));
            let k = 'system' === g ? i : g;
            (0, d.useEffect)(() => {
              document.documentElement.setAttribute('data-theme', k);
            }, [k]);
            let l = (0, d.useCallback)(
                (a) => {
                  if ((h(a), f))
                    try {
                      window.localStorage.setItem(e, a);
                    } catch {}
                },
                [f, e],
              ),
              m = (0, d.useMemo)(() => ({ preference: g, theme: k, setTheme: l }), [g, k, l]);
            return (0, c.jsx)(bh.Provider, { value: m, children: a });
          },
          'w',
          0,
          function (a = bi) {
            return `(function(){try{var s=localStorage.getItem(${JSON.stringify(a)});var m=window.matchMedia;var t=s&&s!=="system"?s:(m("(prefers-contrast: more)").matches?"high-contrast":m("(prefers-color-scheme: dark)").matches?"dark":"light");document.documentElement.setAttribute("data-theme",t)}catch(e){}})();`;
          },
          'i',
          0,
          function () {
            let a = (0, d.useContext)(bh);
            if (!a) throw Error('useTheme must be used inside <ThemeProvider>.');
            return a;
          },
        ],
        22703,
      );
    },
    12962,
    (a, b, c) => {
      Object.defineProperty(c, '__esModule', { value: !0 });
      var d = {
        cancelIdleCallback: function () {
          return g;
        },
        requestIdleCallback: function () {
          return f;
        },
      };
      for (var e in d) Object.defineProperty(c, e, { enumerable: !0, get: d[e] });
      let f =
          ('u' > typeof self &&
            self.requestIdleCallback &&
            self.requestIdleCallback.bind(window)) ||
          function (a) {
            let b = Date.now();
            return self.setTimeout(function () {
              a({
                didTimeout: !1,
                timeRemaining: function () {
                  return Math.max(0, 50 - (Date.now() - b));
                },
              });
            }, 1);
          },
        g =
          ('u' > typeof self && self.cancelIdleCallback && self.cancelIdleCallback.bind(window)) ||
          function (a) {
            return clearTimeout(a);
          };
      ('function' == typeof c.default || ('object' == typeof c.default && null !== c.default)) &&
        void 0 === c.default.__esModule &&
        (Object.defineProperty(c.default, '__esModule', { value: !0 }),
        Object.assign(c.default, c),
        (b.exports = c.default));
    },
    96665,
    (a, b, c) => {
      Object.defineProperty(c, '__esModule', { value: !0 });
      var d = {
        default: function () {
          return u;
        },
        handleClientScriptLoad: function () {
          return r;
        },
        initScriptLoader: function () {
          return s;
        },
      };
      for (var e in d) Object.defineProperty(c, e, { enumerable: !0, get: d[e] });
      let f = a.r(33354),
        g = a.r(46058),
        h = a.r(87924),
        i = f._(a.r(35112)),
        j = g._(a.r(72131)),
        k = a.r(92966),
        l = a.r(30089),
        m = a.r(12962),
        n = a.r(32807),
        o = new Map(),
        p = new Set(),
        q = (a) => {
          let {
              src: b,
              id: c,
              onLoad: d = () => {},
              onReady: e = null,
              dangerouslySetInnerHTML: f,
              children: g = '',
              strategy: h = 'afterInteractive',
              onError: j,
              stylesheets: k,
            } = a,
            m = c || b;
          if (m && p.has(m)) return;
          if (o.has(b)) {
            (p.add(m), o.get(b).then(d, j));
            return;
          }
          let n = () => {
              (e && e(), p.add(m));
            },
            q = document.createElement('script'),
            r = new Promise((a, b) => {
              (q.addEventListener('load', function (b) {
                (a(), d && d.call(this, b), n());
              }),
                q.addEventListener('error', function (a) {
                  b(a);
                }));
            }).catch(function (a) {
              j && j(a);
            });
          (f
            ? ((q.innerHTML = f.__html || ''), n())
            : g
              ? ((q.textContent = 'string' == typeof g ? g : Array.isArray(g) ? g.join('') : ''),
                n())
              : b && ((q.src = b), o.set(b, r)),
            (0, l.setAttributesFromProps)(q, a),
            'worker' === h && q.setAttribute('type', 'text/partytown'),
            q.setAttribute('data-nscript', h),
            k &&
              ((a) => {
                if (i.default.preinit)
                  return a.forEach((a) => {
                    i.default.preinit(a, { as: 'style' });
                  });
              })(k),
            document.body.appendChild(q));
        };
      function r(a) {
        let { strategy: b = 'afterInteractive' } = a;
        'lazyOnload' === b
          ? window.addEventListener('load', () => {
              (0, m.requestIdleCallback)(() => q(a));
            })
          : q(a);
      }
      function s(a) {
        (a.forEach(r),
          [
            ...document.querySelectorAll('[data-nscript="beforeInteractive"]'),
            ...document.querySelectorAll('[data-nscript="beforePageRender"]'),
          ].forEach((a) => {
            let b = a.id || a.getAttribute('src');
            p.add(b);
          }));
      }
      function t(a) {
        let {
            id: b,
            src: c = '',
            onLoad: d = () => {},
            onReady: e = null,
            strategy: f = 'afterInteractive',
            onError: g,
            stylesheets: l,
            ...o
          } = a,
          {
            updateScripts: r,
            scripts: s,
            getIsSsr: t,
            appDir: u,
            nonce: v,
          } = (0, j.useContext)(k.HeadManagerContext);
        v = o.nonce || v;
        let w = (0, j.useRef)(!1);
        (0, j.useEffect)(() => {
          let a = b || c;
          w.current || (e && a && p.has(a) && e(), (w.current = !0));
        }, [e, b, c]);
        let x = (0, j.useRef)(!1);
        if (
          ((0, j.useEffect)(() => {
            if (!x.current) {
              if ('afterInteractive' === f) q(a);
              else
                'lazyOnload' === f &&
                  ('complete' === document.readyState
                    ? (0, m.requestIdleCallback)(() => q(a))
                    : window.addEventListener('load', () => {
                        (0, m.requestIdleCallback)(() => q(a));
                      }));
              x.current = !0;
            }
          }, [a, f]),
          ('beforeInteractive' === f || 'worker' === f) &&
            (r
              ? ((s[f] = (s[f] || []).concat([
                  { id: b, src: c, onLoad: d, onReady: e, onError: g, ...o, nonce: v },
                ])),
                r(s))
              : t && t()
                ? p.add(b || c)
                : t && !t() && q({ ...a, nonce: v })),
          u)
        ) {
          if (
            (l &&
              l.forEach((a) => {
                i.default.preinit(a, { as: 'style' });
              }),
            'beforeInteractive' === f)
          )
            if (!c)
              return (
                o.dangerouslySetInnerHTML &&
                  ((o.children = o.dangerouslySetInnerHTML.__html),
                  delete o.dangerouslySetInnerHTML),
                (0, h.jsx)('script', {
                  nonce: v,
                  dangerouslySetInnerHTML: {
                    __html: `(self.__next_s=self.__next_s||[]).push(${(0, n.htmlEscapeJsonString)(JSON.stringify([0, { ...o, id: b }]))})`,
                  },
                })
              );
            else
              return (
                i.default.preload(
                  c,
                  o.integrity
                    ? { as: 'script', integrity: o.integrity, nonce: v, crossOrigin: o.crossOrigin }
                    : { as: 'script', nonce: v, crossOrigin: o.crossOrigin },
                ),
                (0, h.jsx)('script', {
                  nonce: v,
                  dangerouslySetInnerHTML: {
                    __html: `(self.__next_s=self.__next_s||[]).push(${(0, n.htmlEscapeJsonString)(JSON.stringify([c, { ...o, id: b }]))})`,
                  },
                })
              );
          'afterInteractive' === f &&
            c &&
            i.default.preload(
              c,
              o.integrity
                ? { as: 'script', integrity: o.integrity, nonce: v, crossOrigin: o.crossOrigin }
                : { as: 'script', nonce: v, crossOrigin: o.crossOrigin },
            );
        }
        return null;
      }
      Object.defineProperty(t, '__nextScript', { value: !0 });
      let u = t;
      ('function' == typeof c.default || ('object' == typeof c.default && null !== c.default)) &&
        void 0 === c.default.__esModule &&
        (Object.defineProperty(c.default, '__esModule', { value: !0 }),
        Object.assign(c.default, c),
        (b.exports = c.default));
    },
    30089,
    (a, b, c) => {
      (Object.defineProperty(c, '__esModule', { value: !0 }),
        Object.defineProperty(c, 'setAttributesFromProps', {
          enumerable: !0,
          get: function () {
            return g;
          },
        }));
      let d = {
          acceptCharset: 'accept-charset',
          className: 'class',
          htmlFor: 'for',
          httpEquiv: 'http-equiv',
          noModule: 'noModule',
        },
        e = [
          'onLoad',
          'onReady',
          'dangerouslySetInnerHTML',
          'children',
          'onError',
          'strategy',
          'stylesheets',
        ];
      function f(a) {
        return ['async', 'defer', 'noModule'].includes(a);
      }
      function g(a, b) {
        for (let [c, g] of Object.entries(b)) {
          if (!b.hasOwnProperty(c) || e.includes(c) || void 0 === g) continue;
          let h = d[c] || c.toLowerCase();
          ('SCRIPT' === a.tagName && f(h) ? (a[h] = !!g) : a.setAttribute(h, String(g)),
            (!1 === g || ('SCRIPT' === a.tagName && f(h) && (!g || 'false' === g))) &&
              (a.setAttribute(h, ''), a.removeAttribute(h)));
        }
      }
      ('function' == typeof c.default || ('object' == typeof c.default && null !== c.default)) &&
        void 0 === c.default.__esModule &&
        (Object.defineProperty(c.default, '__esModule', { value: !0 }),
        Object.assign(c.default, c),
        (b.exports = c.default));
    },
    92966,
    (a, b, c) => {
      b.exports = a.r(42602).vendored.contexts.HeadManagerContext;
    },
    32807,
    (a, b, c) => {
      Object.defineProperty(c, '__esModule', { value: !0 });
      var d = {
        ESCAPE_REGEX: function () {
          return g;
        },
        htmlEscapeAttributeString: function () {
          return k;
        },
        htmlEscapeJsonString: function () {
          return j;
        },
      };
      for (var e in d) Object.defineProperty(c, e, { enumerable: !0, get: d[e] });
      let f = {
          '&': '\\u0026',
          '>': '\\u003e',
          '<': '\\u003c',
          '\u2028': '\\u2028',
          '\u2029': '\\u2029',
        },
        g = /[&><\u2028\u2029]/g,
        h = { '&': '&amp;', '"': '&quot;', "'": '&#39;', '<': '&lt;', '>': '&gt;' },
        i = /[&"'<>]/g;
      function j(a) {
        return a.replace(g, (a) => f[a]);
      }
      function k(a) {
        return a.replace(i, (a) => h[a]);
      }
    },
  ],
  3716,
  (a) => {
    a.v({
      brand: 'QhslZW_brand',
      count: 'QhslZW_count',
      header: 'QhslZW_header',
      inner: 'QhslZW_inner',
      link: 'QhslZW_link',
      name: 'QhslZW_name',
      nav: 'QhslZW_nav',
    });
  },
  47283,
  (a, b, c) => {
    b.exports = a.r(96665);
  },
];

//# sourceMappingURL=_0_mhfnw405945._.js.map
