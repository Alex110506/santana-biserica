import { useEffect, useState } from "react";
import usePrefersReducedMotion from "./usePrefersReducedMotion.js";

/**
 * rAF-throttled scroll offset for the hero parallax.
 * Returns 0 when the visitor prefers reduced motion.
 */
export default function useParallax(factor = 0.28, max = 900) {
  const reduced = usePrefersReducedMotion();
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    if (reduced) {
      setOffset(0);
      return;
    }
    let raf = null;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = null;
        setOffset(Math.round(Math.min(window.scrollY, max) * factor));
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [factor, max, reduced]);

  return offset;
}
