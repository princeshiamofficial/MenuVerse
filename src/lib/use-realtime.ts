import { useEffect, useRef, useState } from "react";
import type { RealtimeEvent, RealtimeEventType } from "./realtime.server";

// Persistent singleton AudioContext and decoded sound buffer cache
let sharedAudioCtx: AudioContext | null = null;
let soundWavBuffer: AudioBuffer | null = null;
let originalTabTitle = "";
let tabTitleFlashInterval: NodeJS.Timeout | null = null;

function getSharedAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!sharedAudioCtx) {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof window.AudioContext }).webkitAudioContext;
    if (AudioCtx) {
      sharedAudioCtx = new AudioCtx();
    }
  }
  if (sharedAudioCtx && sharedAudioCtx.state === "suspended") {
    sharedAudioCtx.resume().catch(() => {});
  }
  return sharedAudioCtx;
}

// Pre-load and decode sound.wav into Web Audio buffer for instant zero-latency background tab playback
async function loadSoundWavBuffer() {
  if (typeof window === "undefined" || soundWavBuffer) return;
  try {
    const ctx = getSharedAudioContext();
    if (!ctx) return;
    const response = await fetch("/sound.wav");
    if (!response.ok) return;
    const arrayBuffer = await response.arrayBuffer();
    soundWavBuffer = await ctx.decodeAudioData(arrayBuffer);
  } catch {
    /* ignore fetch/decode errors */
  }
}

// Eagerly pre-load sound.wav buffer on module import
if (typeof window !== "undefined") {
  setTimeout(() => {
    loadSoundWavBuffer();
  }, 100);
}

export function requestNotificationPermission() {
  if (typeof window !== "undefined" && "Notification" in window) {
    if (Notification.permission === "default") {
      Notification.requestPermission().catch(() => {});
    }
  }
}

export function triggerDesktopNotification(title: string, body?: string) {
  if (typeof window !== "undefined" && "Notification" in window) {
    if (Notification.permission === "granted" && document.hidden) {
      try {
        new Notification(title, {
          body,
          icon: "/favicon.ico",
        });
      } catch {
        /* ignore */
      }
    }
  }
}

// Global user gesture listener to permanently unlock audio in browser engine
export function unlockAudioEngine() {
  if (typeof window === "undefined") return;
  const ctx = getSharedAudioContext();
  if (ctx) {
    if (ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }
  }
  loadSoundWavBuffer();
  requestNotificationPermission();
}

// Attach auto-unlock listener on first user click/tap/keydown anywhere on window
if (typeof window !== "undefined") {
  const unlockEvents = ["click", "pointerdown", "keydown", "touchstart", "mousemove"];
  const handleUserGesture = () => {
    unlockAudioEngine();
    unlockEvents.forEach((evt) => window.removeEventListener(evt, handleUserGesture));
  };
  unlockEvents.forEach((evt) =>
    window.addEventListener(evt, handleUserGesture, { once: false, passive: true }),
  );

  // Restore title when user returns to tab
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden && originalTabTitle) {
      document.title = originalTabTitle;
      if (tabTitleFlashInterval) clearInterval(tabTitleFlashInterval);
      tabTitleFlashInterval = null;
    }
  });
}

function flashTabTitle(message: string) {
  if (typeof document === "undefined") return;
  if (!originalTabTitle) {
    originalTabTitle = document.title || "aMenuVerse";
  }
  if (tabTitleFlashInterval) clearInterval(tabTitleFlashInterval);

  let isFlashed = false;
  tabTitleFlashInterval = setInterval(() => {
    if (!document.hidden) {
      document.title = originalTabTitle;
      if (tabTitleFlashInterval) clearInterval(tabTitleFlashInterval);
      tabTitleFlashInterval = null;
      return;
    }
    document.title = isFlashed ? originalTabTitle : message;
    isFlashed = !isFlashed;
  }, 1000);
}

let lastChimeTime = 0;

/**
 * Plays order alert audio using sound.wav with Web Audio buffer fallback for background tabs.
 */
export function playChime(type: "order" | "waiter" | "success" | "alert" = "order") {
  if (typeof window === "undefined") return;

  const now = Date.now();
  if (now - lastChimeTime < 1000) return;
  lastChimeTime = now;

  // 1. Resume shared AudioContext
  const ctx = getSharedAudioContext();

  // 2. If tab is in background, flash tab title & trigger native desktop notification
  if (document.hidden) {
    if (type === "order") {
      flashTabTitle("🔔 (1) NEW ORDER!");
      triggerDesktopNotification("🔔 New Order Received!", "A new order was placed by a customer.");
    } else if (type === "waiter") {
      flashTabTitle("🚨 WAITER CALLED!");
      triggerDesktopNotification("🚨 Waiter Called!", "A guest requested table service.");
    }
  }

  // 3. For 'order', play pre-decoded Web Audio buffer first (bypasses background tab HTML5 autoplay limits)
  if (type === "order") {
    if (ctx && soundWavBuffer) {
      try {
        const source = ctx.createBufferSource();
        source.buffer = soundWavBuffer;
        const gainNode = ctx.createGain();
        gainNode.gain.setValueAtTime(0.9, ctx.currentTime);
        source.connect(gainNode);
        gainNode.connect(ctx.destination);
        source.start(0);
        return;
      } catch {
        /* fallback to audio element or synth */
      }
    }

    // Fallback A: HTML5 Audio element
    try {
      const audio = new Audio("/sound.wav");
      audio.volume = 0.85;
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          playSynthesizedChime("order");
        });
      }
      return;
    } catch {
      playSynthesizedChime("order");
      return;
    }
  }

  playSynthesizedChime(type);
}

/**
 * Synthesizes pure Web Audio chimes as a reliable fallback.
 */
export function playSynthesizedChime(type: "order" | "waiter" | "success" | "alert" = "order") {
  if (typeof window === "undefined") return;
  try {
    const ctx = getSharedAudioContext();
    if (!ctx) return;

    if (type === "order") {
      // Double bell chime: C5 (523.25 Hz) then G5 (783.99 Hz)
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = "sine";
      osc1.frequency.setValueAtTime(523.25, ctx.currentTime);
      osc2.type = "triangle";
      osc2.frequency.setValueAtTime(783.99, ctx.currentTime + 0.12);

      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(ctx.currentTime);
      osc1.stop(ctx.currentTime + 0.2);
      osc2.start(ctx.currentTime + 0.12);
      osc2.stop(ctx.currentTime + 0.6);
    } else if (type === "waiter") {
      // Triple urgent ringtone: E5, G5, C6
      const notes = [659.25, 783.99, 1046.5];
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const start = ctx.currentTime + i * 0.14;
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0.35, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + 0.3);
      });
    } else if (type === "success") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.3);
    }
  } catch {
    /* audio context may be blocked before first user gesture */
  }
}

export interface UseRealtimeOptions {
  restaurantId?: string | number;
  branchId?: string | null;
  eventTypes?: RealtimeEventType[];
  onEvent?: (event: RealtimeEvent) => void;
  enabled?: boolean;
}

export function useRealtime({
  restaurantId,
  branchId,
  eventTypes,
  onEvent,
  enabled = true,
}: UseRealtimeOptions = {}) {
  const [isConnected, setIsConnected] = useState(false);
  const onEventRef = useRef(onEvent);
  onEventRef.current = onEvent;

  const eventTypesKey = eventTypes ? eventTypes.join(",") : "";

  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;

    let eventSource: EventSource | null = null;
    let reconnectTimeout: NodeJS.Timeout | null = null;
    let retryDelay = 1000;
    let isCleanedUp = false;

    function connect() {
      if (isCleanedUp) return;

      const params = new URLSearchParams();
      if (restaurantId) params.set("restaurantId", String(restaurantId));
      if (branchId && branchId !== "all") params.set("branchId", String(branchId));

      const queryStr = params.toString();
      const url = `/api/realtime${queryStr ? `?${queryStr}` : ""}`;

      try {
        eventSource = new EventSource(url);

        eventSource.onopen = () => {
          setIsConnected(true);
          retryDelay = 1000;
        };

        eventSource.onerror = () => {
          setIsConnected(false);
          eventSource?.close();
          if (!isCleanedUp) {
            reconnectTimeout = setTimeout(() => {
              retryDelay = Math.min(retryDelay * 1.5, 10000);
              connect();
            }, retryDelay);
          }
        };

        const targetTypes: RealtimeEventType[] =
          eventTypesKey.length > 0
            ? (eventTypesKey.split(",") as RealtimeEventType[])
            : [
                "order:created",
                "order:updated",
                "order:deleted",
                "waiter:called",
                "waiter:resolved",
                "reservation:created",
                "table:updated",
              ];

        targetTypes.forEach((type) => {
          eventSource?.addEventListener(type, (e: MessageEvent) => {
            try {
              const event: RealtimeEvent = JSON.parse(e.data);
              onEventRef.current?.(event);
            } catch (err) {
              console.warn("[Realtime] Failed to parse event:", err);
            }
          });
        });

        eventSource.addEventListener("connected", () => {
          setIsConnected(true);
        });

        eventSource.addEventListener("ping", () => {
          setIsConnected(true);
        });
      } catch {
        setIsConnected(false);
      }
    }

    connect();

    return () => {
      isCleanedUp = true;
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (eventSource) {
        eventSource.close();
      }
      setIsConnected(false);
    };
  }, [restaurantId, branchId, enabled, eventTypesKey]);

  return { isConnected };
}
