import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faStar,
  faHeart as faHeartSolid,
  faCircleInfo,
} from "@fortawesome/free-solid-svg-icons";
import { Plus, Check } from "lucide-react";
import { faHeart } from "@fortawesome/free-regular-svg-icons";

const IMG_BASE = "https://image.tmdb.org/t/p/original";
const FALLBACK_POSTER =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 500 750'%3E%3Crect width='500' height='750' fill='%23111a2d'/%3E%3Ctext x='50%25' y='50%25' fill='%2393a0bd' font-family='Arial' font-size='34' text-anchor='middle' dominant-baseline='middle'%3ENo Poster%3C/text%3E%3C/svg%3E";

function MovieCard2({
  movie,
  onToggleWatchlist,
  onToggleFavorite,
  isInWatchlist,
  isInFavorites,
}) {
  const posterPath = movie.poster_path || movie.backdrop_path;
  const rating =
    typeof movie.vote_average === "number"
      ? movie.vote_average.toFixed(1)
      : "N/A";
  const displayGenres = (movie.genres ?? []).slice(0, 2).map((g) => g.name);

  return (
    <div className="movie-card ui-surface-card">
      <div className="movie-card__poster-wrap">
        <img
          src={posterPath ? `${IMG_BASE}${posterPath}` : FALLBACK_POSTER}
          alt={movie.title}
          className="movie-card__poster"
          loading="lazy"
        />

        <div className="movie-card__quick-actions">
          <button
            type="button"
            className={`movie-card__action ui-icon-button ${isInWatchlist ? "active movie-card2__action--watchlist" : ""}`}
            aria-label={
              isInWatchlist ? "Remove from watchlist" : "Add to watchlist"
            }
            onClick={() => onToggleWatchlist(movie)}
          >
            {isInWatchlist ? <Check /> : <Plus />}
          </button>

          <button
            type="button"
            className={`movie-card__action ui-icon-button ${isInFavorites ? "active movie-card__action--favorite" : ""}`}
            aria-label={
              isInFavorites ? "Remove from favorites" : "Add to favorites"
            }
            onClick={() => onToggleFavorite(movie)}
          >
            <FontAwesomeIcon icon={isInFavorites ? faHeartSolid : faHeart} />
          </button>
        </div>
      </div>

      <div className="movie-card2__info">
        <h3 className="movie-card2__title">
          {movie.title || movie.name || "Untitled Movie"}

          <FontAwesomeIcon icon={faCircleInfo} />
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

        <button className="movie-card2_trailer_btn">Watch Trailer</button>
      </div>
    </div>
  );
}
export default MovieCard2;
