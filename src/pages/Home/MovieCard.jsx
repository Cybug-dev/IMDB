import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendarDays,
  faClock,
  faPlus,
  faStar,
} from "@fortawesome/free-solid-svg-icons";
import { faHeart } from "@fortawesome/free-regular-svg-icons";

const IMG_BASE = "https://image.tmdb.org/t/p/w500";
const FALLBACK_POSTER =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 500 750'%3E%3Crect width='500' height='750' fill='%23111a2d'/%3E%3Ctext x='50%25' y='50%25' fill='%2393a0bd' font-family='Arial' font-size='34' text-anchor='middle' dominant-baseline='middle'%3ENo Poster%3C/text%3E%3C/svg%3E";
const GENRE_MAP = {
  12: "Adventure",
  14: "Fantasy",
  16: "Animation",
  18: "Drama",
  27: "Horror",
  28: "Action",
  35: "Comedy",
  36: "History",
  37: "Western",
  53: "Thriller",
  80: "Crime",
  99: "Documentary",
  878: "Sci-Fi",
  9648: "Mystery",
  10402: "Music",
  10749: "Romance",
  10751: "Family",
  10752: "War",
};

function MovieCard({ movie }) {
  const posterPath = movie.poster_path || movie.backdrop_path;
  const releaseYear = movie.release_date?.split("-")[0] || "TBA";
  const displayGenres =
    movie.genres?.length > 0
      ? movie.genres.slice(0, 3).map((genre) => genre.name)
      : (movie.genre_ids ?? [])
          .map((genreId) => GENRE_MAP[genreId])
          .filter(Boolean)
          .slice(0, 3);
  const rating =
    typeof movie.vote_average === "number" ? movie.vote_average.toFixed(1) : "N/A";

  return (
    <div className="movie-card ui-surface-card">
      <div className="movie-card__poster-wrap">
        <img
          src={posterPath ? `${IMG_BASE}${posterPath}` : FALLBACK_POSTER}
          alt={movie.title}
          className="movie-card__poster"
          loading="lazy"
        />

        <div className="movie-card__rating">
          <FontAwesomeIcon icon={faStar} />
          <span>{rating}</span>
        </div>

        <div className="movie-card__quick-actions">
          <button
            type="button"
            className="movie-card__action ui-icon-button"
            aria-label="Add to watchlist"
          >
            <FontAwesomeIcon icon={faPlus} />
          </button>

          <button
            type="button"
            className="movie-card__action ui-icon-button"
            aria-label="Add to favorites"
          >
            <FontAwesomeIcon icon={faHeart} />
          </button>
        </div>
      </div>

      <div className="movie-card__info">
        <h3 className="movie-card__title ui-clamp-2">
          {movie.title || movie.name || "Untitled Movie"}
        </h3>

        <div className="movie-card__meta">
          <span className="movie-card__meta-item">
            <FontAwesomeIcon icon={faCalendarDays} />
            <span>{releaseYear}</span>
          </span>

          {movie.runtime != null && (
            <span className="movie-card__meta-item">
              <FontAwesomeIcon icon={faClock} />
              <span>{movie.runtime}m</span>
            </span>
          )}
        </div>

        {displayGenres.length > 0 && (
          <div className="movie-card__genres">
            {displayGenres.map((genre) => (
              <span key={genre} className="movie-card__genre-tag ui-chip">
                {genre}
              </span>
            ))}
          </div>
        )}

        {movie.overview && (
          <p className="movie-card__desc ui-clamp-3">{movie.overview}</p>
        )}

        {movie.director && (
          <p className="movie-card__director">
            <span className="movie-card__director-label">Director:</span>{" "}
            {movie.director}
          </p>
        )}
      </div>
    </div>
  );
}

export default MovieCard;
