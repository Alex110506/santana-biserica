import { useEffect } from "react";

/**
 * Per-route <head> metadata for the SPA: sets `document.title` and the
 * `robots` meta tag, restoring the previous values when the page unmounts
 * (client-side navigation). The defaults live in index.html; only pages that
 * differ from them (e.g. the noindex-ed login/admin pages) need this hook.
 */
export default function usePageMeta({ title, robots } = {}) {
  useEffect(() => {
    const prevTitle = document.title;
    if (title) document.title = title;

    let meta = document.querySelector('meta[name="robots"]');
    const created = !meta;
    if (created) {
      meta = document.createElement("meta");
      meta.name = "robots";
      document.head.appendChild(meta);
    }
    const prevRobots = meta.getAttribute("content");
    if (robots) meta.setAttribute("content", robots);

    return () => {
      document.title = prevTitle;
      if (created) meta.remove();
      else if (prevRobots !== null) meta.setAttribute("content", prevRobots);
    };
  }, [title, robots]);
}
