import { ArrowLeft, Bookmark, Check, Heart, Play, Star } from "lucide-react";

function MovieHeroSection({
  movie,
  isInWatchlist,
  isInFavorites,
  onBack,
  onToggleWatchlist,
  onToggleFavorite,
}) {
  const heroStyle = movie.backdropUrl
    ? { "--movie-detail-backdrop": "url(" + movie.backdropUrl + ")" }
    : undefined;

  return (
    <section className="movie-detail-hero" style={heroStyle}>
      <div className="movie-detail-hero__backdrop" aria-hidden="true" />

      <div className="movie-detail-hero__inner">
        <button
          type="button"
          className="movie-detail-hero__back"
          onClick={onBack}
        >
          <ArrowLeft aria-hidden="true" size={17} />
          <span>Back to browsing</span>
        </button>

        <div className="movie-detail-hero__layout">
          <div className="movie-detail-hero__poster-wrap">
            {movie.posterUrl ? (
              <img
                className="movie-detail-hero__poster"
                src={movie.posterUrl}
                alt={movie.title + " poster"}
              />
            ) : (
              <div
                className="movie-detail-hero__poster movie-detail-hero__poster--fallback"
                role="img"
                aria-label={"No poster available for " + movie.title}
              >
                <span>{movie.title}</span>
              </div>
            )}
          </div>

          <div className="movie-detail-hero__content">
            <p className="movie-detail-hero__eyebrow">
              {movie.mediaLabel} <span aria-hidden="true">•</span> {movie.releaseYear}
            </p>

            <h1 className="movie-detail-hero__title">{movie.title}</h1>

            <div className="movie-detail-hero__meta" aria-label="Movie information">
              <span>{movie.releaseYear}</span>
              <span aria-hidden="true">•</span>
              <span>{movie.runtimeLabel}</span>
              {movie.certification && (
                <>
                  <span aria-hidden="true">•</span>
                  <span>{movie.certification}</span>
                </>
              )}
            </div>

            {movie.tagline && (
              <p className="movie-detail-hero__tagline">“{movie.tagline}”</p>
            )}

            <p className="movie-detail-hero__summary">{movie.summary}</p>

            {movie.genres.length > 0 && (
              <div className="movie-detail-hero__genres" aria-label="Genres">
                {movie.genres.map((genre) => (
                  <span key={genre.id ?? genre.name}>{genre.name}</span>
                ))}
              </div>
            )}

            <div className="movie-detail-hero__actions">
              {movie.trailerUrl ? (
                <a
                  className="movie-detail-action movie-detail-action--primary"
                  href={movie.trailerUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Play aria-hidden="true" size={16} fill="currentColor" />
                  <span>Watch trailer</span>
                </a>
              ) : (
                <button
                  type="button"
                  className="movie-detail-action movie-detail-action--primary"
                  disabled
                  title="A trailer is not available for this title."
                >
                  <Play aria-hidden="true" size={16} fill="currentColor" />
                  <span>Trailer unavailable</span>
                </button>
              )}

              <button
                type="button"
                className={
                  "movie-detail-action" +
                  (isInWatchlist ? " is-active" : "")
                }
                onClick={onToggleWatchlist}
                aria-label={
                  isInWatchlist
                    ? "Remove from watchlist"
                    : "Add to watchlist"
                }
              >
                {isInWatchlist ? (
                  <Check aria-hidden="true" size={17} />
                ) : (
                  <Bookmark aria-hidden="true" size={17} />
                )}
                <span>
                  {isInWatchlist ? "In watchlist" : "Add to watchlist"}
                </span>
              </button>

              <button
                type="button"
                className={
                  "movie-detail-action movie-detail-action--icon" +
                  (isInFavorites ? " is-favorite" : "")
                }
                onClick={onToggleFavorite}
                aria-label={
                  isInFavorites
                    ? "Remove from favorites"
                    : "Add to favorites"
                }
                title={isInFavorites ? "Remove from favorites" : "Add to favorites"}
              >
                <Heart
                  aria-hidden="true"
                  size={18}
                  fill={isInFavorites ? "currentColor" : "none"}
                />
              </button>
            </div>
          </div>

          <aside className="movie-detail-score" aria-label="TMDB rating">
            <div className="movie-detail-score__mark">
              <Star aria-hidden="true" size={18} fill="currentColor" />
            </div>
            <div>
              <p>TMDB rating</p>
              <strong>
                {movie.rating}
                <small>/10</small>
              </strong>
            </div>
            <span className="movie-detail-score__votes">
              {movie.voteCountLabel} ratings
            </span>
          </aside>
        </div>

        <dl className="movie-detail-hero__facts">
          <div>
            <dt>Directed by</dt>
            <dd>{movie.director || "Not available"}</dd>
          </div>
          <div>
            <dt>Original language</dt>
            <dd>{movie.languageLabel}</dd>
          </div>
          <div>
            <dt>Runtime</dt>
            <dd>{movie.runtimeLabel}</dd>
          </div>
        </dl>
      </div>
    </section>
  );
}

export default MovieHeroSection;
