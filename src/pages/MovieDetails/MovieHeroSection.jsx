import { Check, Plus, Star } from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendar,
  faCircleInfo,
  faClock,
  faEarthAmericas,
  faHeart as faHeartSolid,
  faPlay,
  faTv,
  faUpRightFromSquare,
} from "@fortawesome/free-solid-svg-icons";
import { faHeart as faHeartRegular } from "@fortawesome/free-regular-svg-icons";
import { useNavigate } from "react-router-dom";
import SectionState from "../../components/Section State/SectionState";

const IMG_BASE = "https://image.tmdb.org/t/p/original";

const STREAMING_OPTIONS = [
  { name: "Netflix", iconSrc: "/src/assets/imageIcons/netflix.png" },
  { name: "Apple TV", iconSrc: "/src/assets/imageIcons/appletv.png" },
  { name: "YouTube", iconSrc: "/src/assets/imageIcons/youtube.png" },
  { name: "MovieBox", iconSrc: "/src/assets/imageIcons/moviebox.png" },
];

function MovieHeroSection({
  movie,
  onToggleWatchlist,
  onToggleFavorite,
  isInWatchlist,
  isInFavorites,
  loading = false,
  error = null,
  onRetry,
}) {
  const navigate = useNavigate();
  if (loading || error || !movie) {
    return (
      <SectionState
        as="section"
        className="movie-hero-section"
        variant="hero"
        loading={loading}
        error={error}
        data={movie}
        emptyTitle="Movie not found"
        emptyMessage="This movie is not available right now."
        onRetry={onRetry}
      />
    );
  }

  const watchlistLabel = isInWatchlist ? "In Watchlist" : "Add to Watchlist";
  const posterPath = movie.poster_path || movie.backdrop_path;
  const backdropPath = movie.backdrop_path || movie.poster_path;
  const posterUrl = posterPath ? `${IMG_BASE}${posterPath}` : "";
  const backdropUrl = backdropPath ? `${IMG_BASE}${backdropPath}` : "";
  const releaseYear = movie.release_date
    ? new Date(movie.release_date).getFullYear()
    : "TBA";
  const runtimeLabel = movie.runtime ? `${movie.runtime} mins` : "Runtime TBA";
  const languageLabel = movie.original_language
    ? movie.original_language.toUpperCase()
    : "N/A";
  const score = Number.isFinite(movie.vote_average) ? movie.vote_average.toFixed(1) : "N/A";
  const userScorePercent = Number.isFinite(movie.vote_average)
    ? Math.round(movie.vote_average * 10)
    : 0;

  return (
    <section
      className="movie-hero-section"
      style={backdropUrl ? { "--movie-hero-backdrop": `url("${backdropUrl}")` } : undefined}
    >
      <div className="movie-hero-section__backdrop" aria-hidden="true" />
      <div className="movie-hero-section__inner">
        <button
          type="button"
          className="movie-hero-section__back"
          onClick={() => navigate(-1)}
        >
          <span>Back</span>
        </button>

        <div className="movie-hero-section__content">
          <div className="movie-hero-section__poster-column">
            <div className="movie-hero-section__poster-shell">
              {posterUrl && (
                <img
                  className="movie-hero-section__poster"
                  src={posterUrl}
                  alt={movie.title}
                />
              )}
            </div>
          </div>

          <div className="movie-hero-section__details">
            {movie.tagline && (
              <p className="movie-hero-section__tagline">{movie.tagline}</p>
            )}

            <h1 className="movie-hero-section__title">{movie.title}</h1>

            {movie.genres.length > 0 && (
              <div className="movie-hero-section__genres">
                {movie.genres.map((genre) => (
                  <span key={genre.id} className="movie-hero-section__genre ui-chip">
                    {genre.name}
                  </span>
                ))}
              </div>
            )}

            <div className="movie-hero-section__score-strip">
              <div
                className="movie-hero-section__user-score"
                style={{ "--user-score": `${userScorePercent}%` }}
                aria-label={`User score ${userScorePercent}%`}
              >
                <span className="movie-hero-section__user-score-value">
                  {userScorePercent}
                </span>
              </div>

              <span className="movie-hero-section__user-score-label">
                User
                <br />
                Score
              </span>

              <button type="button" className="movie-hero-section__vibe-button">
                <span>Rate this title</span>
                <FontAwesomeIcon icon={faCircleInfo} />
              </button>
            </div>

            <div className="movie-hero-section__meta">
              <span className="movie-hero-section__meta-item movie-hero-section__meta-item--rating">
                <Star size={15} />
                <span>{score}<span className="movie-hero-section__meta-item__scale"> / 10</span></span>
              </span>
              <span className="movie-hero-section__meta-separator" aria-hidden="true" />
              <span className="movie-hero-section__meta-item">
                <FontAwesomeIcon icon={faCalendar} />
                <span>{releaseYear}</span>
              </span>
              <span className="movie-hero-section__meta-separator" aria-hidden="true" />
              <span className="movie-hero-section__meta-item">
                <FontAwesomeIcon icon={faClock} />
                <span>{runtimeLabel}</span>
              </span>
              <span className="movie-hero-section__meta-separator" aria-hidden="true" />
              <span className="movie-hero-section__meta-item">
                <FontAwesomeIcon icon={faEarthAmericas} />
                <span>{languageLabel}</span>
              </span>
            </div>

            <p className="movie-hero-section__overview">{movie.overview}</p>

            <div className="movie-hero-section__actions">
              <button type="button" className="hero-banner__trailer">
                <FontAwesomeIcon icon={faPlay} />
                <span>Watch Trailer</span>
              </button>

              <button
                type="button"
                className={`hero-banner__watchlist hero-banner__toggle-button${
                  isInWatchlist ? " is-active" : ""
                }`}
                aria-label={isInWatchlist ? "Remove from watchlist" : "Add to watchlist"}
                onClick={onToggleWatchlist}
              >
                <span className="hero-banner__toggle-icon-stack" aria-hidden="true">
                  <span className="hero-banner__toggle-icon hero-banner__toggle-icon--inactive">
                    <Plus />
                  </span>
                  <span className="hero-banner__toggle-icon hero-banner__toggle-icon--active">
                    <Check />
                  </span>
                </span>
                <span className="hero-banner__toggle-label-stack" aria-hidden="true">
                  <span className="hero-banner__toggle-label hero-banner__toggle-label--inactive">
                    Add to Watchlist
                  </span>
                  <span className="hero-banner__toggle-label hero-banner__toggle-label--active">
                    {watchlistLabel}
                  </span>
                </span>
              </button>

              <button
                type="button"
                className={`hero-banner__favourites hero-banner__toggle-button${
                  isInFavorites ? " is-active" : ""
                }`}
                aria-label={isInFavorites ? "Remove from favorites" : "Add to favorites"}
                onClick={onToggleFavorite}
              >
                <span className="hero-banner__toggle-icon-stack" aria-hidden="true">
                  <span className="hero-banner__toggle-icon hero-banner__toggle-icon--inactive">
                    <FontAwesomeIcon icon={faHeartRegular} />
                  </span>
                  <span className="hero-banner__toggle-icon hero-banner__toggle-icon--active">
                    <FontAwesomeIcon icon={faHeartSolid} />
                  </span>
                </span>
                <span className="hero-banner__toggle-label-stack" aria-hidden="true">
                  <span className="hero-banner__toggle-label hero-banner__toggle-label--inactive">
                    Like
                  </span>
                  <span className="hero-banner__toggle-label hero-banner__toggle-label--active">
                    {isInFavorites ? "In Favorites" : "Add to Favorites"}
                  </span>
                </span>
              </button>
            </div>

            <div className="movie-hero-section__watch-on">
              <p className="movie-hero-section__watch-on-label">
                <FontAwesomeIcon icon={faTv} />
                <span>Find where to watch</span>
              </p>

              <div className="movie-hero-section__platforms">
                {STREAMING_OPTIONS.map((platform) => (
                  <button
                    key={platform.name}
                    type="button"
                    className="movie-hero-section__platform"
                  >
                    <img src={platform.iconSrc} alt="" />
                    <span>{platform.name}</span>
                    <FontAwesomeIcon
                      icon={faUpRightFromSquare}
                      className="movie-hero-section__platform-icon"
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default MovieHeroSection;
