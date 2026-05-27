import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { getInitials } from "../../utils/stringUtils";

const CastModal = ({ cast, onClose }) => {
  return (
    <div className="cast-modal">
      <button onClick={onClose}>
        <FontAwesomeIcon icon={faXmark} />
      </button>

      <div className="cast-container">
        <div className="search-cast">
          <input type="text" placeholder="Search Cast" />
        </div>
        <div className="cast-grid">
          {cast.map((actor) => (
            <div key={actor.id}>
              {actor.profile_path ? (
                <img
                  src={`https://image.tmdb.org/t/p/w185${actor.profile_path}`}
                  alt={actor.name}
                />
              ) : (
                <div className="cast-modal__initials">
                  {getInitials(actor.name)}
                </div>
              )}
              <h3 className="cast-section__name">{actor.name}</h3>
              <span className="cast-section__character">{actor.character}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CastModal;
