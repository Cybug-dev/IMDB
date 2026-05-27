import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { getInitials } from "../../utils/stringUtils";

const getCastKey = (actor) =>
  actor.credit_id ?? `${actor.id}-${actor.order ?? actor.character ?? ""}`;

const CastModal = ({ cast, onClose }) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredCast = useMemo(() => {
    const castList = Array.isArray(cast) ? cast : [];
    const normalizedSearch = searchTerm.trim().toLowerCase();

    if (!normalizedSearch) return castList;

    return castList.filter((actor) => {
      const actorName = actor.name?.toLowerCase() ?? "";
      const characterName = actor.character?.toLowerCase() ?? "";

      return (
        actorName.includes(normalizedSearch) ||
        characterName.includes(normalizedSearch)
      );
    });
  }, [cast, searchTerm]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  const handleBackdropMouseDown = (event) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  return createPortal(
    <div 
    className="cast-modal"
    role="presentation"
    onMouseDown={handleBackdropMouseDown}
    >
      <div
        className="cast-modal__container"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cast-modal-title"
      >
        <header className="cast-modal__header">
        <h2 id="cast-modal-title" className="heading">
          Full Cast
        </h2>
      <button
      type="button"
      onClick={onClose}
      className="cast-modal__close ui-icon-button"
      aria-label="Close Cast Modal">
        <FontAwesomeIcon icon={faXmark} />
      </button>
      </header>

      <label className="cast-modal__search">
        <span className="sr-only">Search Cast</span>
          <input 
          type="search" 
          placeholder="Search by actor or character" 
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          autoFocus
        />
        </label>
        <div className="cast-modal__body">
          {filteredCast.length > 0 ? (
            <div className="cast-modal__grid">
              {filteredCast.map((actor) => (
                <article key={getCastKey(actor)} className="cast-card">
                  {actor.profile_path ? (
                    <img
                      src={`https://image.tmdb.org/t/p/w185${actor.profile_path}`}
                      alt={actor.name}
                      className="cast-card__image"
                      loading="lazy"
                    />
                  ) : (
                    <div className="cast-card__initials" aria-hidden="true">
                      {getInitials(actor.name)}
                    </div>
                  )}
                  <h3 className="cast-card__name">{actor.name}</h3>
                  <p className="cast-card__character">{actor.character}</p>
                </article>
              ))}
            </div>
          ) : (
            <div className="cast-modal__empty">
              No cast members match your search.
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default CastModal;
