import { useCallback, useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import "./ScrollToTopButton.scss";

function ScrollToTopButton() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 420);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  if (!isVisible) {
    return null;
  }

  return (
    <button
      type="button"
      className="scroll-to-top-button"
      onClick={scrollToTop}
      aria-label="Scroll back to top"
    >
      <ArrowUp aria-hidden="true" />
    </button>
  );
}

export default ScrollToTopButton;
