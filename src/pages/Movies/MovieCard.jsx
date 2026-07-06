import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React  from "react";
import { faStar } from "@fortawesome/free-solid-svg-icons";
import "./MovieCard.scss";

const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/original";

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

function MovieCard({ movie }) {
  const navigate = useNavigate();
  const title = movie.title || movie.name || "Untitled Movie";
  const rating =
    typeof movie.vote_average === "number"
      ? movie.vote_average.toFixed(1)
      : "N/A";
  const genres = (movie.genres ?? []).slice(0, 3).map((genre) => genre.name);
  // const genreText = genres.join(" ");
  const notableLabel = getNotableLabel(movie);

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
      <div className="movies-card__poster-frame">
        <img
          className="movies-card__poster"
          src={`${IMAGE_BASE_URL}${movie.poster_path}`}
          alt={title}
          loading="lazy"
        />

        {notableLabel && (
          <span className="movies-card__badge">{notableLabel}</span>
        )}
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
  
  {/* Block 2: Genres Wrapper */}
  <div className="movies-card__genres">
    {genres &&
      genres.map((genre, index) => (
        <React.Fragment key={index}>
          <span>{genre}</span>
          {index < genres.length - 1 && (
            <span className="separator">•</span>
          )}
        </React.Fragment>
      ))}
  </div>
</div>

      </div>
    </article>
  );
}

export default MovieCard;
