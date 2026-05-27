import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { getInitials } from "../../utils/stringUtils";

const getCastKey = (actor) =>
  actor.credit_id ?? `${actor.id}-${actor.order ?? actor.character ?? ""}`;

function CastSection({ cast, onViewFullCast }) {
  const visibleCast = Array.isArray(cast) ? cast.slice(0, 12) : [];

  if (visibleCast.length === 0) return null;

  return (
    <section className="cast-section" aria-labelledby="cast-section-title">
      <div className="cast-section__header">
        <h2 id="cast-section-title" className="heading">
          Cast
        </h2>

        <button
          type="button"
          onClick={onViewFullCast}
          className="featured-movies__see-all"
        >
          <span>View All</span>
          <FontAwesomeIcon icon={faChevronRight} />
        </button>
      </div>

      <div className="cast-section__list">
        {visibleCast.map((actor) => (
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
    </section>
  );
}

export default CastSection;
