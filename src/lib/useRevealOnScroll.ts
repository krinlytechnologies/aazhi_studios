"use client";

import { useEffect, type RefObject } from "react";

interface RevealOptions {
  /** Starting offset in px that the element rises from. Default 24. */
  translateY?: number;
  /** Starting scale the element grows from (e.g. 0.96). Omit for no scale. */
  scale?: number;
  /** IntersectionObserver threshold. Default 0.2. */
  threshold?: number;
  /** Per-item delay step in ms, multiplied by index, for a staggered reveal. */
  stagger?: number;
}

/**
 * One-shot fade/rise reveal for each element in `refs.current` as it first
 * scrolls into view. IntersectionObserver fires once per element then
 * unobserves it, so there's no continuous per-scroll-frame work — safe on
 * low-powered mobile GPUs, unlike a scroll-scrubbed transform. Respects
 * prefers-reduced-motion.
 */
export function useRevealOnScroll(
  refs: RefObject<(HTMLElement | null)[]>,
  deps: readonly unknown[],
  options?: RevealOptions
) {
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const items = refs.current.filter((el): el is HTMLElement => Boolean(el));
    if (reduced || items.length === 0) return;

    const { translateY = 24, scale, threshold = 0.2, stagger = 0 } = options ?? {};
    const hiddenTransform = `translateY(${translateY}px)${scale !== undefined ? ` scale(${scale})` : ""}`;
    const visibleTransform = scale !== undefined ? "translateY(0) scale(1)" : "translateY(0)";

    items.forEach((item, i) => {
      item.style.opacity = "0";
      item.style.transform = hiddenTransform;
      item.style.transition = `opacity 0.5s ease-out ${i * stagger}ms, transform 0.5s ease-out ${i * stagger}ms`;
    });

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const el = entry.target as HTMLElement;
          el.style.opacity = "1";
          el.style.transform = visibleTransform;
          observer.unobserve(el);
        }
      },
      { threshold }
    );
    items.forEach((item) => observer.observe(item));
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
