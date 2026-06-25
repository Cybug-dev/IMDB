import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar } from  "@fortawesome/free-solid-svg-icons"

const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";

function MovieCard({ movie }) {
  const navigate = useNavigate();
  const title = movie.title || movie.name;
  const rating = movie.vote_average.toFixed(1);
  const genres = (movie.genres ?? []).slice(0, 3).map((genre) => genre.name);

  const goToDetails = () => {
    navigate(`/movie/${movie.id}`);
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      goToDetails();
    }
  };

  return (
    <article
      className="movies-card"
      role="button"
      tabIndex={0}
      onClick={goToDetails}
      onKeyDown={handleKeyDown}
    >
      <img
        className="movies-card__poster"
        src={`${IMAGE_BASE_URL}${movie.poster_path}`}
        alt={title}
        loading="lazy"
      />

      <div className="movies-card__body">
        <h3 className="movies-card__title">{title}</h3>

        <dl className="movies-card__meta">
          <div className="movies-card__meta-item">
            <FontAwesomeIcon icon={faStar} />
            <dd>{rating}</dd>
          </div>

          <div className="movies-card__meta-item">
            <dt>Runtime</dt>
            <dd>{movie.runtime} min</dd>
          </div>
        </dl>

        {genres.length > 0 && (
          <ul className="movies-card__genres" aria-label={`${title} genres`}>
            {genres.map((genre) => (
              <li key={genre}>{genre}</li>
            ))}
          </ul>
        )}
      </div>
    </article>
  );
}

export default MovieCard;
