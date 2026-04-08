import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHouse } from "@fortawesome/free-solid-svg-icons";

const navItems = [
  { label: "Home", active: true, icon: faHouse },
  { label: "Movies", active: false },
  { label: "TV Shows", active: false },
  { label: "Celebrities", active: false },
];

function HeaderLeft() {
  return (
    <div className="header-left">
      <button className="imdb-logo" type="button" aria-label="IMDb home">
        IMDb
      </button>

      <nav className="header-nav" aria-label="Primary">
        {navItems.map(({ label, active, icon }) => (
          <button
            key={label}
            type="button"
            className={`header-nav__link${active ? " is-active" : ""}`}
            aria-current={active ? "page" : undefined}
          >
            {icon ? <FontAwesomeIcon icon={icon} className="header-nav__icon" /> : null}
            <span>{label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}

export default HeaderLeft;
