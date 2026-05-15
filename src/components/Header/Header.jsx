import { useLayoutEffect, useRef } from "react";
import HeaderLeft from "./HeaderLeft";
import HeaderSearch from "./HeaderSearch";
import HeaderRight from "./HeaderRight";

function Header({
  onNavigate,
  currentPage,
  watchlistCount,
  isGlass,
  onHeightChange,
}) {
  const headerRef = useRef(null);

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

  return (
    <header
      ref={headerRef}
      className={`site-header${isGlass ? " is-glass" : ""}`}
    >
      <div className="site-header__inner">
        <HeaderLeft onNavigate={onNavigate} currentPage={currentPage} />
        <HeaderSearch />
        <HeaderRight
          onNavigate={onNavigate}
          currentPage={currentPage}
          watchlistCount={watchlistCount}
        />
      </div>
    </header>
  );
}

export default Header;
