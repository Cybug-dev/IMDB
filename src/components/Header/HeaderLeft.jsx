import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHouse } from "@fortawesome/free-solid-svg-icons";

const navItems = [
  { label: "Home", icon: faHouse, page: "home" },
  { label: "Movies", page: "movies" },
  { label: "TV Shows", page: "tvshows" },
  { label: "Celebrities", page: "celebrities" },
];

function HeaderLeft({ onNavigate, currentPage }) {
  return (
    <div className="header-left">
      <button className="imdb-logo" type="button" aria-label="IMDB home"
      onClick={() => onNavigate("home")}>
        IMDB
      </button>

      <nav className="header-nav" aria-label="Primary">
        {navItems.map(({ label, page, icon }) => (
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

export default HeaderLeft;
