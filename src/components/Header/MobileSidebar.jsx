import { memo, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { mobileNavItems } from "./headerNavigation";

const focusableSelector = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

function MobileSidebar({ isOpen, onClose, onNavigate, currentPage }) {
  const panelRef = useRef(null);
  const previouslyFocusedElementRef = useRef(null);
  const canUsePortal = typeof document !== "undefined";

  useEffect(() => {
    if (!isOpen) return undefined;

    previouslyFocusedElementRef.current = document.activeElement;
    const panel = panelRef.current;
    const focusableElements = panel
      ? Array.from(panel.querySelectorAll(focusableSelector))
      : [];
    const firstFocusable = focusableElements[0];

    firstFocusable?.focus();
    document.body.classList.add("mobile-sidebar-open");

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }

      if (event.key !== "Tab" || focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      }

      if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.classList.remove("mobile-sidebar-open");
      previouslyFocusedElementRef.current?.focus?.();
    };
  }, [isOpen, onClose]);

  const handleNavigate = (page) => {
    onNavigate(page);
    onClose();
  };

  const sidebar = (
    <div
      className={`mobile-sidebar${isOpen ? " is-open" : ""}`}
      aria-hidden={!isOpen}
    >
      <button
        className="mobile-sidebar__overlay"
        type="button"
        aria-label="Close navigation menu"
        tabIndex={isOpen ? 0 : -1}
        onClick={onClose}
      />

      <aside
        id="mobile-navigation-sidebar"
        ref={panelRef}
        className="mobile-sidebar__panel"
        aria-label="Mobile navigation"
        aria-modal="true"
        role="dialog"
      >
        <div className="mobile-sidebar__surface" />

        <div className="mobile-sidebar__content">
          <div className="mobile-sidebar__top">
            <button
              className="imdb-logo"
              type="button"
              aria-label="IMDB home"
              tabIndex={isOpen ? 0 : -1}
              onClick={() => handleNavigate("home")}
            >
              IMDB
            </button>

            <button
              className="mobile-sidebar__close"
              type="button"
              aria-label="Close navigation menu"
              tabIndex={isOpen ? 0 : -1}
              onClick={onClose}
            >
              <FontAwesomeIcon icon={faXmark} aria-hidden="true" />
            </button>
          </div>

          <nav className="mobile-sidebar__nav" aria-label="Mobile primary">
            {mobileNavItems.map(({ label, page, icon }) => (
              <button
                key={label}
                className={`mobile-sidebar__nav-link${
                  currentPage === page ? " is-active" : ""
                }`}
                type="button"
                aria-current={currentPage === page ? "page" : undefined}
                tabIndex={isOpen ? 0 : -1}
                onClick={() => handleNavigate(page)}
              >
                {icon ? (
                  <FontAwesomeIcon
                    className="mobile-sidebar__nav-icon"
                    icon={icon}
                    aria-hidden="true"
                  />
                ) : null}
                <span>{label}</span>
              </button>
            ))}
          </nav>

          <div className="mobile-sidebar__bottom" aria-label="Future features">
            <span className="mobile-sidebar__eyebrow">Coming soon</span>
          </div>
        </div>
      </aside>
    </div>
  );

  return canUsePortal ? createPortal(sidebar, document.body) : sidebar;
}

export default memo(MobileSidebar);
