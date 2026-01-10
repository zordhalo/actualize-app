'use client';

import { useEffect, useRef } from 'react';

export function useDevServerHeartbeat() {
  // This hook is only needed in development to keep the dev server alive.
  // In production, it's a no-op.
  const lastActionTime = useRef(0);

  useEffect(() => {
    if (import.meta.env.PROD) return;

    const THROTTLE = 60_000 * 3; // 3 minutes
    const TIMEOUT = 60_000; // 1 minute

    const handleAction = () => {
      const now = Date.now();
      if (now - lastActionTime.current < THROTTLE) return;
      lastActionTime.current = now;

      // HACK: at time of writing, we run the dev server on a proxy url that
      // when requested, ensures that the dev server's life is extended. If
      // the user is using a page or is active in it in the app, but when the
      // user has popped out their preview, they no longer can rely on the
      // app to do this. This hook ensures it stays alive.
      fetch('/', { method: 'GET' }).catch(() => {
        // this is a no-op, we just want to keep the dev server alive
      });
    };

    const events = ['mousemove', 'keydown', 'wheel', 'resize', 'visibilitychange'];
    events.forEach((event) => window.addEventListener(event, handleAction, { passive: true }));

    // Also trigger on idle timeout
    const interval = setInterval(handleAction, TIMEOUT);

    return () => {
      events.forEach((event) => window.removeEventListener(event, handleAction));
      clearInterval(interval);
    };
  }, []);
}
