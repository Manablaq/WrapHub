"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";

type RevealProps = {
  as?: "div" | "section" | "article";
  children: ReactNode;
  className?: string;
  id?: string;
  ariaLabel?: string;
};

export function Reveal({ as = "div", children, className, id, ariaLabel }: RevealProps) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLElement | null>(null);
  const Component = as;
  const setNodeRef = (node: HTMLElement | null) => {
    ref.current = node;
  };

  useEffect(() => {
    const node = ref.current;

    if (!node) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.16 },
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, []);

  return (
    <Component
      ref={setNodeRef}
      id={id}
      aria-label={ariaLabel}
      className={["reveal", isVisible ? "is-visible" : "", className ?? ""]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </Component>
  );
}
