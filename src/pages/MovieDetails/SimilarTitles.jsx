import { ArrowUpRight, Star } from "lucide-react";

function SimilarTitles({ titles, onOpenTitle }) {
  return (
    <section
      className="movie-detail-section movie-similar-titles"
      aria-labelledby="similar-titles-title"
    >
      <div className="movie-detail-section__header">
        <div>
          <p className="movie-detail-section__eyebrow">More to discover</p>
          <h2 id="similar-titles-title">Similar titles</h2>
        </div>
      </div>

      {titles.length > 0 ? (
        <div className="movie-similar-titles__list">
          {titles.map((title) => (
            <button
              type="button"
              className="movie-similar-title"
              key={title.id}
              onClick={() => onOpenTitle(title)}
              aria-label={"View " + title.title}
            >
              {title.posterUrl ? (
                <img src={title.posterUrl} alt={title.title + " poster"} loading="lazy" />
              ) : (
                <span className="movie-similar-title__fallback" aria-hidden="true">
                  {title.title}
                </span>
              )}
              <span className="movie-similar-title__overlay" aria-hidden="true" />
              <span className="movie-similar-title__meta">
                <span className="movie-similar-title__year">{title.releaseYear}</span>
                <span className="movie-similar-title__rating">
                  <Star aria-hidden="true" size={12} fill="currentColor" />
                  {title.rating}
                </span>
              </span>
              <span className="movie-similar-title__name">{title.title}</span>
              <ArrowUpRight
                className="movie-similar-title__arrow"
                aria-hidden="true"
                size={17}
              />
            </button>
          ))}
        </div>
      ) : (
        <p className="movie-similar-titles__empty">
          Similar titles are not available for this movie yet.
        </p>
      )}
    </section>
  );
}

export default SimilarTitles;
