import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faStar,
  faHeart as faHeartSolid,
  faCircleInfo,
  faPlay,
} from "@fortawesome/free-solid-svg-icons";
import { Plus, Check } from "lucide-react";
import { faHeart } from "@fortawesome/free-regular-svg-icons";
import { useNavigate } from "react-router-dom";

const IMG_BASE = "https://image.tmdb.org/t/p/w500";
const FALLBACK_POSTER =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 500 750'%3E%3Crect width='500' height='750' fill='%23111a2d'/%3E%3Ctext x='50%25' y='50%25' fill='%2393a0bd' font-family='Arial' font-size='34' text-anchor='middle' dominant-baseline='middle'%3ENo Poster%3C/text%3E%3C/svg%3E";

function MovieCard2({
  movie,
  onToggleWatchlist,
  onToggleFavorite,
  isInWatchlist,
  isInFavorites,
}) {
  const navigate = useNavigate();
  const posterPath = movie.poster_path || movie.backdrop_path;
  const rating =
    typeof movie.vote_average === "number"
      ? movie.vote_average.toFixed(1)
      : "N/A";
  const displayGenres = (movie.genres ?? []).slice(0, 2).map((g) => g.name);
  const goToDetails = () => navigate(`/movie/${movie.id}`);
  const handleKeyDown = (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      goToDetails();
    }
  };

  return (
    <article
      className="movie-card2 ui-surface-card"
      role="button"
      tabIndex={0}
      onClick={goToDetails}
      onKeyDown={handleKeyDown}
    >
      <div className="movie-card__poster">
        <img
          src={posterPath ? `${IMG_BASE}${posterPath}` : FALLBACK_POSTER}
          alt={movie.title}
          className="movie-card2__poster"
        />
        <div className="movie-card2__media-overlay" />

        <div className="movie-card2__quick-actions">
          <button
            type="button"
            className={`movie-card2__action ui-icon-button ${
              isInWatchlist ? "is-active movie-card2__action--watchlist" : ""
            }`}
            aria-label={
              isInWatchlist ? "Remove from watchlist" : "Add to watchlist"
            }
            onClick={(event) => {
              event.stopPropagation();
              onToggleWatchlist(movie);
            }}
          >
            {isInWatchlist ? <Check /> : <Plus />}
          </button>

          <button
            type="button"
            className={`movie-card2__action ui-icon-button ${
              isInFavorites ? "is-active movie-card2__action--favorite" : ""
            }`}
            aria-label={
              isInFavorites ? "Remove from favorites" : "Add to favorites"
            }
            onClick={(event) => {
              event.stopPropagation();
              onToggleFavorite(movie);
            }}
          >
            <FontAwesomeIcon icon={isInFavorites ? faHeartSolid : faHeart} />
          </button>
        </div>
      </div>

      <div className="movie-card2__info">
        <h3 className="movie-card2__title">
          <span className="movie-card2__title-text">
            {movie.title || movie.name || "Untitled Movie"}
          </span>
          <FontAwesomeIcon
            icon={faCircleInfo}
            className="movie-card2__info-icon"
          />
        </h3>

        {displayGenres.length > 0 && (
          <div className="movie-card2__genres">
            {displayGenres.map((genre) => (
              <span key={genre} className="movie-card2__genre">
                {genre}
              </span>
            ))}
          </div>
        )}

        <div className="movie-card2__rating">
          <FontAwesomeIcon icon={faStar} />
          <span>{rating}</span>
        </div>

        <button
          type="button"
          className="movie-card2__trailer-button"
          onClick={(event) => event.stopPropagation()}
        >
          <FontAwesomeIcon icon={faPlay} />
          <span>Watch trailer</span>
        </button>

        <div className="movie-card2__watch-on">
          <span className="movie-card2__watch-on-label">Watch on</span>
          <span className="movie-card2__watch-on-dots" aria-hidden="true">
            <span className="movie-card2__watch-on-dot movie-card2__watch-on-dot--violet" />
            <span className="movie-card2__watch-on-dot movie-card2__watch-on-dot--red" />
          </span>
        </div>
      </div>
    </article>
  );
}
export default MovieCard2;
