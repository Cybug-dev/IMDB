import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar, faPlus } from "@fortawesome/free-solid-svg-icons";
import { faHeart } from "@fortawesome/free-regular-svg-icons";

const IMG_BASE = "https://image.tmdb.org/t/p/w500";

function MovieCard({ movie }) {
  return (
    <div className="movie-card">
      <div className="movie-card__poster-wrap">
        <img
          src={`${IMG_BASE}${movie.poster_path}`}
          alt={movie.title}
          className="movie-card__poster"
          loading="lazy"
        />

        <div className="movie-card__rating">
          <FontAwesomeIcon icon={faStar} />
          <span>{movie.vote_average.toFixed(1)}</span>
        </div>
        <div className="movie-card__quick-actions">
          <button
            type="button"
            className="movie-card__action"
            aria-label="Add to watchlist"
          >
            <FontAwesomeIcon icon={faPlus} />
          </button>

          <button
            type="button"
            className="movie-card__action"
            aria-label="Add to favorites"
          >
            <FontAwesomeIcon icon={faHeart} />
          </button>
        </div>
      </div>

      <div className="movie-card__info">
        <h3 className="movie-card__title">{movie.title}</h3>

        <div className="movie-card__meta">
          <span>{movie.release_date?.split("-")[0]}</span>
          {movie.runtime != null && (
            <>
              <span className="movie-card__dot">•</span>
              <span className="movie-card__runtime">{movie.runtime}m</span>
            </>
          )}
          </div>

          {movie.genres?.length > 0 && (
            <div className="movie-card__genres">
              {movie.genres.map((g) => {
                <span key={g.id} className="movie-card__genre-tag">
                  {g.name}
                </span>;
              })}
            </div>
          )}

          {movie.overview && (
            <p className="movie-card__desc">{movie.overview}</p>
          )}

            {movie.director && (
          <p className="movie-card__director">
            <span>Director:</span> {movie.director}
          </p>
        )}

        </div>
      </div>
  );
}

export default MovieCard;