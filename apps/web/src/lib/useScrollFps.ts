'use client';

import { useEffect } from 'react';
import { sendVitals } from './api';

const MIN_SCROLL_MS = 600;
const IDLE_MS = 200;
const REPORT_EVERY_MS = 15_000;

// Measures how smooth scrolling is in this browser and reports it. A scroll burst is the time from
// the first scroll event until the page has been still for 200 ms; the number is frames drawn per
// second during it. Short bursts are ignored, and a browser reports at most once every 15 seconds.
export function useScrollFps(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;
    let frames = 0;
    let started = 0;
    let raf = 0;
    let idle: ReturnType<typeof setTimeout> | undefined;
    let lastReport = 0;

    const tick = () => {
      frames += 1;
      raf = requestAnimationFrame(tick);
    };
    const finish = () => {
      cancelAnimationFrame(raf);
      const elapsed = performance.now() - started - IDLE_MS;
      if (elapsed >= MIN_SCROLL_MS && performance.now() - lastReport > REPORT_EVERY_MS) {
        lastReport = performance.now();
        sendVitals({ scrollFps: Math.min(240, Math.round((frames / elapsed) * 1000)) });
      }
      started = 0;
    };
    const onScroll = () => {
      if (!started) {
        started = performance.now();
        frames = 0;
        raf = requestAnimationFrame(tick);
      }
      clearTimeout(idle);
      idle = setTimeout(finish, IDLE_MS);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      clearTimeout(idle);
      cancelAnimationFrame(raf);
    };
  }, [enabled]);
}
