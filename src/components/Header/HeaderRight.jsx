import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { memo } from "react";
import { headerActions } from "./headerNavigation";

function HeaderRight({ onNavigate, currentPage, watchlistCount }) {
  return (
    <div className="header-right">
      {headerActions.map(({ label, icon, page }) => (
        <button
          key={label}
          type="button"
          className={`header-action${currentPage === page ? " is-active" : ""}`}
          onClick={() => page && onNavigate(page)}
          aria-current={currentPage === page ? "page" : undefined}
        >
          <FontAwesomeIcon icon={icon} className="header-action__icon" />
          <span>{label}</span>
          {label === "Watchlist" && watchlistCount > 0 && (
            <span className="header-action__badge">{watchlistCount}</span>
          )}
        </button>
      ))}
    </div>
  );
}

export default memo(HeaderRight);
