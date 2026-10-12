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
    let lastReport = -Infinity;
    // frames and time as of the latest scroll event, so the still period at the end is not counted
    let framesAtLastScroll = 0;
    let lastScrollAt = 0;

    const tick = () => {
      frames += 1;
      raf = requestAnimationFrame(tick);
    };
    const finish = () => {
      cancelAnimationFrame(raf);
      const elapsed = lastScrollAt - started;
      if (elapsed >= MIN_SCROLL_MS && performance.now() - lastReport > REPORT_EVERY_MS) {
        lastReport = performance.now();
        sendVitals({ scrollFps: Math.min(240, Math.round((framesAtLastScroll / elapsed) * 1000)) });
      }
      started = 0;
    };
    const onScroll = () => {
      if (!started) {
        started = performance.now();
        frames = 0;
        raf = requestAnimationFrame(tick);
      }
      lastScrollAt = performance.now();
      framesAtLastScroll = frames;
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
