import { useEffect, useState } from "react";
import { computeNextService } from "../lib/nextService.js";

/** The upcoming service, refreshed each minute so the strip never goes stale. */
export default function useNextService() {
  const [next, setNext] = useState(() => computeNextService());

  useEffect(() => {
    const timer = setInterval(() => setNext(computeNextService()), 60_000);
    return () => clearInterval(timer);
  }, []);

  return next;
}
