"use client";

type Fbq = ((...args: unknown[]) => void) & { callMethod?: (...args: unknown[]) => void; queue: unknown[][]; push: unknown; loaded: boolean; version: string };

declare global {
  interface Window {
    fbq?: Fbq;
    _fbq?: Fbq;
  }
}

let initialised = false;
// Events sent before the pixel is loaded (it loads after the page has painted).
const pending: [string, Record<string, unknown>, string | undefined][] = [];

/**
 * Loads Meta's fbevents.js (same loader as the official base code) and initialises
 * every pixel ID configured in the admin, then sends the events queued meanwhile.
 */
export function initPixel(pixelIds: string[]): boolean {
  if (initialised || typeof window === "undefined" || !pixelIds.length) return initialised;
  if (adoptBaseCode()) return true;
  if (!window.fbq) {
    const fbq = function (...args: unknown[]) {
      if (fbq.callMethod) fbq.callMethod(...args);
      else fbq.queue.push(args);
    } as Fbq;
    fbq.push = fbq;
    fbq.loaded = true;
    fbq.version = "2.0";
    fbq.queue = [];
    window.fbq = fbq;
    window._fbq = fbq;
    const script = document.createElement("script");
    script.async = true;
    script.src = "https://connect.facebook.net/en_US/fbevents.js";
    document.head.append(script);
  }
  for (const id of pixelIds) window.fbq?.("init", id);
  initialised = true;
  for (const [event, params, eventId] of pending.splice(0)) send(event, params, eventId);
  return true;
}

/**
 * True when the Meta base code in the page <head> already loaded and initialised the
 * pixels: events then go straight to it (queued events are flushed once).
 */
export function adoptBaseCode(): boolean {
  if (initialised) return true;
  if (typeof window === "undefined" || !document.getElementById("meta-pixel") || !window.fbq) return false;
  initialised = true;
  for (const [event, params, eventId] of pending.splice(0)) send(event, params, eventId);
  return true;
}

function send(event: string, params: Record<string, unknown>, eventId?: string) {
  if (eventId) window.fbq?.("track", event, params, { eventID: eventId });
  else window.fbq?.("track", event, params);
}

/**
 * Sends a standard event (queued until the pixel is ready). Pass `eventId` when the
 * server sends the same event through the Conversions API (Purchase), so Meta keeps one.
 */
export function trackPixel(event: string, params: Record<string, unknown> = {}, eventId?: string): void {
  if (typeof window === "undefined") return;
  if (!initialised && !adoptBaseCode()) {
    if (pending.length < 50) pending.push([event, params, eventId]);
    return;
  }
  send(event, params, eventId);
}

/** Runs `callback` once the page has loaded and the browser is idle. */
export function whenIdle(callback: () => void): () => void {
  let cancelled = false;
  let idleId: number | undefined;
  const run = () => {
    if (cancelled) return;
    if ("requestIdleCallback" in window) idleId = window.requestIdleCallback(() => !cancelled && callback(), { timeout: 4000 });
    else setTimeout(() => !cancelled && callback(), 1500);
  };
  if (document.readyState === "complete") run();
  else window.addEventListener("load", run, { once: true });
  return () => {
    cancelled = true;
    window.removeEventListener("load", run);
    if (idleId !== undefined && "cancelIdleCallback" in window) window.cancelIdleCallback(idleId);
  };
}
