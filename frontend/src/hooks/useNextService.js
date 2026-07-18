import { useEffect, useState } from "react";
import { computeNextService } from "../lib/nextService.js";

/**
 * The upcoming service computed from the given schedule items, refreshed each
 * minute so the strip never goes stale.
 */
export default function useNextService(items) {
  const [next, setNext] = useState(() => computeNextService(items));

  useEffect(() => {
    setNext(computeNextService(items));
    const timer = setInterval(() => setNext(computeNextService(items)), 60_000);
    return () => clearInterval(timer);
  }, [items]);

  return next;
}
