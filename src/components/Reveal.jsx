import { useEffect, useRef } from "react";

export default function Reveal({ children, className = "", delay = 0, as: Tag = "div", scrollFocus = false, parallax = false }) {
  const elementRef = useRef(null);
  const cardFocus = scrollFocus || /(^|\s)(project-card|service-card|price-card|service-detail|process-step|founder-card|value-item|card)(\s|$)/.test(className);

  useEffect(() => {
    const element = elementRef.current;
    if (!element || !("IntersectionObserver" in window)) {
      element?.classList.add("is-visible");
      return undefined;
    }
    const observer = new IntersectionObserver(
      ([entry]) => element.classList.toggle("is-visible", entry.isIntersecting),
      { threshold: 0.12, rootMargin: "0px 0px -5% 0px" },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag ref={elementRef} className={"reveal " + className} data-scroll-focus={cardFocus ? "" : undefined} data-scroll-parallax={parallax ? "" : undefined} style={{ "--reveal-delay": delay + "ms" }}>
      {children}
    </Tag>
  );
}
