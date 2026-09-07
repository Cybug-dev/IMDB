import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar } from "@fortawesome/free-solid-svg-icons";
import MovieCardActions from "../../components/MovieCardActions/MovieCardActions";
import { getMoviePath } from "../../utils/movieCollections";
import ImageWithSkeleton from "../../components/ImageWithSkeleton/ImageWithSkeleton";
import "./MovieCard.scss";

const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w780";
const FALLBACK_POSTER =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 500 750'%3E%3Crect width='500' height='750' fill='%23101010'/%3E%3Ctext x='50%25' y='50%25' fill='%23999' font-family='Arial' font-size='34' text-anchor='middle' dominant-baseline='middle'%3ENo Poster%3C/text%3E%3C/svg%3E";

const getNotableLabel = (movie) => {
  const rating = Number(movie.vote_average) || 0;
  const popularity = Number(movie.popularity) || 0;
  const releaseDate = movie.release_date ? new Date(movie.release_date) : null;

  if (rating >= 8) return "Top Rated";

  if (releaseDate && !Number.isNaN(releaseDate.getTime())) {
    const now = new Date();
    const daysSinceRelease = (now - releaseDate) / (1000 * 60 * 60 * 24);

    if (daysSinceRelease >= 0 && daysSinceRelease <= 45) {
      return "New Release";
    }
  }

  if (popularity >= 300) return "Trending";

  return null;
};

function MovieCard({
  movie,
  onToggleWatchlist,
  onToggleFavorite,
  isInWatchlist = false,
  isInFavorites = false,
}) {
  const navigate = useNavigate();
  const title = movie.title || movie.name || "Untitled Movie";
  const rating =
    typeof movie.vote_average === "number"
      ? movie.vote_average.toFixed(1)
      : "N/A";
  const genres = (movie.genres ?? []).slice(0, 3).map((genre) => genre.name);
  const notableLabel = getNotableLabel(movie);
  const posterPath = movie.poster_path || movie.backdrop_path;

  const goToDetails = () => {
    navigate(getMoviePath(movie));
  };

  const handleKeyDown = (event) => {
    if (event.target !== event.currentTarget) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      goToDetails();
    }
  };

  return (
    <article
      className="movies-card"
      data-movie-actions
      role="button"
      tabIndex={0}
      onClick={goToDetails}
      onKeyDown={handleKeyDown}
    >
      <div className="movies-card__poster-frame">
        <ImageWithSkeleton
          className="movies-card__poster"
          src={posterPath ? `${IMAGE_BASE_URL}${posterPath}` : FALLBACK_POSTER}
          alt={title}
          loading="lazy"
        />

        {notableLabel && (
          <span className="movies-card__badge">{notableLabel}</span>
        )}

        <MovieCardActions
          movie={movie}
          onToggleWatchlist={onToggleWatchlist}
          onToggleFavorite={onToggleFavorite}
          isInWatchlist={isInWatchlist}
          isInFavorites={isInFavorites}
        />
      </div>

      <div className="movies-card__body">
        <div className="movies-card__title-row">
          <h3 className="movies-card__title">{title}</h3>

          <span className="movies-card__rating" aria-label={`Rated ${rating}`}>
            <FontAwesomeIcon icon={faStar} />
            <span>{rating}</span>
          </span>
        </div>

        <div className="movies-card__details">
          {typeof movie.runtime === "number" && movie.runtime > 0 && (
            <span className="movies-card__runtime">{movie.runtime} min</span>
          )}

          {genres.length > 0 && (
            <div className="movies-card__genres">
              {genres.map((genre, index) => (
                <span className="movies-card__genre" key={genre}>
                  {genre}
                  {index < genres.length - 1 && (
                    <span className="separator">/</span>
                  )}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

export default MovieCard;
