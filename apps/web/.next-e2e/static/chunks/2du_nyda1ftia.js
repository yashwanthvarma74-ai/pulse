(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([
  'object' == typeof document ? document.currentScript : void 0,
  [
    92179,
    (e) => {
      let t;
      var s = e.i(43476),
        i = e.i(12598);
      function n(e, t, s) {
        let i,
          n = s.initialDeps ?? [],
          l = !0;
        function r() {
          let r = e();
          return (
            (r.length !== n.length || r.some((e, t) => n[t] !== e)) &&
              ((n = r),
              (i = t(...r)),
              (null == s ? void 0 : s.onChange) && !(l && s.skipInitialOnChange) && s.onChange(i),
              (l = !1)),
            i
          );
        }
        return (
          (r.updateDeps = (e) => {
            n = e;
          }),
          r
        );
      }
      function l(e, t) {
        if (void 0 !== e) return e;
        throw Error(`Unexpected undefined${t ? `: ${t}` : ''}`);
      }
      let r = (e, t) => 1.01 > Math.abs(e - t),
        o = () => {
          if (void 0 !== t) return t;
          if ('u' < typeof navigator) return (t = !1);
          if (/iP(hone|od|ad)/.test(navigator.userAgent)) return (t = !0);
          let e = navigator.maxTouchPoints;
          return (t = 'MacIntel' === navigator.platform && void 0 !== e && e > 0);
        },
        a = (e) => e,
        h = (e) => {
          let t = e.overscan * Math.max(e.lanes ?? 1, 1),
            s = Math.max(e.startIndex - t, 0),
            i = Math.min(e.endIndex + t, e.count - 1) - s + 1,
            n = Array(i);
          for (let e = 0; e < i; e++) n[e] = s + e;
          return n;
        },
        d = { passive: !0 },
        c = (e, t) => {
          let s = e.scrollElement;
          if (!s) return;
          let i = () => {
            t({ width: s.innerWidth, height: s.innerHeight });
          };
          return (
            i(),
            s.addEventListener('resize', i, d),
            () => {
              s.removeEventListener('resize', i);
            }
          );
        },
        u = 'u' < typeof window || 'onscrollend' in window,
        f = (e, t) =>
          ((e, t, s) => {
            var i, n;
            let l,
              r = e.scrollElement;
            if (!r) return;
            let o = e.targetWindow;
            if (!o) return;
            let a = e.options.useScrollendEvent && u,
              h = 0,
              c = a
                ? null
                : ((i = () => t(s(r), !1)),
                  (n = e.options.isScrollingResetDelay),
                  Object.assign(
                    function (...e) {
                      (o.clearTimeout(l), (l = o.setTimeout(() => i.apply(this, e), n)));
                    },
                    {
                      cancel: () => {
                        o.clearTimeout(l);
                      },
                    },
                  )),
              f = (e) => () => {
                ((h = s(r)), null == c || c(), t(h, e));
              },
              m = f(!0),
              g = f(!1);
            return (
              r.addEventListener('scroll', m, d),
              a && r.addEventListener('scrollend', g, d),
              () => {
                (r.removeEventListener('scroll', m),
                  a && r.removeEventListener('scrollend', g),
                  null == c || c.cancel());
              }
            );
          })(e, t, (t) => (e.options.horizontal ? t.scrollX : t.scrollY)),
        m = (e, t, s) => {
          if (s.options.useCachedMeasurements) {
            let t = s.indexFromElement(e),
              i = s.options.getItemKey(t);
            return s.itemSizeCache.get(i) ?? s.options.estimateSize(t);
          }
          if (null == t ? void 0 : t.borderBoxSize) {
            let e = t.borderBoxSize[0];
            if (e) return Math.round(e[s.options.horizontal ? 'inlineSize' : 'blockSize']);
          }
          if (!t) {
            let t = s.indexFromElement(e),
              i = s.options.getItemKey(t),
              n = s.itemSizeCache.get(i);
            if (void 0 !== n) return n;
          }
          return e[s.options.horizontal ? 'offsetWidth' : 'offsetHeight'];
        },
        g = (e, { adjustments: t = 0, behavior: s }, i) => {
          var n, l;
          null == (l = null == (n = i.scrollElement) ? void 0 : n.scrollTo) ||
            l.call(n, { [i.options.horizontal ? 'left' : 'top']: e + t, behavior: s });
        },
        p = (e, t) => ('smooth' === e ? (t ? 'smoothLanded' : 'smooth') : 'instant'),
        S = (e) =>
          (null == e ? void 0 : e.phase) === 'smooth' ||
          (null == e ? void 0 : e.phase) === 'smoothLanded';
      class v {
        constructor(e) {
          let t, s, i;
          ((this.unsubs = []),
            (this.scrollElement = null),
            (this.targetWindow = null),
            (this.isScrolling = !1),
            (this.scrollState = null),
            (this.measurementsCache = []),
            (this._singleLaneMeasurements = null),
            (this.itemSizeCache = new Map()),
            (this.itemSizeCacheVersion = 0),
            (this.laneAssignments = new Map()),
            (this.pendingMin = null),
            (this.prevLanes = void 0),
            (this.lanesChangedFlag = !1),
            (this.lanesSettling = !1),
            (this.pendingScrollAnchor = null),
            (this.scrollRect = null),
            (this.scrollOffset = null),
            (this.scrollDirection = null),
            (this.scrollAdjustments = 0),
            (this._iosDeferredAdjustment = 0),
            (this._iosTouching = !1),
            (this._iosJustTouchEnded = !1),
            (this._iosTouchEndTimerId = null),
            (this._intendedScrollOffset = null),
            (this._clampedAdjustment = null),
            (this.elementsCache = new Map()),
            (this._resizeBatch = null),
            (this.now = () => {
              var e, t, s;
              return (
                (null ==
                (s =
                  null == (t = null == (e = this.targetWindow) ? void 0 : e.performance)
                    ? void 0
                    : t.now)
                  ? void 0
                  : s.call(t)) ?? Date.now()
              );
            }),
            (this.observer =
              ((t = null),
              (s = () =>
                t ||
                (this.targetWindow && this.targetWindow.ResizeObserver
                  ? (t = new this.targetWindow.ResizeObserver((e) => {
                      let t = () => {
                        let t = { sync: !1 };
                        this._resizeBatch = t;
                        try {
                          e.forEach(i);
                        } finally {
                          ((this._resizeBatch = null),
                            t.notify && (this.notify(t.sync), this._retryClampedAdjustment()));
                        }
                      };
                      this.options.useAnimationFrameWithResizeObserver
                        ? requestAnimationFrame(t)
                        : t();
                    }))
                  : null)),
              (i = (e) => {
                let t = e.target,
                  s = this.indexFromElement(t);
                if (!t.isConnected) {
                  for (let [e, s] of (this.observer.unobserve(t), this.elementsCache))
                    if (s === t) {
                      this.elementsCache.delete(e);
                      break;
                    }
                  return;
                }
                this.isIndexInRange(s) &&
                  this.shouldMeasureDuringScroll(s) &&
                  this.resizeItem(s, this.options.measureElement(t, e, this));
              }),
              {
                disconnect: () => {
                  var e;
                  (null == (e = s()) || e.disconnect(), (t = null));
                },
                observe: (e) => {
                  var t;
                  return null == (t = s()) ? void 0 : t.observe(e, { box: 'border-box' });
                },
                unobserve: (e) => {
                  var t;
                  return null == (t = s()) ? void 0 : t.unobserve(e);
                },
              })),
            (this.range = null),
            (this.setOptions = (e) => {
              var t;
              let s = {
                debug: !1,
                initialOffset: 0,
                overscan: 1,
                paddingStart: 0,
                paddingEnd: 0,
                scrollPaddingStart: 0,
                scrollPaddingEnd: 0,
                horizontal: !1,
                getItemKey: a,
                rangeExtractor: h,
                onChange: () => {},
                measureElement: m,
                initialRect: { width: 0, height: 0 },
                scrollMargin: 0,
                gap: 0,
                indexAttribute: 'data-index',
                initialMeasurementsCache: [],
                lanes: 1,
                anchorTo: 'start',
                followOnAppend: !1,
                scrollEndThreshold: 1,
                isScrollingResetDelay: 150,
                enabled: !0,
                isRtl: !1,
                useScrollendEvent: !1,
                useAnimationFrameWithResizeObserver: !1,
                laneAssignmentMode: 'estimate',
                useCachedMeasurements: !1,
              };
              for (let t in e) {
                let i = e[t];
                void 0 !== i && (s[t] = i);
              }
              let i = this.options,
                n = null,
                l = null,
                r = !1;
              if (
                void 0 !== i &&
                i.enabled &&
                s.enabled &&
                'end' === s.anchorTo &&
                null !== this.scrollElement
              ) {
                let e = i.count,
                  o = s.count,
                  a = this.getMeasurements(),
                  h = (null == (t = this._singleLaneMeasurements) ? void 0 : t.items) ?? a,
                  d = (e) => {
                    var t;
                    return 'object' == typeof (t = h[e]) ? t.key : t;
                  },
                  c = e > 0 ? d(0) : null,
                  u = e > 0 ? d(e - 1) : null;
                if (
                  o !== e ||
                  (e > 0 && o > 0 && (s.getItemKey(0) !== c || s.getItemKey(o - 1) !== u))
                ) {
                  r = !0;
                  let t =
                    e > 0 ? (this.getVirtualItemForOffset(this.getScrollOffset()) ?? a[0]) : null;
                  t && (n = [t.key, this.getScrollOffset() - t.start]);
                  let h = !0 === s.followOnAppend ? 'auto' : s.followOnAppend || null;
                  h &&
                    o > 0 &&
                    this.isAtEnd(i.scrollEndThreshold) &&
                    (0 === e || s.getItemKey(o - 1) !== u) &&
                    (o > e ||
                      (function (e, t, s, i) {
                        if (0 === t) return !1;
                        let n = i(0),
                          l = new Set(),
                          r = 0;
                        for (; r < e;) {
                          let e = s(r);
                          if (e === n) break;
                          (l.add(e), r++);
                        }
                        let o = e - r;
                        if (0 === o || o >= t) return !1;
                        for (let e = 0; e < o; e++) if (i(e) !== s(r + e)) return !1;
                        for (let e = o; e < t; e++) if (l.has(i(e))) return !1;
                        return !0;
                      })(e, o, d, s.getItemKey)) &&
                    (l = h);
                }
              }
              ((this.options = s), r && ((this.pendingMin = 0), this.itemSizeCacheVersion++));
              let o = !1,
                d = 0;
              if (n && null !== this.scrollOffset) {
                let [e, t] = n,
                  s = this.getMeasurements(),
                  { count: i, getItemKey: r } = this.options,
                  a = 0;
                for (; a < i && r(a) !== e;) a++;
                if (a < i) {
                  let e = s[a];
                  if (e) {
                    let s = Math.max(0, e.start + t);
                    l ||
                      s === this.scrollOffset ||
                      ((d = s - this.scrollOffset), (this.scrollOffset = s), (o = !0));
                  }
                }
              }
              (o || l) && (this.pendingScrollAnchor = [o ? n[0] : null, o ? n[1] : 0, l, d]);
            }),
            (this.notify = (e) => {
              var t, s;
              null == (s = (t = this.options).onChange) || s.call(t, this, e);
            }),
            (this.maybeNotify = n(
              () => (
                this.calculateRange(),
                [
                  this.isScrolling,
                  this.range ? this.range.startIndex : null,
                  this.range ? this.range.endIndex : null,
                ]
              ),
              (e) => {
                this.notify(e);
              },
              {
                key: !1,
                debug: () => this.options.debug,
                initialDeps: [
                  this.isScrolling,
                  this.range ? this.range.startIndex : null,
                  this.range ? this.range.endIndex : null,
                ],
              },
            )),
            (this.cleanup = () => {
              (this.unsubs.filter(Boolean).forEach((e) => e()),
                (this.unsubs = []),
                this.observer.disconnect(),
                null != this.rafId &&
                  this.targetWindow &&
                  (this.targetWindow.cancelAnimationFrame(this.rafId), (this.rafId = null)),
                (this.scrollState = null),
                (this.isScrolling = !1),
                (this.scrollDirection = null),
                (this._iosDeferredAdjustment = 0),
                (this._iosTouching = !1),
                (this._iosJustTouchEnded = !1),
                (this._clampedAdjustment = null),
                (this.scrollElement = null),
                (this.targetWindow = null));
            }),
            (this._didMount = () => () => {
              this.cleanup();
            }),
            (this._willUpdate = () => {
              var e;
              let t = this.options.enabled ? this.options.getScrollElement() : null;
              if (this.scrollElement !== t) {
                if ((this.cleanup(), !t)) return void this.maybeNotify();
                if (
                  ((this.scrollElement = t),
                  this.scrollElement && 'ownerDocument' in this.scrollElement
                    ? (this.targetWindow = this.scrollElement.ownerDocument.defaultView)
                    : (this.targetWindow =
                        (null == (e = this.scrollElement) ? void 0 : e.window) ?? null),
                  this.elementsCache.forEach((e) => {
                    this.observer.observe(e);
                  }),
                  this.unsubs.push(
                    this.options.observeElementRect(this, (e) => {
                      ((this.scrollRect = e), this.maybeNotify());
                    }),
                  ),
                  this.unsubs.push(
                    this.options.observeElementOffset(this, (e, t) => {
                      var s;
                      if (t && null === this._intendedScrollOffset && e === this.scrollOffset)
                        return;
                      if (
                        null !== this._intendedScrollOffset &&
                        1.5 > Math.abs(e - this._intendedScrollOffset)
                      )
                        e = this._intendedScrollOffset;
                      else {
                        let t;
                        (null == (s = this.scrollState) ? void 0 : s.index) != null &&
                          'smooth' !== (t = this.scrollState).phase &&
                          'smoothFinishing' !== t.phase &&
                          !r(e, this.scrollState.lastTargetOffset) &&
                          !r(e, this.getScrollStateTarget(this.scrollState)) &&
                          (null === this._clampedAdjustment ||
                            Math.abs(e - this._clampedAdjustment.maxAtWrite) >= 1.5) &&
                          (this.scrollState = null);
                      }
                      ((this._intendedScrollOffset = null),
                        this.scrollState && (this.scrollState.writtenOffset = null),
                        null !== this._clampedAdjustment &&
                          Math.abs(e - this._clampedAdjustment.maxAtWrite) >= 1.5 &&
                          (this._clampedAdjustment = null),
                        (this.scrollAdjustments = 0));
                      let i = this.getScrollOffset();
                      ((this.scrollDirection = t
                        ? i === e
                          ? this.scrollDirection
                          : i < e
                            ? 'forward'
                            : 'backward'
                        : null),
                        (this.scrollOffset = e),
                        (this.isScrolling = t),
                        this._flushIosDeferredIfReady(),
                        this.scrollState && this.scheduleScrollReconcile(),
                        this.maybeNotify());
                    }),
                  ),
                  'addEventListener' in this.scrollElement)
                ) {
                  let e = this.scrollElement,
                    t = () => {
                      ((this._iosTouching = !0),
                        (this._iosJustTouchEnded = !1),
                        null !== this._iosTouchEndTimerId &&
                          null != this.targetWindow &&
                          (this.targetWindow.clearTimeout(this._iosTouchEndTimerId),
                          (this._iosTouchEndTimerId = null)));
                    },
                    s = () => {
                      ((this._iosTouching = !1),
                        o() &&
                          null != this.targetWindow &&
                          ((this._iosJustTouchEnded = !0),
                          (this._iosTouchEndTimerId = this.targetWindow.setTimeout(() => {
                            ((this._iosJustTouchEnded = !1),
                              (this._iosTouchEndTimerId = null),
                              this._flushIosDeferredIfReady());
                          }, 150))));
                    };
                  (e.addEventListener('touchstart', t, d),
                    e.addEventListener('touchend', s, d),
                    e.addEventListener('touchcancel', s, d),
                    this.unsubs.push(() => {
                      (e.removeEventListener('touchstart', t),
                        e.removeEventListener('touchend', s),
                        e.removeEventListener('touchcancel', s),
                        null !== this._iosTouchEndTimerId &&
                          null != this.targetWindow &&
                          (this.targetWindow.clearTimeout(this._iosTouchEndTimerId),
                          (this._iosTouchEndTimerId = null)));
                    }));
                }
                this._scrollToOffset(this.getScrollOffset(), {
                  adjustments: void 0,
                  behavior: void 0,
                });
              }
              let s = this.pendingScrollAnchor;
              if (
                ((this.pendingScrollAnchor = null), s && this.scrollElement && this.options.enabled)
              ) {
                let [e, t, i, n] = s;
                (null === e ||
                  i ||
                  (o() && (this.isScrolling || this._iosTouching || this._iosJustTouchEnded)
                    ? 0 !== n && (this._iosDeferredAdjustment += n)
                    : (S(this.scrollState) &&
                        !r(this.getScrollOffset() - n, this.scrollState.lastTargetOffset)) ||
                      this._scrollToOffset(this.getScrollOffset(), {
                        adjustments: void 0,
                        behavior: void 0,
                      })),
                  i && this.scrollToEnd({ behavior: i }));
              }
              this._retryClampedAdjustment();
            }),
            (this._retryClampedAdjustment = () => {
              if (null === this._clampedAdjustment || !this.scrollElement || !this.options.enabled)
                return;
              let { target: e, maxAtWrite: t } = this._clampedAdjustment,
                s = this.getMaxScrollOffset();
              s > t + 0.5 &&
                ((this._clampedAdjustment = e > s + 0.5 ? { target: e, maxAtWrite: s } : null),
                this._scrollToOffset(e, { adjustments: void 0, behavior: void 0 }));
            }),
            (this._flushIosDeferredIfReady = () => {
              if (
                0 === this._iosDeferredAdjustment ||
                this.isScrolling ||
                this._iosTouching ||
                this._iosJustTouchEnded
              )
                return;
              let e = this.getScrollOffset(),
                t = this.getMaxScrollOffset();
              if (e < 0 || e > t) return;
              if (this._iosDeferredAdjustment < 0 && e >= t - 1) {
                this._iosDeferredAdjustment = 0;
                return;
              }
              let s = this._iosDeferredAdjustment;
              ((this._iosDeferredAdjustment = 0),
                this._scrollToOffset(e, {
                  adjustments: (this.scrollAdjustments += s),
                  behavior: void 0,
                }));
            }),
            (this.rafId = null),
            (this.getSize = () =>
              this.options.enabled
                ? ((this.scrollRect = this.scrollRect ?? this.options.initialRect),
                  this.scrollRect[this.options.horizontal ? 'width' : 'height'])
                : ((this.scrollRect = null), 0)),
            (this.getScrollOffset = () =>
              this.options.enabled
                ? ((this.scrollOffset =
                    this.scrollOffset ??
                    ('function' == typeof this.options.initialOffset
                      ? this.options.initialOffset()
                      : this.options.initialOffset)),
                  this.scrollOffset)
                : ((this.scrollOffset = null), 0)),
            (this.getMeasurementOptions = n(
              () => [
                this.options.count,
                this.options.paddingStart,
                this.options.scrollMargin,
                this.options.getItemKey,
                this.options.enabled,
                this.options.lanes,
                this.options.laneAssignmentMode,
                this.options.gap,
              ],
              (e, t, s, i, n, l, r, o) => (
                void 0 !== this.prevLanes && this.prevLanes !== l && (this.lanesChangedFlag = !0),
                (this.prevLanes = l),
                (this.pendingMin = null),
                {
                  count: e,
                  paddingStart: t,
                  scrollMargin: s,
                  getItemKey: i,
                  enabled: n,
                  lanes: l,
                  laneAssignmentMode: r,
                  gap: o,
                }
              ),
              { key: !1 },
            )),
            (this.isIndexInRange = (e) => e >= 0 && e < this.options.count),
            (this.getMeasurements = n(
              () => [this.getMeasurementOptions(), this.itemSizeCacheVersion],
              (
                {
                  count: e,
                  paddingStart: t,
                  scrollMargin: s,
                  getItemKey: i,
                  enabled: n,
                  lanes: l,
                  laneAssignmentMode: r,
                  gap: o,
                },
                a,
              ) => {
                var h, d;
                let c = this.itemSizeCache;
                if (!n)
                  return (
                    (this.measurementsCache = []),
                    (this._singleLaneMeasurements = null),
                    this.itemSizeCache.clear(),
                    this.laneAssignments.clear(),
                    []
                  );
                if (this.laneAssignments.size > e)
                  for (let t of this.laneAssignments.keys())
                    t >= e && this.laneAssignments.delete(t);
                (this.lanesChangedFlag &&
                  ((this.lanesChangedFlag = !1),
                  (this.lanesSettling = !0),
                  (this.measurementsCache = []),
                  (this._singleLaneMeasurements = null),
                  this.itemSizeCache.clear(),
                  this.laneAssignments.clear(),
                  (this.pendingMin = null)),
                  0 !== this.measurementsCache.length ||
                    this.lanesSettling ||
                    ((this.measurementsCache = this.options.initialMeasurementsCache),
                    this.measurementsCache.forEach((e) => {
                      this.itemSizeCache.set(e.key, e.size);
                    })));
                let u = this.lanesSettling ? 0 : (this.pendingMin ?? 0);
                if (
                  ((this.pendingMin = null),
                  this.lanesSettling &&
                    this.measurementsCache.length === e &&
                    (this.lanesSettling = !1),
                  1 === l)
                ) {
                  let n,
                    l,
                    r = 2 * e,
                    a = null == (h = this._singleLaneMeasurements) ? void 0 : h.flat;
                  if (!a || a.length < r) {
                    let e = new Float64Array(r);
                    (a && u > 0 && e.set(a.subarray(0, 2 * u)), (a = e));
                  }
                  let f = 0 === u ? Array(e) : this._singleLaneMeasurements.items.slice();
                  if (0 === u) n = t + s;
                  else {
                    let e = u - 1;
                    n = a[2 * e] + a[2 * e + 1] + o;
                  }
                  for (let t = u; t < e; t++) {
                    let e = i(t);
                    f[t] = e;
                    let s = c.get(e),
                      l = 'number' == typeof s ? s : this.options.estimateSize(t);
                    ((a[2 * t] = n), (a[2 * t + 1] = l), (n += l + o));
                  }
                  this._singleLaneMeasurements = { flat: a, items: f };
                  let m =
                    ((d = a),
                    (l = f.length),
                    new Proxy(f, {
                      get(e, t, s) {
                        if ('string' == typeof t) {
                          let s = t.charCodeAt(0);
                          if (s >= 48 && s <= 57) {
                            let s = +t;
                            if (Number.isInteger(s) && s >= 0 && s < l) {
                              let t = e[s];
                              if ('object' != typeof t) {
                                let i = d[2 * s];
                                t = e[s] = {
                                  index: s,
                                  key: t,
                                  start: i,
                                  size: d[2 * s + 1],
                                  end: i + d[2 * s + 1],
                                  lane: 0,
                                };
                              }
                              return t;
                            }
                          }
                          if ('length' === t) return l;
                        }
                        return Reflect.get(e, t, s);
                      },
                    }));
                  return ((this.measurementsCache = m), m);
                }
                let f = this.measurementsCache.slice(0, u),
                  m = Array(l).fill(void 0),
                  g = new Float64Array(l),
                  p = 0;
                for (let e = 0; e < u; e++) {
                  let t = f[e];
                  t && (void 0 === m[t.lane] && p++, (m[t.lane] = e), (g[t.lane] = t.end));
                }
                for (let n = u; n < e; n++) {
                  let e,
                    a,
                    h = i(n),
                    d = this.laneAssignments.get(n),
                    u = 'estimate' === r || c.has(h);
                  if (void 0 !== d && this.options.lanes > 1) {
                    let i = m[(e = d)],
                      n = void 0 !== i ? f[i] : void 0;
                    a = n ? n.end + o : t + s;
                  } else if (p === l) {
                    let t = 0,
                      s = g[0],
                      i = m[0];
                    for (let e = 1; e < l; e++) {
                      let n = g[e];
                      (n < s || (n === s && m[e] < i)) && ((t = e), (s = n), (i = m[e]));
                    }
                    ((e = t), (a = s + o), u && this.laneAssignments.set(n, e));
                  } else
                    ((e = n % this.options.lanes),
                      (a = t + s),
                      u && this.laneAssignments.set(n, e));
                  let S = c.get(h),
                    v = 'number' == typeof S ? S : this.options.estimateSize(n),
                    x = a + v;
                  ((f[n] = { index: n, start: a, size: v, end: x, key: h, lane: e }),
                    void 0 === m[e] && p++,
                    (m[e] = n),
                    (g[e] = x));
                }
                return ((this.measurementsCache = f), f);
              },
              { key: !1, debug: () => this.options.debug },
            )),
            (this.calculateRange = n(
              () => [
                this.getMeasurements(),
                this.getSize(),
                this.getScrollOffset(),
                this.options.lanes,
              ],
              (e, t, s, i) =>
                0 === e.length || 0 === t
                  ? ((this.range = null), null)
                  : ((this.range = (function (e, t, s, i, n) {
                      let l = e.length - 1;
                      if (e.length <= i) return { startIndex: 0, endIndex: l };
                      if (1 === i && null !== n) {
                        let e = (function (e, t, s) {
                            let i = 0;
                            for (; i <= t;) {
                              let n = ((i + t) / 2) | 0,
                                l = e[2 * n];
                              if (l < s) i = n + 1;
                              else {
                                if (!(l > s)) return n;
                                t = n - 1;
                              }
                            }
                            return i > 0 ? i - 1 : 0;
                          })(n, l, s),
                          i = e,
                          r = s + t;
                        for (; i < l && n[2 * i] + n[2 * i + 1] < r;) i++;
                        return { startIndex: e, endIndex: i };
                      }
                      let r = x(0, l, (t) => e[t].start, s),
                        o = r;
                      if (1 === i) for (; o < l && e[o].end < s + t;) o++;
                      else if (i > 1) {
                        let n = Array(i).fill(0);
                        for (; o < l && n.some((e) => e < s + t);) {
                          let t = e[o];
                          ((n[t.lane] = t.end), o++);
                        }
                        let a = Array(i).fill(s + t);
                        for (; r >= 0 && a.some((e) => e >= s);) {
                          let t = e[r];
                          ((a[t.lane] = t.start), r--);
                        }
                        ((r = Math.max(0, r - (r % i))), (o = Math.min(l, o + (i - 1 - (o % i)))));
                      }
                      return { startIndex: r, endIndex: o };
                    })(
                      e,
                      t,
                      s,
                      i,
                      1 === i && null !== this._singleLaneMeasurements
                        ? this._singleLaneMeasurements.flat
                        : null,
                    )),
                    this.range),
              { key: !1, debug: () => this.options.debug },
            )),
            (this.getVirtualIndexes = n(
              () => {
                let e = null,
                  t = null,
                  s = this.calculateRange();
                return (
                  s && ((e = s.startIndex), (t = s.endIndex)),
                  this.maybeNotify.updateDeps([this.isScrolling, e, t]),
                  [
                    this.options.rangeExtractor,
                    this.options.overscan,
                    this.options.count,
                    e,
                    t,
                    this.options.lanes,
                  ]
                );
              },
              (e, t, s, i, n, l) =>
                null === i || null === n
                  ? []
                  : e({ startIndex: i, endIndex: n, overscan: t, count: s, lanes: l }),
              { key: !1, debug: () => this.options.debug },
            )),
            (this.indexFromElement = (e) => {
              let t = this.options.indexAttribute,
                s = e.getAttribute(t);
              return s
                ? parseInt(s, 10)
                : (console.warn(`Missing attribute name '${t}={index}' on measured element.`), -1);
            }),
            (this.shouldMeasureDuringScroll = (e) => {
              var t;
              if (!S(this.scrollState)) return !0;
              let s =
                this.scrollState.index ??
                (null == (t = this.getVirtualItemForOffset(this.scrollState.lastTargetOffset))
                  ? void 0
                  : t.index);
              if (void 0 !== s && this.range) {
                let t = Math.max(
                    this.options.overscan,
                    Math.ceil((this.range.endIndex - this.range.startIndex) / 2),
                  ),
                  i = Math.max(0, s - t),
                  n = Math.min(this.options.count - 1, s + t);
                return e >= i && e <= n;
              }
              return !0;
            }),
            (this.measureElement = (e) => {
              if (!e)
                return void this.elementsCache.forEach((e, t) => {
                  e.isConnected || (this.observer.unobserve(e), this.elementsCache.delete(t));
                });
              let t = this.indexFromElement(e);
              if (!this.isIndexInRange(t)) return;
              let s = this.options.getItemKey(t),
                i = this.elementsCache.get(s);
              (i !== e &&
                (i && this.observer.unobserve(i),
                this.observer.observe(e),
                this.elementsCache.set(s, e)),
                e.isConnected &&
                  (!this.isScrolling || this.scrollState) &&
                  this.shouldMeasureDuringScroll(t) &&
                  this.resizeItem(t, this.options.measureElement(e, void 0, this)));
            }),
            (this.resizeItem = (e, t) => {
              var s, i, n, l;
              let o, a, h;
              if (!this.isIndexInRange(e)) return;
              (null == (s = this._resizeBatch) ? void 0 : s.sync) && this.getMeasurements();
              let d = null == (i = this._singleLaneMeasurements) ? void 0 : i.flat;
              if (1 === this.options.lanes && null != d)
                ((h = this.options.getItemKey(e)), (a = d[2 * e]), (o = d[2 * e + 1]));
              else {
                let t = this.measurementsCache[e];
                if (!t) return;
                ((h = t.key), (a = t.start), (o = t.size));
              }
              let c = this.itemSizeCache.get(h) ?? o,
                u = t - c;
              if (0 !== u) {
                let s =
                    'end' === this.options.anchorTo &&
                    !S(this.scrollState) &&
                    this.getVirtualDistanceFromEnd() <= this.options.scrollEndThreshold,
                  i = s ? this.getTotalSize() : 0,
                  d = this.getScrollOffset() + this.scrollAdjustments,
                  f = this.itemSizeCache.has(h)
                    ? a + c <= d && 'backward' !== this.scrollDirection
                    : a < d,
                  m =
                    !S(this.scrollState) &&
                    (void 0 !== this.shouldAdjustScrollPositionOnItemSizeChange
                      ? this.shouldAdjustScrollPositionOnItemSizeChange(
                          this.measurementsCache[e] ?? {
                            index: e,
                            key: h,
                            start: a,
                            size: o,
                            end: a + o,
                            lane: 0,
                          },
                          u,
                          this,
                        )
                      : f);
                ((null === this.pendingMin || e < this.pendingMin) && (this.pendingMin = e),
                  this.itemSizeCache.set(h, t),
                  this.itemSizeCacheVersion++);
                let g =
                    (null == (n = this.scrollState) ? void 0 : n.writtenOffset) != null &&
                    !r(
                      this.scrollState.writtenOffset,
                      this.getScrollOffset() + this.scrollAdjustments,
                    ),
                  p = !1;
                if (
                  (!g &&
                    (s
                      ? (p = this.applyScrollAdjustment(this.getTotalSize() - i))
                      : m && (p = this.applyScrollAdjustment(u))),
                  this._resizeBatch)
                ) {
                  ((this._resizeBatch.notify = !0), (l = this._resizeBatch).sync || (l.sync = p));
                  return;
                }
                (this.notify(p), this._retryClampedAdjustment());
              }
            }),
            (this.getVirtualItems = n(
              () => [this.getVirtualIndexes(), this.getMeasurements()],
              (e, t) => {
                let s = [];
                for (let i = 0, n = e.length; i < n; i++) {
                  let n = t[e[i]];
                  s.push(n);
                }
                return s;
              },
              { key: !1, debug: () => this.options.debug },
            )),
            (this.getVirtualItemForOffset = (e) => {
              var t;
              let s = this.getMeasurements();
              if (0 === s.length) return;
              let i = null == (t = this._singleLaneMeasurements) ? void 0 : t.flat,
                n = 1 === this.options.lanes && null != i,
                r = x(0, s.length - 1, n ? (e) => i[2 * e] : (e) => l(s[e]).start, e);
              return l(s[r]);
            }),
            (this.getMaxScrollOffset = () => {
              if (!this.scrollElement) return 0;
              if ('scrollHeight' in this.scrollElement)
                return this.options.horizontal
                  ? this.scrollElement.scrollWidth - this.scrollElement.clientWidth
                  : this.scrollElement.scrollHeight - this.scrollElement.clientHeight;
              {
                let e = this.scrollElement.document.documentElement;
                return this.options.horizontal
                  ? e.scrollWidth - this.scrollElement.innerWidth
                  : e.scrollHeight - this.scrollElement.innerHeight;
              }
            }),
            (this.getVirtualDistanceFromEnd = () =>
              Math.max(this.getTotalSize() - this.getSize() - this.getScrollOffset(), 0)),
            (this.getDistanceFromEnd = () =>
              Math.max(this.getMaxScrollOffset() - this.getScrollOffset(), 0)),
            (this.isAtEnd = (e = this.options.scrollEndThreshold) =>
              this.getDistanceFromEnd() <= e),
            (this.getOffsetForAlignment = (e, t, s = 0) => {
              if (!this.scrollElement) return 0;
              let i = this.getSize(),
                n = this.getScrollOffset();
              return (
                'auto' === t && (t = e >= n + i ? 'end' : 'start'),
                'center' === t ? (e += (s - i) / 2) : 'end' === t && (e -= i),
                Math.max(Math.min(this.getMaxScrollOffset(), e), 0)
              );
            }),
            (this.getOffsetForIndex = (e, t = 'auto') => {
              e = Math.max(0, Math.min(e, this.options.count - 1));
              let s = this.getSize(),
                i = this.getScrollOffset(),
                n = this.measurementsCache[e];
              if (!n) return;
              if ('auto' === t)
                if (n.end >= i + s - this.options.scrollPaddingEnd) t = 'end';
                else {
                  if (!(n.start <= i + this.options.scrollPaddingStart)) return [i, t];
                  t = 'start';
                }
              if ('end' === t && e === this.options.count - 1) {
                let e = this.getMaxScrollOffset();
                return [
                  Math.max(
                    Math.min(e - this.options.paddingEnd + this.options.scrollPaddingEnd, e),
                    0,
                  ),
                  t,
                ];
              }
              let l =
                'end' === t
                  ? n.end + this.options.scrollPaddingEnd
                  : n.start - this.options.scrollPaddingStart;
              return [this.getOffsetForAlignment(l, t, n.size), t];
            }),
            (this.scrollToOffset = (e, { align: t = 'start', behavior: s = 'auto' } = {}) => {
              this._iosDeferredAdjustment = 0;
              let i = this.getOffsetForAlignment(e, t),
                n = this.now();
              ((this.scrollState = {
                index: null,
                align: t,
                startedAt: n,
                lastTargetOffset: i,
                stableFrames: 0,
                phase: p(s, !1),
              }),
                this._scrollToOffset(i, { adjustments: void 0, behavior: s }),
                this.scheduleScrollReconcile());
            }),
            (this.scrollToIndex = (e, { align: t = 'auto', behavior: s = 'auto' } = {}) => {
              ((this._iosDeferredAdjustment = 0),
                (e = Math.max(0, Math.min(e, this.options.count - 1))));
              let i = this.getOffsetForIndex(e, t);
              if (!i) return;
              let [n, l] = i,
                o = this.now();
              ((this.scrollState = {
                index: e,
                align: l,
                startedAt: o,
                lastTargetOffset: n,
                stableFrames: 0,
                phase: p(s, r(n, this.getScrollOffset())),
              }),
                this._scrollToOffset(n, { adjustments: void 0, behavior: s }),
                this.scheduleScrollReconcile());
            }),
            (this.scrollBy = (e, { behavior: t = 'auto' } = {}) => {
              var s;
              let i = this.getOffsetForAlignment(
                  ((null == (s = this.scrollState) ? void 0 : s.writtenOffset) ??
                    this.getScrollOffset()) + e,
                  'start',
                ),
                n = this.now();
              ((this.scrollState = {
                index: null,
                align: 'start',
                startedAt: n,
                lastTargetOffset: i,
                stableFrames: 0,
                phase: p(t, !1),
              }),
                this._scrollToOffset(i, { adjustments: void 0, behavior: t }),
                this.scheduleScrollReconcile());
            }),
            (this.scrollToEnd = ({ behavior: e = 'auto' } = {}) => {
              if (this.options.count > 0) {
                this._iosDeferredAdjustment = 0;
                let t = Math.max(this.getMaxScrollOffset(), 0);
                ((this.scrollState = {
                  index: this.options.count - 1,
                  align: 'end',
                  toEnd: !0,
                  startedAt: this.now(),
                  lastTargetOffset: t,
                  stableFrames: 0,
                  phase: p(e, r(t, this.getScrollOffset())),
                }),
                  this._scrollToOffset(t, { adjustments: void 0, behavior: e }),
                  this.scheduleScrollReconcile());
                return;
              }
              this.scrollToOffset(Math.max(this.getTotalSize() - this.getSize(), 0), {
                behavior: e,
              });
            }),
            (this.cancelScroll = () => {
              (null != this.rafId &&
                this.targetWindow &&
                (this.targetWindow.cancelAnimationFrame(this.rafId), (this.rafId = null)),
                (this.scrollState = null));
            }),
            (this.getTotalSize = () => {
              var e, t;
              let s,
                i = this.getMeasurements();
              if (0 === i.length) s = this.options.paddingStart;
              else if (1 === this.options.lanes) {
                let n = i.length - 1,
                  l = null == (e = this._singleLaneMeasurements) ? void 0 : e.flat;
                s =
                  null != l
                    ? l[2 * n] + l[2 * n + 1]
                    : ((null == (t = i[n]) ? void 0 : t.end) ?? 0);
              } else {
                let e = Array(this.options.lanes).fill(null),
                  t = i.length - 1;
                for (; t >= 0 && e.some((e) => null === e);) {
                  let s = i[t];
                  (null === e[s.lane] && (e[s.lane] = s.end), t--);
                }
                s = Math.max(...e.filter((e) => null !== e));
              }
              return Math.max(s - this.options.scrollMargin + this.options.paddingEnd, 0);
            }),
            (this.takeSnapshot = () => {
              let e = [];
              if (0 === this.itemSizeCache.size) return e;
              for (let t of this.getMeasurements())
                t &&
                  this.itemSizeCache.has(t.key) &&
                  e.push({
                    index: t.index,
                    key: t.key,
                    start: t.start,
                    size: t.size,
                    end: t.end,
                    lane: t.lane,
                  });
              return e;
            }),
            (this._scrollToOffset = (e, { adjustments: t, behavior: s }) => {
              ((this._intendedScrollOffset = e + (t ?? 0)),
                this.scrollState &&
                  (this.scrollState.writtenOffset =
                    'smooth' === s ? null : this._intendedScrollOffset),
                this.options.scrollToFn(e, { behavior: s, adjustments: t }, this));
            }),
            (this.measure = () => {
              ((this.pendingMin = null),
                this.itemSizeCache.clear(),
                this.laneAssignments.clear(),
                this.itemSizeCacheVersion++,
                this.notify(!1));
            }),
            this.setOptions(e));
        }
        applyScrollAdjustment(e, t) {
          var s;
          if (0 === e) return !1;
          if (o() && (this.isScrolling || this._iosTouching || this._iosJustTouchEnded))
            return (
              (null == (s = this.scrollState) ? void 0 : s.index) == null &&
                (this._iosDeferredAdjustment += e),
              !1
            );
          {
            let s = this.getScrollOffset() + this.scrollAdjustments + e,
              i = this.scrollElement,
              n =
                null !== i && ('scrollHeight' in i || 'document' in i)
                  ? this.getMaxScrollOffset()
                  : null;
            return (
              (this._clampedAdjustment =
                null !== n && s > n + 0.5 ? { target: s, maxAtWrite: n } : null),
              this._scrollToOffset(this.getScrollOffset(), {
                adjustments: (this.scrollAdjustments += e),
                behavior: t,
              }),
              null !== this.scrollOffset &&
                ((this.scrollOffset += this.scrollAdjustments),
                this.scrollOffset < 0 && (this.scrollOffset = 0),
                (this.scrollAdjustments = 0)),
              !0
            );
          }
        }
        scheduleScrollReconcile() {
          if (!this.targetWindow) {
            this.scrollState = null;
            return;
          }
          null == this.rafId &&
            (this.rafId = this.targetWindow.requestAnimationFrame(() => {
              ((this.rafId = null), this.reconcileScroll());
            }));
        }
        getScrollStateTarget(e) {
          let t = e.toEnd
            ? [Math.max(this.getMaxScrollOffset(), 0)]
            : null != e.index
              ? this.getOffsetForIndex(e.index, e.align)
              : void 0;
          return t ? t[0] : e.lastTargetOffset;
        }
        reconcileScroll() {
          if (!this.scrollState || !this.scrollElement) return;
          if (this.now() - this.scrollState.startedAt > 5e3) {
            this.scrollState = null;
            return;
          }
          this.getMeasurements();
          let e = this.getScrollStateTarget(this.scrollState),
            t =
              null == this.scrollState.index
                ? 1
                : this.options.useAnimationFrameWithResizeObserver
                  ? 3
                  : 2,
            s = e !== this.scrollState.lastTargetOffset;
          if (!s && r(e, this.getScrollOffset())) {
            if (
              ('smooth' === this.scrollState.phase
                ? (this.scrollState.phase = 'smoothLanded')
                : 'smoothFinishing' === this.scrollState.phase &&
                  (this.scrollState.phase = 'instant'),
              this.scrollState.stableFrames++,
              this.scrollState.stableFrames >= t)
            ) {
              (this.getScrollOffset() !== e &&
                this._scrollToOffset(e, { adjustments: void 0, behavior: 'auto' }),
                (this.scrollState = null));
              return;
            }
          } else if (((this.scrollState.stableFrames = 0), s)) {
            let t = this.getSize() || 600,
              s = Math.abs(e - this.getScrollOffset()),
              i = S(this.scrollState) && s > t;
            ((this.scrollState.lastTargetOffset = e),
              i
                ? (this.scrollState.phase = 'smooth')
                : 'smooth' === this.scrollState.phase
                  ? (this.scrollState.phase = 'smoothFinishing')
                  : 'smoothLanded' === this.scrollState.phase &&
                    (this.scrollState.phase = 'instant'),
              this._scrollToOffset(e, { adjustments: void 0, behavior: i ? 'smooth' : 'auto' }));
          }
          this.scheduleScrollReconcile();
        }
      }
      let x = (e, t, s, i) => {
        for (; e <= t;) {
          let n = ((e + t) / 2) | 0,
            l = s(n);
          if (l < i) e = n + 1;
          else {
            if (!(l > i)) return n;
            t = n - 1;
          }
        }
        return e > 0 ? e - 1 : 0;
      };
      var y = e.i(71645),
        j = e.i(74080);
      let b = 'u' > typeof document ? y.useLayoutEffect : y.useEffect;
      var _ = e.i(60450),
        O = e.i(70684),
        E = e.i(59760),
        w = e.i(32345),
        M = e.i(67726),
        T = e.i(94108),
        A = e.i(48804),
        C = e.i(66081),
        I = e.i(33862);
      let z = new Map();
      e.s(
        [
          'f',
          0,
          function ({ source: e, label: t, empty: n }) {
            var l;
            let r = (0, A.t)(e),
              o = (0, i.d)(),
              a = JSON.stringify((0, A.F)(e)),
              {
                hasNextPage: d,
                isFetchingNextPage: u,
                isFetchNextPageError: m,
                fetchNextPage: p,
              } = r,
              S = (0, y.useMemo)(() => r.data?.pages.flatMap((e) => e.items) ?? [], [r.data]),
              x = (0, y.useRef)(null),
              [F, R] = (0, y.useState)(0),
              [L, k] = (0, y.useState)(null),
              [D, W] = (0, y.useState)(null);
            ((l = S.length > 0),
              (0, y.useEffect)(() => {
                let e;
                if (!l) return;
                let t = 0,
                  s = 0,
                  i = 0,
                  n = 0,
                  r = () => {
                    ((t += 1), (i = requestAnimationFrame(r)));
                  },
                  o = () => {
                    cancelAnimationFrame(i);
                    let e = performance.now() - s - 200;
                    (e >= 600 &&
                      performance.now() - n > 15e3 &&
                      ((n = performance.now()),
                      (0, T.n)({ scrollFps: Math.min(240, Math.round((t / e) * 1e3)) })),
                      (s = 0));
                  },
                  a = () => {
                    (s || ((s = performance.now()), (t = 0), (i = requestAnimationFrame(r))),
                      clearTimeout(e),
                      (e = setTimeout(o, 200)));
                  };
                return (
                  window.addEventListener('scroll', a, { passive: !0 }),
                  () => {
                    (window.removeEventListener('scroll', a),
                      clearTimeout(e),
                      cancelAnimationFrame(i));
                  }
                );
              }, [l]),
              (0, y.useLayoutEffect)(() => {
                x.current && R(x.current.getBoundingClientRect().top + window.scrollY);
              }, [0 === S.length]));
            let N = L ? S.findIndex((e) => e.id === L) : -1,
              P = (0, y.useCallback)(
                (e) => {
                  let t = h(e);
                  return (N >= 0 && !t.includes(N) && t.push(N), t.sort((e, t) => e - t));
                },
                [N],
              ),
              $ = (function ({
                useFlushSync: e = !0,
                directDomUpdates: t = !1,
                directDomUpdatesMode: s = 'transform',
                ...i
              }) {
                let n = y.useReducer((e) => e + 1, 0)[1],
                  l = y.useRef({
                    enabled: t,
                    mode: s,
                    container: null,
                    lastSize: null,
                    lastPositions: new WeakMap(),
                    prevRange: null,
                  });
                ((l.current.enabled = t), (l.current.mode = s));
                let r = y.useRef(!1),
                  o = (e) => {
                    let t = l.current;
                    if (!t.enabled || !t.container) return;
                    let s = e.getTotalSize();
                    if (s !== t.lastSize) {
                      t.lastSize = s;
                      let i = e.options.horizontal ? 'width' : 'height';
                      t.container.style[i] = `${s}px`;
                    }
                  },
                  a = (e, t, s) => {
                    let i = l.current,
                      n = !!e.options.horizontal,
                      r = t.start - e.options.scrollMargin;
                    i.lastPositions.get(s) !== r &&
                      (i.lastPositions.set(s, r),
                      'transform' === i.mode
                        ? (s.style.transform = n
                            ? `translate3d(${r}px, 0, 0)`
                            : `translate3d(0, ${r}px, 0)`)
                        : (s.style[n ? 'left' : 'top'] = `${r}px`));
                  },
                  h = (e) => {
                    let t = l.current;
                    if (t.enabled && t.container)
                      for (let t of (o(e), e.getVirtualItems())) {
                        let s = e.elementsCache.get(t.key);
                        s && a(e, t, s);
                      }
                  },
                  d = {
                    ...i,
                    onChange: (t, s) => {
                      var o;
                      let a = l.current,
                        d = !0;
                      if (a.enabled) {
                        h(t);
                        let e = t.range,
                          s = a.prevRange;
                        (d =
                          !s ||
                          s.isScrolling !== t.isScrolling ||
                          s.startIndex !== (null == e ? void 0 : e.startIndex) ||
                          s.endIndex !== (null == e ? void 0 : e.endIndex)) &&
                          (a.prevRange = e
                            ? {
                                startIndex: e.startIndex,
                                endIndex: e.endIndex,
                                isScrolling: t.isScrolling,
                              }
                            : null);
                      }
                      (d && (e && s && !r.current ? (0, j.flushSync)(n) : n()),
                        null == (o = i.onChange) || o.call(i, t, s));
                    },
                  },
                  [c] = y.useState(() => {
                    let e = new v(d),
                      t = e.measureElement;
                    return (
                      (e.measureElement = (s) => {
                        r.current = !0;
                        try {
                          t(s);
                        } finally {
                          r.current = !1;
                        }
                        let i = l.current;
                        if (null !== s && i.enabled && i.container) {
                          let t = e.measurementsCache[e.indexFromElement(s)];
                          t && a(e, t, s);
                        }
                      }),
                      Object.assign(e, {
                        containerRef: (t) => {
                          let s = l.current;
                          ((s.container = t), (s.lastSize = null), null !== t && h(e));
                        },
                      })
                    );
                  });
                return (
                  c.setOptions(d),
                  b(() => c._didMount(), []),
                  b(() => (o(c), c._willUpdate())),
                  b(() => {
                    h(c);
                  }),
                  c
                );
              })({
                getScrollElement: () => ('u' > typeof document ? window : null),
                observeElementRect: c,
                observeElementOffset: f,
                scrollToFn: g,
                initialOffset: () => ('u' > typeof document ? window.scrollY : 0),
                ...{
                  count: S.length,
                  estimateSize: () => 168,
                  overscan: 5,
                  scrollMargin: F,
                  getItemKey: (e) => S[e]?.id ?? e,
                  rangeExtractor: P,
                },
              }),
              G = $.getVirtualItems(),
              B = G.at(-1)?.index ?? -1;
            (0, y.useEffect)(() => {
              B >= S.length - 6 && S.length > 0 && d && !u && !m && p();
            }, [B, S.length, d, u, m, p]);
            let K = (0, y.useRef)(!1);
            if (
              ((0, y.useLayoutEffect)(() => {
                if (K.current || 0 === S.length) return;
                K.current = !0;
                let e = z.get(a);
                e && $.scrollToOffset(e);
              }, [S.length, a, $]),
              (0, y.useEffect)(() => () => void z.set(a, window.scrollY), [a]),
              (0, y.useEffect)(() => {
                if (null === D) return;
                let e = x.current?.querySelector(`[data-index="${D}"] article`);
                e && (e.focus({ preventScroll: !0 }), W(null));
              }, [D, G]),
              r.isPending)
            )
              return (0, s.jsx)('div', {
                className: I.default.loading,
                'aria-busy': 'true',
                'aria-label': `Loading ${t}`,
                children: [0, 1, 2].map((e) => (0, s.jsx)(w.f, { height: '7rem' }, e)),
              });
            if (r.isError && !r.data)
              return (0, s.jsxs)(_.f, {
                variant: 'danger',
                title: 'This did not load',
                children: [
                  (0, s.jsx)('p', { className: I.default.alertText, children: r.error.message }),
                  (0, s.jsx)(O.f, {
                    size: 'sm',
                    onClick: () => r.refetch(),
                    children: 'Try again',
                  }),
                ],
              });
            if (0 === S.length)
              return (0, s.jsx)(E.f, { icon: 'inbox', title: n.title, description: n.description });
            let V = m && r.error instanceof T.a && 410 === r.error.status;
            return (0, s.jsxs)('section', {
              'aria-label': t,
              children: [
                (0, s.jsx)('div', {
                  ref: x,
                  role: 'feed',
                  'aria-label': t,
                  'aria-busy': u,
                  className: I.default.feed,
                  style: { height: $.getTotalSize() },
                  onKeyDown: function (e) {
                    if ('PageDown' !== e.key && 'PageUp' !== e.key) return;
                    let t = e.target.closest('[data-index]');
                    if (!t || !e.target.closest('article')) return;
                    let s = Number(t.dataset.index) + ('PageDown' === e.key ? 1 : -1);
                    s < 0 ||
                      s >= S.length ||
                      (e.preventDefault(), $.scrollToIndex(s, { align: 'start' }), W(s));
                  },
                  children: G.map((e) => {
                    let t = S[e.index];
                    return (0, s.jsx)(
                      'div',
                      {
                        'data-index': e.index,
                        ref: $.measureElement,
                        className: I.default.row,
                        style: { transform: `translateY(${e.start - $.options.scrollMargin}px)` },
                        children: (0, s.jsx)(C.f, {
                          post: t,
                          'aria-posinset': e.index + 1,
                          'aria-setsize': d ? -1 : S.length,
                          onFocus: () => k(t.id),
                        }),
                      },
                      e.key,
                    );
                  }),
                }),
                (0, s.jsxs)('div', {
                  className: I.default.footer,
                  children: [
                    u && (0, s.jsx)(M.f, { label: 'Loading more posts' }),
                    m &&
                      (0, s.jsx)(_.f, {
                        variant: V ? 'info' : 'danger',
                        title: V ? 'This feed is out of date' : 'More posts did not load',
                        children: (0, s.jsx)(O.f, {
                          size: 'sm',
                          onClick: () =>
                            V
                              ? void (z.delete(a),
                                (K.current = !1),
                                o.resetQueries({ queryKey: (0, A.F)(e) }))
                              : void p(),
                          children: V ? 'Refresh the feed' : 'Try again',
                        }),
                      }),
                    !d &&
                      !m &&
                      (0, s.jsx)('p', {
                        className: I.default.end,
                        children: 'You are all caught up.',
                      }),
                  ],
                }),
              ],
            });
          },
        ],
        92179,
      );
    },
    66081,
    (e) => {
      var t = e.i(43476),
        s = e.i(64300),
        i = e.i(17738),
        n = e.i(70684),
        l = e.i(33290),
        r = e.i(22016),
        o = e.i(71645),
        a = e.i(48804),
        h = e.i(47730),
        d = e.i(92276),
        c = e.i(54616),
        u = e.i(60450),
        f = e.i(79230),
        m = e.i(70361),
        g = e.i(30448),
        p = e.i(99273),
        S = e.i(26103),
        v = e.i(78060),
        x = e.i(28352),
        y = e.i(84294),
        j = e.i(58090),
        b = e.i(45835),
        _ = e.i(67726),
        O = e.i(98124),
        E = e.i(66027),
        w = e.i(12598),
        M = e.i(94108),
        T = e.i(79750);
      let A = [
        { value: 'spam', label: 'Spam' },
        { value: 'harassment', label: 'Harassment' },
        { value: 'misinformation', label: 'Misleading information' },
        { value: 'other', label: 'Something else' },
      ];
      function C({ post: e, isOwn: s }) {
        let [i, n] = (0, o.useState)(null),
          l = (0, o.useRef)(null),
          r = (e) => {
            e ||
              (n(null), requestAnimationFrame(() => l.current?.querySelector('button')?.focus()));
          };
        return (0, t.jsxs)('span', {
          ref: l,
          children: [
            (0, t.jsxs)(j.f, {
              children: [
                (0, t.jsx)(j.f.Trigger, {
                  variant: 'ghost',
                  size: 'sm',
                  'aria-label': `More actions for ${e.author.name}'s post`,
                  children: 'More',
                }),
                (0, t.jsxs)(j.f.Content, {
                  'aria-label': 'Post actions',
                  placement: 'bottom end',
                  children: [
                    (0, t.jsx)(j.f.Item, {
                      id: 'why',
                      onAction: () => n('why'),
                      children: 'Why am I seeing this?',
                    }),
                    !s &&
                      (0, t.jsx)(j.f.Item, {
                        id: 'report',
                        onAction: () => n('report'),
                        children: 'Report this post',
                      }),
                    !s &&
                      (0, t.jsxs)(j.f.Item, {
                        id: 'block',
                        danger: !0,
                        onAction: () => n('block'),
                        children: ['Block @', e.author.handle],
                      }),
                  ],
                }),
              ],
            }),
            (0, t.jsx)(I, { post: e, open: 'why' === i, onOpenChange: r }),
            (0, t.jsx)(z, { post: e, open: 'report' === i, onOpenChange: r }),
            (0, t.jsx)(F, { post: e, open: 'block' === i, onOpenChange: r }),
          ],
        });
      }
      function I({ post: e, open: s, onOpenChange: i }) {
        let n = (0, E.f)({ queryKey: ['why', e.id], queryFn: () => M.k.why(e.id), enabled: s });
        return (0, t.jsxs)(f.f, {
          open: s,
          onOpenChange: i,
          size: 'sm',
          children: [
            (0, t.jsxs)(v.f, {
              children: [
                (0, t.jsx)(x.f, { children: 'Why am I seeing this?' }),
                (0, t.jsx)(g.f, {}),
              ],
            }),
            (0, t.jsxs)(m.f, {
              children: [
                (0, t.jsx)(p.f, {
                  children: 'These are the reasons behind where this post sits in your feed.',
                }),
                n.isPending && (0, t.jsx)(_.f, { label: 'Loading the reasons' }),
                n.isError && (0, t.jsx)(u.f, { variant: 'danger', children: n.error.message }),
                n.data &&
                  (n.data.reasons.length > 0
                    ? (0, t.jsx)('ul', {
                        className: T.default.reasons,
                        children: n.data.reasons.map((e) => (0, t.jsx)('li', { children: e }, e)),
                      })
                    : (0, t.jsx)('p', {
                        className: T.default.plain,
                        children:
                          'Nothing in particular. It is just one of the newer posts you can see.',
                      })),
              ],
            }),
          ],
        });
      }
      function z({ post: e, open: s, onOpenChange: i }) {
        let [r, a] = (0, o.useState)('spam'),
          [h, d] = (0, o.useState)(''),
          { toast: j } = (0, l.f)(),
          _ = (0, c.f)({
            mutationFn: () => M.k.report(e.id, { reason: r, details: h }),
            onSuccess: () => {
              (j({
                title: 'Report sent',
                description: 'Thank you. A moderator will take a look.',
                variant: 'success',
              }),
                i(!1));
            },
          });
        return (0, t.jsx)(f.f, {
          open: s,
          onOpenChange: i,
          size: 'sm',
          children: (0, t.jsxs)('form', {
            onSubmit: (e) => {
              (e.preventDefault(), _.mutate());
            },
            children: [
              (0, t.jsxs)(v.f, {
                children: [(0, t.jsx)(x.f, { children: 'Report this post' }), (0, t.jsx)(g.f, {})],
              }),
              (0, t.jsxs)(m.f, {
                children: [
                  (0, t.jsx)(p.f, {
                    children: 'Reports go to the moderators. The author is not told who reported.',
                  }),
                  (0, t.jsxs)('div', {
                    className: T.default.fields,
                    children: [
                      (0, t.jsx)(y.f, {
                        label: 'Reason',
                        children: (0, t.jsx)(b.f, {
                          value: r,
                          onChange: (e) => a(e.target.value),
                          children: A.map((e) =>
                            (0, t.jsx)('option', { value: e.value, children: e.label }, e.value),
                          ),
                        }),
                      }),
                      (0, t.jsx)(y.f, {
                        label: 'Anything else we should know? (optional)',
                        children: (0, t.jsx)(O.f, {
                          rows: 3,
                          maxLength: 300,
                          value: h,
                          onChange: (e) => d(e.target.value),
                        }),
                      }),
                      _.isError &&
                        (0, t.jsx)(u.f, { variant: 'danger', children: _.error.message }),
                    ],
                  }),
                ],
              }),
              (0, t.jsxs)(S.f, {
                children: [
                  (0, t.jsx)(n.f, { onClick: () => i(!1), children: 'Cancel' }),
                  (0, t.jsx)(n.f, {
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
      function F({ post: e, open: s, onOpenChange: i }) {
        let { toast: r } = (0, l.f)(),
          o = (0, w.d)(),
          a = (0, c.f)({
            mutationFn: () => M.k.block(e.author.handle),
            onSuccess: () => {
              (r({ title: `Blocked @${e.author.handle}`, variant: 'success' }),
                o.removeQueries({ queryKey: ['feed'] }),
                o.removeQueries({ queryKey: ['posts'] }),
                o.invalidateQueries({ queryKey: ['feed'] }),
                o.invalidateQueries({ queryKey: ['blocked'] }),
                i(!1));
            },
          });
        return (0, t.jsxs)(f.f, {
          open: s,
          onOpenChange: i,
          size: 'sm',
          role: 'alertdialog',
          children: [
            (0, t.jsxs)(v.f, {
              children: [
                (0, t.jsxs)(x.f, { children: ['Block @', e.author.handle, '?'] }),
                (0, t.jsx)(g.f, {}),
              ],
            }),
            (0, t.jsxs)(m.f, {
              children: [
                (0, t.jsx)(p.f, {
                  children:
                    'You will not see their posts, and they will not see yours or be able to follow you. You can undo this in your settings.',
                }),
                a.isError && (0, t.jsx)(u.f, { variant: 'danger', children: a.error.message }),
              ],
            }),
            (0, t.jsxs)(S.f, {
              children: [
                (0, t.jsx)(n.f, { onClick: () => i(!1), children: 'Cancel' }),
                (0, t.jsx)(n.f, {
                  variant: 'danger',
                  loading: a.isPending,
                  onClick: () => a.mutate(),
                  children: 'Block',
                }),
              ],
            }),
          ],
        });
      }
      e.i(24856);
      let R = /(^|[^a-z0-9_])@([a-z0-9_]{3,30})(?![a-z0-9_])/gi;
      function L({ text: e, className: s }) {
        return (0, t.jsx)('p', {
          className: s,
          children: (function (e) {
            let t = [],
              s = 0;
            for (let i of e.matchAll(R)) {
              let n = i.index + i[1].length;
              (n > s && t.push({ text: e.slice(s, n) }),
                t.push({ text: `@${i[2]}`, mention: i[2].toLowerCase() }),
                (s = n + 1 + i[2].length));
            }
            return (s < e.length && t.push({ text: e.slice(s) }), t);
          })(e).map((e, s) =>
            e.mention
              ? (0, t.jsx)(r.default, { href: `/u/${e.mention}`, children: e.text }, s)
              : e.text,
          ),
        });
      }
      var k = e.i(45001);
      let D = (0, o.forwardRef)(function ({ post: e, detail: o = !1, className: c, ...u }, f) {
        let { data: m } = (0, a.U)(),
          { toast: g } = (0, l.f)(),
          p = (0, a.R)(),
          S = m?.id === e.author.id,
          v = new Date(e.createdAt);
        return (0, t.jsxs)('article', {
          ref: f,
          tabIndex: 0,
          'aria-label': `Post by ${e.author.name}`,
          className: [k.default.post, c].filter(Boolean).join(' '),
          ...u,
          children: [
            (0, t.jsx)(s.f, { name: e.author.name, size: 'lg' }),
            (0, t.jsxs)('div', {
              className: k.default.body,
              children: [
                (0, t.jsxs)('header', {
                  className: k.default.meta,
                  children: [
                    (0, t.jsx)(r.default, {
                      href: `/u/${e.author.handle}`,
                      className: k.default.name,
                      children: e.author.name,
                    }),
                    (0, t.jsxs)('span', {
                      className: k.default.handle,
                      children: ['@', e.author.handle],
                    }),
                    (0, t.jsx)('time', {
                      className: k.default.time,
                      dateTime: e.createdAt,
                      title: v.toLocaleString(),
                      children: (0, h.f)(e.createdAt),
                    }),
                    'followers' === e.visibility &&
                      (0, t.jsx)(i.f, { variant: 'neutral', children: 'Followers only' }),
                    'community' === e.visibility &&
                      (0, t.jsx)(i.f, { variant: 'neutral', children: 'Members only' }),
                    e.community &&
                      (0, t.jsx)(r.default, {
                        href: `/c/${e.community.slug}`,
                        className: k.default.community,
                        children: e.community.name,
                      }),
                  ],
                }),
                (0, t.jsx)(L, { text: e.text, className: k.default.text }),
                (0, t.jsx)(d.f, { post: e }),
                (0, t.jsxs)('footer', {
                  className: k.default.actions,
                  children: [
                    (0, t.jsxs)(n.f, {
                      variant: 'ghost',
                      size: 'sm',
                      'aria-pressed': e.reacted,
                      className: k.default.like,
                      onClick: () =>
                        p.mutate(
                          { post: e },
                          {
                            onError: (e) =>
                              g({
                                title: 'Could not update your like',
                                description: e.message,
                                variant: 'danger',
                              }),
                          },
                        ),
                      children: ['Like · ', e.counts.reactions],
                    }),
                    o
                      ? (0, t.jsxs)('span', {
                          className: k.default.replies,
                          children: ['Replies · ', e.counts.replies],
                        })
                      : (0, t.jsxs)(r.default, {
                          href: `/p/${e.id}`,
                          className: k.default.replyLink,
                          children: ['Reply · ', e.counts.replies],
                        }),
                    (0, t.jsx)('span', { className: k.default.spacer }),
                    (0, t.jsx)(C, { post: e, isOwn: S }),
                  ],
                }),
              ],
            }),
          ],
        });
      });
      e.s(['f', 0, D], 66081);
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
      var t = e.i(43476),
        s = e.i(32345);
      e.i(24856);
      var i = e.i(21138),
        n = e.i(46977);
      e.s(
        [
          'f',
          0,
          function ({ post: e }) {
            return 0 === e.media.length
              ? null
              : (0, t.jsx)('div', {
                  className: n.default.grid,
                  'data-count': e.media.length,
                  children: e.media.map((l) =>
                    'ready' === l.status && l.width && l.height
                      ? (0, t.jsx)(
                          'img',
                          {
                            className: n.default.image,
                            src: `/api/media/${l.id}/640`,
                            srcSet: i.w.map((e) => `/api/media/${l.id}/${e} ${e}w`).join(', '),
                            sizes: '(max-width: 700px) 100vw, 600px',
                            width: l.width,
                            height: l.height,
                            style: {
                              aspectRatio: 1 === e.media.length ? `${l.width} / ${l.height}` : '1',
                            },
                            loading: 'lazy',
                            decoding: 'async',
                            alt: `Photo in ${e.author.name}'s post`,
                          },
                          l.id,
                        )
                      : (0, t.jsx)(s.f, { className: n.default.image, height: '12rem' }, l.id),
                  ),
                });
          },
        ],
        92276,
      );
      var l = e.i(69778);
      (e.s(['f', () => l.D], 79230),
        e.s(['f', () => l.a], 70361),
        e.s(['f', () => l.b], 30448),
        e.s(['f', () => l.c], 99273),
        e.s(['f', () => l.d], 26103),
        e.s(['f', () => l.e], 78060),
        e.s(['f', () => l.f], 28352));
    },
    14346,
    (e) => {
      var t = e.i(43476),
        s = e.i(60450),
        i = e.i(70684),
        n = e.i(32345),
        l = e.i(22016),
        r = e.i(48804);
      e.s([
        'f',
        0,
        function ({ children: e }) {
          let o = (0, r.U)();
          return o.isPending
            ? (0, t.jsx)(n.f, { height: '8rem', 'aria-busy': 'true' })
            : o.isError
              ? (0, t.jsx)(s.f, {
                  variant: 'danger',
                  title: 'Could not reach Pulse',
                  children: (0, t.jsx)(i.f, {
                    size: 'sm',
                    onClick: () => o.refetch(),
                    children: 'Try again',
                  }),
                })
              : o.data
                ? (0, t.jsx)(t.Fragment, { children: e(o.data) })
                : (0, t.jsx)(s.f, {
                    variant: 'info',
                    title: 'Sign in to continue',
                    children: (0, t.jsx)(l.default, {
                      href: '/',
                      children: 'Go to the start page',
                    }),
                  });
        },
      ]);
    },
    47730,
    (e) => {
      let t = new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' }),
        s = new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' });
      e.s([
        'f',
        0,
        function (e, i = new Date()) {
          let n = new Date(e),
            l = i.getTime() - n.getTime();
          return l < 6e4
            ? 'just now'
            : l < 36e5
              ? `${Math.floor(l / 6e4)}m`
              : l < 864e5
                ? `${Math.floor(l / 36e5)}h`
                : l < 6048e5
                  ? `${Math.floor(l / 864e5)}d`
                  : (n.getFullYear() === i.getFullYear() ? t : s).format(n);
        },
      ]);
    },
    60450,
    70684,
    32345,
    (e) => {
      var t = e.i(42667);
      e.s(['f', () => t.A], 60450);
      var s = e.i(66078);
      e.s(['f', () => s.B], 70684);
      var i = e.i(21143);
      e.s(['f', () => i.S], 32345);
    },
    59760,
    (e) => {
      var t = e.i(79928);
      e.s(['f', () => t.E]);
    },
    84294,
    (e) => {
      var t = e.i(2675);
      e.s(['f', () => t.F]);
    },
    45835,
    (e) => {
      var t = e.i(97741);
      e.s(['f', () => t.S]);
    },
    67726,
    (e) => {
      var t = e.i(67241);
      e.s(['f', () => t.S]);
    },
    98124,
    (e) => {
      var t = e.i(58744);
      e.s(['f', () => t.T]);
    },
  ],
  33862,
  (e) => {
    e.v({
      alertText: '_1eYp7G_alertText',
      end: '_1eYp7G_end',
      feed: '_1eYp7G_feed',
      footer: '_1eYp7G_footer',
      loading: '_1eYp7G_loading',
      row: '_1eYp7G_row',
    });
  },
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
]);
