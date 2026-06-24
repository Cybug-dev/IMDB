import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars } from "@fortawesome/free-solid-svg-icons";
import { faStar } from "@fortawesome/free-regular-svg-icons";
import HeaderLeft from "./HeaderLeft";
import HeaderSearch from "./HeaderSearch";
import HeaderRight from "./HeaderRight";
import MobileSidebar from "./MobileSidebar";
import WatchlistNotification from "./WatchlistNotification";

function Header({
  onNavigate,
  currentPage,
  watchlistCount,
  isGlass,
  onHeightChange,
}) {
  const headerRef = useRef(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  useLayoutEffect(() => {
    const header = headerRef.current;

    if (!header) return undefined;

    const syncHeaderHeight = () => {
      const height = header.offsetHeight;
      document.documentElement.style.setProperty(
        "--runtime-header-height",
        `${height}px`,
      );
      onHeightChange(height);
    };

    syncHeaderHeight();

    const resizeObserver = new ResizeObserver(syncHeaderHeight);
    resizeObserver.observe(header);

    return () => {
      resizeObserver.disconnect();
    };
  }, [onHeightChange]);

  const openMobileSidebar = useCallback(() => {
    setIsMobileSidebarOpen(true);
  }, []);

  const closeMobileSidebar = useCallback(() => {
    setIsMobileSidebarOpen(false);
  }, []);

  return (
    <header
      ref={headerRef}
      className={`site-header${isGlass ? " is-glass" : ""}`}
    >
      <div className="site-header__inner site-header__inner--desktop">
        <HeaderLeft onNavigate={onNavigate} currentPage={currentPage} />
        <HeaderSearch inputId="desktop-header-search-input" />
        <HeaderRight
          onNavigate={onNavigate}
          currentPage={currentPage}
          watchlistCount={watchlistCount}
        />
      </div>

      <div className="site-header__inner site-header__inner--mobile">
        <button
          className="imdb-logo mobile-header__logo"
          type="button"
          aria-label="IMDB home"
          onClick={() => onNavigate("home")}
        >
          IMDB
        </button>

        <HeaderSearch
          className="header-search--mobile"
          inputId="mobile-header-search-input"
        />

        <button
          className={`mobile-header__icon-button${
            currentPage === "watchlist" ? " is-active" : ""
          }`}
          type="button"
          aria-label={`Open watchlist${
            watchlistCount > 0 ? `, ${watchlistCount} items` : ""
          }`}
          aria-current={currentPage === "watchlist" ? "page" : undefined}
          onClick={() => onNavigate("watchlist")}
        >
          <FontAwesomeIcon icon={faStar} aria-hidden="true" />
          <WatchlistNotification count={watchlistCount} />
        </button>

        <button
          className="mobile-header__icon-button"
          type="button"
          aria-label="Open navigation menu"
          aria-expanded={isMobileSidebarOpen}
          aria-controls="mobile-navigation-sidebar"
          onClick={openMobileSidebar}
        >
          <FontAwesomeIcon icon={faBars} aria-hidden="true" />
        </button>
      </div>

      <MobileSidebar
        isOpen={isMobileSidebarOpen}
        onClose={closeMobileSidebar}
        onNavigate={onNavigate}
        currentPage={currentPage}
      />
    </header>
  );
}

export default Header;
