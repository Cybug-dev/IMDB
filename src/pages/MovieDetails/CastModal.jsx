import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Search, X } from "lucide-react";
import { getInitials } from "../../utils/stringUtils";

const getCastKey = (actor) =>
  actor.credit_id ?? String(actor.id) + "-" + (actor.order ?? actor.character ?? "");

function CastModal({ cast, onClose }) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredCast = useMemo(() => {
    const castList = Array.isArray(cast) ? cast : [];
    const term = searchTerm.trim().toLowerCase();

    if (!term) return castList;

    return castList.filter((actor) =>
      [actor.name, actor.character]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(term)),
    );
  }, [cast, searchTerm]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return createPortal(
    <div
      className="movie-cast-modal"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className="movie-cast-modal__dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="full-cast-title"
      >
        <header className="movie-cast-modal__header">
          <div>
            <p>Meet the cast</p>
            <h2 id="full-cast-title">Full cast</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Close full cast">
            <X aria-hidden="true" size={20} />
          </button>
        </header>

        <label className="movie-cast-modal__search">
          <Search aria-hidden="true" size={17} />
          <span className="sr-only">Search cast</span>
          <input
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search actor or character"
            autoFocus
          />
        </label>

        <div className="movie-cast-modal__body">
          {filteredCast.length > 0 ? (
            <div className="movie-cast-modal__grid">
              {filteredCast.map((actor) => (
                <article key={getCastKey(actor)} className="movie-cast-modal__person">
                  {actor.profile_path ? (
                    <img
                      src={"https://image.tmdb.org/t/p/w185" + actor.profile_path}
                      alt={actor.name}
                      loading="lazy"
                    />
                  ) : (
                    <div className="movie-cast-modal__initials" aria-hidden="true">
                      {getInitials(actor.name)}
                    </div>
                  )}
                  <h3>{actor.name}</h3>
                  <p>{actor.character || "Cast"}</p>
                </article>
              ))}
            </div>
          ) : (
            <p className="movie-cast-modal__empty">
              No cast members match your search.
            </p>
          )}
        </div>
      </section>
    </div>,
    document.body,
  );
}

export default CastModal;
