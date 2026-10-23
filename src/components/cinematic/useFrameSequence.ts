"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type FrameSequenceStatus =
  | "idle"
  | "loading"
  | "ready"
  | "missing"
  | "error";

interface UseFrameSequenceOptions {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  frameCount: number;
  getFrameSrc: (index: number) => string;
  /**
   * Tried in order until one loads successfully; shown before the sequence has
   * streamed in, and used as-is when streaming is disabled (e.g. reduced motion).
   * Pass a stable (module-level or memoized) array — it's an effect dependency.
   */
  posterSources: readonly string[];
  /** How many decoded frames to keep cached at once, centered on the current target. */
  cacheWindow?: number;
  /** Max simultaneous in-flight frame requests. */
  concurrency?: number;
  /**
   * Whether to stream the full frame sequence. The poster and canvas resizing always
   * run regardless — this only gates the frame-by-frame download queue, which callers
   * showing a static representative frame (e.g. reduced motion) should skip.
   */
  streamFrames?: boolean;
  /** Tag used in dev-only console messages, so multiple sequences on one page are distinguishable. */
  debugLabel?: string;
}

interface UseFrameSequenceResult {
  status: FrameSequenceStatus;
  loadedCount: number;
  frameCount: number;
  /**
   * True once a real sequence frame (not the poster/fallback) has been decoded
   * and actually drawn to the canvas. Distinct from `status === "ready"`, which
   * only means a frame finished loading — this confirms it was painted.
   */
  firstFrameReady: boolean;
  /** Normalized scroll progress (0..1). Safe to call every animation frame — does not re-render React. */
  setProgress: (progress: number) => void;
}

type DecodedFrame = ImageBitmap | HTMLImageElement;

const supportsCreateImageBitmap =
  typeof window !== "undefined" && typeof window.createImageBitmap === "function";

function frameSize(frame: DecodedFrame): { width: number; height: number } {
  return "naturalWidth" in frame
    ? { width: frame.naturalWidth, height: frame.naturalHeight }
    : { width: frame.width, height: frame.height };
}

function disposeFrame(frame: DecodedFrame | null | undefined) {
  if (frame && "close" in frame) frame.close();
}

/**
 * Loads a single frame. createImageBitmap (via fetch+blob) is preferred: it gives an
 * explicit close() to release decoded memory deterministically, which matters once ~90
 * frames are in play. HTMLImageElement + decode() is the fallback for browsers without
 * createImageBitmap support (older Safari).
 */
async function loadFrame(src: string, signal: AbortSignal): Promise<DecodedFrame> {
  if (supportsCreateImageBitmap) {
    const response = await fetch(src, { signal });
    if (!response.ok) throw new Error(`fetch-failed (${response.status}) loading ${src}`);
    const blob = await response.blob();
    try {
      return await window.createImageBitmap(blob);
    } catch (decodeError) {
      // Distinguish "never arrived" from "arrived but the browser couldn't decode it" —
      // the fix for each is completely different, so don't let these look the same.
      throw new Error(
        `decode-failed loading ${src} (fetched ${blob.size} bytes, type "${blob.type}"): ${String(decodeError)}`
      );
    }
  }

  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new window.Image();
    const onAbort = () => {
      img.src = "";
      reject(new DOMException("Aborted", "AbortError"));
    };
    signal.addEventListener("abort", onAbort, { once: true });
    img.onload = () => {
      signal.removeEventListener("abort", onAbort);
      img.decode().then(() => resolve(img), () => resolve(img));
    };
    img.onerror = () => {
      signal.removeEventListener("abort", onAbort);
      reject(new Error(`failed to load ${src}`));
    };
    img.src = src;
  });
}

export function useFrameSequence({
  canvasRef,
  frameCount,
  getFrameSrc,
  posterSources,
  cacheWindow = 24,
  concurrency = 4,
  streamFrames = true,
  debugLabel = "FrameSequence",
}: UseFrameSequenceOptions): UseFrameSequenceResult {
  const [status, setStatus] = useState<FrameSequenceStatus>("idle");
  const [loadedCount, setLoadedCount] = useState(0);
  const [firstFrameReady, setFirstFrameReady] = useState(false);
  const firstFrameReadyRef = useRef(false);

  const cacheRef = useRef<Map<number, DecodedFrame>>(new Map());
  const failedRef = useRef<Set<number>>(new Set());
  const inFlightRef = useRef<Map<number, AbortController>>(new Map());
  const posterRef = useRef<DecodedFrame | null>(null);
  const targetIndexRef = useRef(0);
  const drawnIndexRef = useRef(-1);
  const rafRef = useRef<number | null>(null);
  const sizeRef = useRef({ width: 0, height: 0 });
  const abandonedRef = useRef(false);
  const loggedZeroSizeRef = useRef(false);
  const loggedFirstDrawRef = useRef(false);

  const drawFrame = useCallback(
    (frame: DecodedFrame | null) => {
      const canvas = canvasRef.current;
      if (!canvas || !frame) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const { width: cw, height: ch } = sizeRef.current;
      if (cw === 0 || ch === 0) {
        if (!loggedZeroSizeRef.current && process.env.NODE_ENV !== "production") {
          loggedZeroSizeRef.current = true;
          console.warn(
            `[${debugLabel}] Skipped drawing a frame because the canvas has no measured size yet ` +
              "(sizeRef is 0x0). If this is the only message you see, the ResizeObserver never fired."
          );
        }
        return;
      }

      const { width: iw, height: ih } = frameSize(frame);
      if (iw === 0 || ih === 0) return;

      // "Cover" crop: scale to fill, center-crop the overflow axis.
      const scale = Math.max(cw / iw, ch / ih);
      const sw = cw / scale;
      const sh = ch / scale;
      const sx = (iw - sw) / 2;
      const sy = (ih - sh) / 2;

      ctx.drawImage(frame as CanvasImageSource, sx, sy, sw, sh, 0, 0, cw, ch);

      if (!loggedFirstDrawRef.current && process.env.NODE_ENV !== "production") {
        loggedFirstDrawRef.current = true;
        console.info(
          `[${debugLabel}] First successful draw: canvas ${cw}x${ch}, source ${iw}x${ih}.`
        );
      }
    },
    [canvasRef, debugLabel]
  );

  const markFirstFrameReady = useCallback(() => {
    if (firstFrameReadyRef.current) return;
    firstFrameReadyRef.current = true;
    setFirstFrameReady(true);
  }, []);

  const renderNearestToTarget = useCallback(() => {
    const target = targetIndexRef.current;
    const cache = cacheRef.current;

    if (cache.has(target)) {
      if (drawnIndexRef.current !== target) {
        drawFrame(cache.get(target) ?? null);
        drawnIndexRef.current = target;
        markFirstFrameReady();
      }
      return;
    }

    // No exact frame yet — scrub through the nearest one we actually have rather
    // than flashing blank. This is what keeps fast scrolling free of blank frames.
    let bestIndex = -1;
    let bestDistance = Infinity;
    for (const cachedIndex of cache.keys()) {
      const distance = Math.abs(cachedIndex - target);
      if (distance < bestDistance) {
        bestDistance = distance;
        bestIndex = cachedIndex;
      }
    }

    if (bestIndex !== -1) {
      if (drawnIndexRef.current !== bestIndex) {
        drawFrame(cache.get(bestIndex) ?? null);
        drawnIndexRef.current = bestIndex;
        markFirstFrameReady();
      }
    } else if (posterRef.current && drawnIndexRef.current !== -2) {
      drawFrame(posterRef.current);
      drawnIndexRef.current = -2;
    }
  }, [drawFrame, markFirstFrameReady]);

  const scheduleRender = useCallback(() => {
    if (rafRef.current !== null) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      renderNearestToTarget();
    });
  }, [renderNearestToTarget]);

  const evictIfNeeded = useCallback(() => {
    const cache = cacheRef.current;
    const limit = cacheWindow * 2;
    if (cache.size <= limit) return;

    let farthestIndex = -1;
    let farthestDistance = -1;
    for (const cachedIndex of cache.keys()) {
      const distance = Math.abs(cachedIndex - targetIndexRef.current);
      if (distance > farthestDistance) {
        farthestDistance = distance;
        farthestIndex = cachedIndex;
      }
    }
    if (farthestIndex !== -1) {
      disposeFrame(cache.get(farthestIndex));
      cache.delete(farthestIndex);
    }
  }, [cacheWindow]);

  const pickNextFrameToLoad = useCallback((): number | null => {
    let bestIndex: number | null = null;
    let bestDistance = Infinity;
    for (let i = 0; i < frameCount; i++) {
      if (cacheRef.current.has(i) || failedRef.current.has(i) || inFlightRef.current.has(i)) {
        continue;
      }
      const distance = Math.abs(i - targetIndexRef.current);
      if (distance < bestDistance) {
        bestDistance = distance;
        bestIndex = i;
      }
    }
    return bestIndex;
  }, [frameCount]);

  const fillQueueRef = useRef<() => void>(() => {});
  const mountCountRef = useRef(0);

  useEffect(() => {
    if (!streamFrames) return;
    abandonedRef.current = false;

    if (process.env.NODE_ENV !== "production") {
      mountCountRef.current += 1;
      console.info(
        `[${debugLabel}] Frame-loading effect (re)started (mount #${mountCountRef.current}). ` +
          "If this number keeps climbing on its own, the component is being repeatedly remounted " +
          "(check for full page reloads / HMR churn, not a bug in this effect)."
      );
    }

    const startLoad = (index: number) => {
      const controller = new AbortController();
      inFlightRef.current.set(index, controller);

      // A stale (superseded) settlement must never clear the Map entry for a newer,
      // still-pending load of the same index — see the comment on isCurrentLoad below.
      const isCurrentLoad = () => inFlightRef.current.get(index) === controller;

      loadFrame(getFrameSrc(index), controller.signal)
        .then((frame) => {
          if (abandonedRef.current) {
            disposeFrame(frame);
            return;
          }
          if (isCurrentLoad()) inFlightRef.current.delete(index);
          cacheRef.current.set(index, frame);
          evictIfNeeded();
          setLoadedCount((count) => count + 1);
          setStatus((current) => (current === "ready" || current === "missing" ? current : "ready"));
          scheduleRender();
          if (process.env.NODE_ENV !== "production" && cacheRef.current.size === frameCount) {
            console.info(
              `[${debugLabel}] All ${frameCount} frames loaded — no further requests should fire.`
            );
          }
          fillQueueRef.current();
        })
        .catch((error: unknown) => {
          const wasCurrent = isCurrentLoad();
          if (wasCurrent) inFlightRef.current.delete(index);
          if (error instanceof DOMException && error.name === "AbortError") return;
          // A newer load for this index has already taken over — let it settle on its own.
          if (!wasCurrent) return;

          failedRef.current.add(index);

          // Frame 0 failing with nothing else loaded means the sequence simply
          // isn't on disk yet — stop probing instead of firing 90 requests at 404s.
          if (index === 0 && cacheRef.current.size === 0) {
            abandonedRef.current = true;
            setStatus("missing");
            if (process.env.NODE_ENV !== "production") {
              console.warn(
                `[${debugLabel}] Frame sequence not found at "${getFrameSrc(0)}". ` +
                  "Rendering the fallback image instead. See docs/cinematic-assets.md."
              );
            }
            return;
          }

          if (process.env.NODE_ENV !== "production") {
            console.warn(`[${debugLabel}] Failed to load frame ${index}:`, error);
          }
          fillQueueRef.current();
        });
    };

    const fillQueue = () => {
      if (abandonedRef.current) return;
      while (inFlightRef.current.size < concurrency) {
        const next = pickNextFrameToLoad();
        if (next === null) break;
        startLoad(next);
      }
    };

    fillQueueRef.current = fillQueue;
    fillQueue();

    const inFlight = inFlightRef.current;
    return () => {
      abandonedRef.current = true;
      for (const controller of inFlight.values()) controller.abort();
      inFlight.clear();
    };
  }, [streamFrames, concurrency, getFrameSrc, frameCount, pickNextFrameToLoad, evictIfNeeded, scheduleRender, debugLabel]);

  // Poster: shown immediately, independent of the frame queue above. Tries each
  // source in order (real poster -> real first frame -> legacy still) and stops
  // at the first one that loads.
  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();

    const tryInOrder = async (sources: readonly string[]): Promise<void> => {
      for (const src of sources) {
        try {
          const frame = await loadFrame(src, controller.signal);
          if (cancelled) {
            disposeFrame(frame);
            return;
          }
          posterRef.current = frame;
          scheduleRender();
          return;
        } catch (error) {
          if (error instanceof DOMException && error.name === "AbortError") return;
          // Try the next source.
        }
      }
      if (!cancelled && process.env.NODE_ENV !== "production") {
        console.error(`[${debugLabel}] None of the poster sources could be loaded.`, sources);
      }
      if (!cancelled) setStatus((current) => (current === "missing" ? current : "error"));
    };

    tryInOrder(posterSources);

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [posterSources, scheduleRender, debugLabel]);

  // Canvas sizing: device-pixel buffer tracks the element's rendered CSS size so the
  // layout never shifts, while the drawing stays crisp on high-DPI screens.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = (cssWidth: number, cssHeight: number) => {
      const dpr = window.devicePixelRatio || 1;
      const width = Math.max(1, Math.round(cssWidth * dpr));
      const height = Math.max(1, Math.round(cssHeight * dpr));
      if (sizeRef.current.width === width && sizeRef.current.height === height) return;
      canvas.width = width;
      canvas.height = height;
      sizeRef.current = { width, height };
      drawnIndexRef.current = -1;
      scheduleRender();
    };

    // Mutating canvas.width/height synchronously inside a ResizeObserver callback that
    // observes that same canvas is a well-known trigger for "ResizeObserver loop
    // limit exceeded" — some browsers treat the attribute change as a further layout
    // change and re-notify immediately, which can oscillate. Deferring the mutation to
    // the next animation frame breaks that feedback loop.
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const { width: cssWidth, height: cssHeight } = entry.contentRect;
      requestAnimationFrame(() => resize(cssWidth, cssHeight));
    });
    observer.observe(canvas);
    resize(canvas.clientWidth, canvas.clientHeight);

    return () => observer.disconnect();
  }, [canvasRef, scheduleRender]);

  useEffect(() => {
    const cache = cacheRef.current;
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      for (const frame of cache.values()) disposeFrame(frame);
      cache.clear();
      disposeFrame(posterRef.current);
      posterRef.current = null;
      drawnIndexRef.current = -1;
    };
  }, []);

  const setProgress = useCallback(
    (progress: number) => {
      const clamped = Math.min(1, Math.max(0, progress));
      targetIndexRef.current = Math.round(clamped * (frameCount - 1));
      scheduleRender();
    },
    [frameCount, scheduleRender]
  );

  return { status, loadedCount, frameCount, firstFrameReady, setProgress };
}
