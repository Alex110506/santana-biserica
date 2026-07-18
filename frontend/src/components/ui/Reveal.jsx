import { useEffect, useRef, useState } from "react";
import usePrefersReducedMotion from "../../hooks/usePrefersReducedMotion.js";

/**
 * Fades its children up into view the first time they enter the viewport.
 * Renders instantly (no animation) when the visitor prefers reduced motion.
 */
export default function Reveal({ as: Tag = "div", className = "", children, ...rest }) {
  const reduced = usePrefersReducedMotion();
  const ref = useRef(null);
  const [visible, setVisible] = useState(reduced);

  useEffect(() => {
    if (reduced) {
      setVisible(true);
      return;
    }
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true);
            io.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.14, rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reduced]);

  return (
    <Tag
      ref={ref}
      className={`${className} transition-[opacity,transform] duration-[950ms] ease-[cubic-bezier(.2,.7,.2,1)] ${
        visible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
      }`}
      {...rest}
    >
      {children}
    </Tag>
  );
}
