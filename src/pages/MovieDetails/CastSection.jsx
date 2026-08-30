import { ArrowUpRight } from "lucide-react";
import { getInitials } from "../../utils/stringUtils";

const getCastKey = (actor) =>
  actor.credit_id ?? String(actor.id) + "-" + (actor.order ?? actor.character ?? "");

function CastSection({ cast, director, onViewFullCast }) {
  const visibleCast = Array.isArray(cast) ? cast.slice(0, 8) : [];

  if (visibleCast.length === 0 && !director) return null;

  return (
    <section className="movie-detail-section movie-cast" aria-labelledby="cast-title">
      <div className="movie-detail-section__header">
        <div>
          <p className="movie-detail-section__eyebrow">The people behind the film</p>
          <h2 id="cast-title">Cast &amp; crew</h2>
        </div>

        {visibleCast.length > 0 && (
          <button
            type="button"
            className="movie-detail-section__link"
            onClick={onViewFullCast}
          >
            <span>View full cast</span>
            <ArrowUpRight aria-hidden="true" size={16} />
          </button>
        )}
      </div>

      {director && (
        <div className="movie-cast__director">
          <span>Director</span>
          <strong>{director}</strong>
        </div>
      )}

      {visibleCast.length > 0 && (
        <div className="movie-cast__list">
          {visibleCast.map((actor) => (
            <article key={getCastKey(actor)} className="movie-cast__person">
              {actor.profile_path ? (
                <img
                  src={"https://image.tmdb.org/t/p/w185" + actor.profile_path}
                  alt={actor.name}
                  loading="lazy"
                />
              ) : (
                <div className="movie-cast__initials" aria-hidden="true">
                  {getInitials(actor.name)}
                </div>
              )}
              <div>
                <h3>{actor.name}</h3>
                <p>{actor.character || "Cast"}</p>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default CastSection;
