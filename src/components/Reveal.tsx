import { useEffect, useRef, useState, type ReactNode } from "react";

type RevealProps = {
  children: ReactNode;
  /** delay in ms before the element animates in */
  delay?: number;
  /** direction of the entrance movement */
  from?: "up" | "down" | "right" | "left" | "scale";
  className?: string;
  as?: "div" | "section" | "article" | "li";
  id?: string;
  "data-testid"?: string;
};


/**
 * Lightweight, responsive scroll-reveal wrapper.
 * Uses IntersectionObserver, respects prefers-reduced-motion,
 * and falls back to visible content when observers are unavailable (SSR).
 */
export function Reveal({
  children,
  delay = 0,
  from = "up",
  className = "",
  as: Tag = "div",
  id,
  ...rest
}: RevealProps) {

  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  // Keep the stagger delay during the entrance only, so later hover
  // transitions on the same element stay instant.
  const [settled, setSettled] = useState(false);
  useEffect(() => {
    if (!visible) return;
    const t = window.setTimeout(() => setSettled(true), delay + 800);
    return () => window.clearTimeout(t);
  }, [visible, delay]);

  return (
    <Tag
      {...rest}
      id={id}
      ref={ref as never}
      className={`reveal reveal-${from} ${visible ? "is-visible" : ""} ${className}`}
      style={settled ? undefined : { transitionDelay: `${delay}ms` }}
    >
      {children}
    </Tag>
  );
}


