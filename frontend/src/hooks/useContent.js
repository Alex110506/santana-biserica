import { useEffect, useState } from "react";

/**
 * Load a public content section from the backend.
 *
 * Starts with (and keeps) `fallback` — the bundled default content — while the
 * request is in flight, when the section was never published (the getter
 * resolves to `null`) or when the backend is unreachable. The public site
 * therefore never renders broken/empty sections.
 *
 * `fetcher` must be referentially stable (the module-level functions from
 * `lib/content.js` are).
 */
export default function useContent(fetcher, fallback) {
  const [data, setData] = useState(fallback);

  useEffect(() => {
    let active = true;
    fetcher()
      .then((payload) => {
        if (active && payload) setData(payload);
      })
      .catch(() => {
        /* keep the fallback — the section stays presentable */
      });
    return () => {
      active = false;
    };
  }, [fetcher]);

  return data;
}
