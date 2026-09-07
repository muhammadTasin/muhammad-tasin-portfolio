"use client";
import { useLayoutEffect, useRef } from "react";
import { formatMetric, rollDuration, rollFrame } from "../lib/number-roll";

export function RollingNumber({ value, loading = false, minimumDigits = 1, suffix = "" }: {
  value: number | null;
  loading?: boolean;
  minimumDigits?: number;
  suffix?: string;
}) {
  const host = useRef<HTMLSpanElement>(null);
  const motion = useRef<HTMLSpanElement>(null);
  const current = useRef<number | null>(null);
  const position = useRef(0);

  useLayoutEffect(() => {
    const element = host.current;
    const visual = motion.current;
    if (value === null || !element || !visual) { current.current = null; position.current = 0; return; }
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    const from = current.current ?? 0;
    const duration = rollDuration(from, value);
    const entryOffset = position.current === 0 ? -0.65 : position.current;
    const finish = () => {
      cancelAnimationFrame(frame);
      current.current = value;
      position.current = 0;
      element.classList.remove("is-rolling");
      visual.textContent = formatMetric(value, minimumDigits, suffix);
      visual.style.transform = "none";
    };
    const onPreference = () => { if (preference.matches) finish(); };
    preference.addEventListener("change", onPreference);
    if (preference.matches || duration === 0) finish();
    else {
      const started = performance.now();
      visual.textContent = formatMetric(from, minimumDigits, suffix);
      visual.style.transform = `translateY(${entryOffset}em)`;
      element.classList.add("is-rolling");
      const tick = (now: number) => {
        const progress = Math.min(1, (now - started) / duration);
        if (progress >= 1) { finish(); return; }
        const sample = rollFrame(from, value, progress, entryOffset);
        current.current = sample.value;
        position.current = sample.offset;
        // One visual update per frame, regardless of the target's magnitude.
        // Accessible content already contains the exact verified target.
        visual.textContent = formatMetric(Math.round(sample.value), minimumDigits, suffix);
        visual.style.transform = `translateY(${sample.offset}em)`;
        frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    }
    return () => {
      cancelAnimationFrame(frame);
      preference.removeEventListener("change", onPreference);
      element.classList.remove("is-rolling");
    };
  }, [value, minimumDigits, suffix]);

  if (value === null) {
    return loading ? (
      <span className="number-loading-reel">
        <span className="evidence-sr-only">Loading</span>
        <span className="number-loading-tracks" aria-hidden="true"><i /><i /><i /></span>
      </span>
    ) : <span className="number-unavailable">Unavailable</span>;
  }
  return (
    <span ref={host} className="rolling-number">
      <span className="number-target">{formatMetric(value, minimumDigits, suffix)}</span>
      <span ref={motion} className="number-motion" aria-hidden="true" />
    </span>
  );
}
