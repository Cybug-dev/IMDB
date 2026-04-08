import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart, faStar } from "@fortawesome/free-regular-svg-icons";
import { faArrowRightToBracket } from "@fortawesome/free-solid-svg-icons";

const actions = [
  { label: "Watchlist", icon: faStar },
  { label: "Favorites", icon: faHeart },
  { label: "Sign In", icon: faArrowRightToBracket },
];

function HeaderRight() {
  return (
    <div className="header-right">
      {actions.map(({ label, icon }) => (
        <button key={label} type="button" className="header-action">
          <FontAwesomeIcon icon={icon} className="header-action__icon" />
          <span>{label}</span>
        </button>
      ))}
    </div>
  );
}

export default HeaderRight;
