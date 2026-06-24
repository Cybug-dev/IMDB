import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { memo } from "react";
import { primaryNavItems } from "./headerNavigation";

function HeaderLeft({ onNavigate, currentPage }) {
  return (
    <div className="header-left">
      <button className="imdb-logo" type="button" aria-label="IMDB home"
      onClick={() => onNavigate("home")}>
        IMDB
      </button>

      <nav className="header-nav" aria-label="Primary">
        {primaryNavItems.map(({ label, page, icon }) => (
          <button
            key={label}
            type="button"
            className={`header-nav__link${currentPage === page ? " is-active" : ""}`}
            aria-current={currentPage === page ? "page" : undefined}
            onClick={() => onNavigate(page)}
          >
            {icon ? (
              <FontAwesomeIcon icon={icon} className="header-nav__icon" />
            ) : null}
            <span>{label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}

export default memo(HeaderLeft);
