import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart, faStar } from "@fortawesome/free-regular-svg-icons";
import { faArrowRightToBracket } from "@fortawesome/free-solid-svg-icons";

const actions = [
  { label: "Watchlist", icon: faStar, page: "watchlist" },
  { label: "Favorites", icon: faHeart, page: "favorites" },
  { label: "Sign In", icon: faArrowRightToBracket, page: null },
];


function HeaderRight({ onNavigate, currentPage }) {
  return (
    <div className="header-right">
      {actions.map(({ label, icon, page }) => (
        <button
          key={label}
          type="button"
          className={`header-action${currentPage === page ? " is-active" : ""}`}
          onClick={() => page && onNavigate(page)}
          aria-current={currentPage === page ? "page" : undefined}
        >
          <FontAwesomeIcon icon={icon} className="header-action__icon" />
          <span>{label}</span>
        </button>
      ))}
    </div>
  );
}

export default HeaderRight;
