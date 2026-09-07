import { useEffect, useState } from "react";

export function useHorizontalScroll(viewportRef, itemCount) {
  const [edges, setEdges] = useState({ left: false, right: false });

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return undefined;

    let frame;
    const measure = () => {
      frame = undefined;
      const maxScroll = viewport.scrollWidth - viewport.clientWidth;
      const left = viewport.scrollLeft > 2;
      const right = viewport.scrollLeft < maxScroll - 2;

      setEdges((previous) =>
        previous.left === left && previous.right === right
          ? previous
          : { left, right },
      );
    };
    const scheduleMeasure = () => {
      if (frame === undefined) frame = window.requestAnimationFrame(measure);
    };

    // Recheck both the viewport and card width when responsive breakpoints change.
    const observer = new ResizeObserver(scheduleMeasure);
    observer.observe(viewport);
    if (viewport.firstElementChild) observer.observe(viewport.firstElementChild);
    viewport.addEventListener("scroll", scheduleMeasure, { passive: true });
    scheduleMeasure();

    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
      viewport.removeEventListener("scroll", scheduleMeasure);
    };
  }, [viewportRef, itemCount]);

  const scroll = (direction) => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    viewport.scrollBy({
      left: direction * viewport.clientWidth * 0.9,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
    });
  };

  const onKeyDown = (event) => {
    // Card buttons retain their own keyboard behavior; arrows act on the row.
    if (
      event.target !== event.currentTarget ||
      event.altKey || event.ctrlKey || event.metaKey || event.shiftKey
    ) return;

    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault();
      scroll(event.key === "ArrowLeft" ? -1 : 1);
    }
  };

  return { canScrollLeft: edges.left, canScrollRight: edges.right, scroll, onKeyDown };
}
