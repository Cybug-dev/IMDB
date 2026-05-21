import { Star, Sparkles } from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendar,
  faClock,
  faEarthAmericas,
  faHeart as faHeartSolid,
  faHeart as faHeartRegular,
  faPlay,
  faTv,
} from "@fortawesome/free-solid-svg-icons";
import { Check, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

const IMG_BASE = "https://image.tmdb.org/t/p/original";

function MovieHeroSection({
  movie,
  onToggleWatchlist,
  onToggleFavorite,
  isInWatchlist,
  isInFavorites,
}) {
  const navigate = useNavigate();
  const watchlistLabel = isInWatchlist ? "In Watchlist" : "Add to Watchlist";
  const posterPath = movie.poster_path || movie.backdrop_path;
  const posterUrl = posterPath ? `${IMG_BASE}${posterPath}` : "";
  const releaseYear = movie.release_date
    ? new Date(movie.release_date).getFullYear()
    : "TBA";
  
  return (
    <div className="movie-hero-section">
      <button type="button" className="movie-details-back" onClick={() => navigate(-1)}>
        Back
      </button>
      <div className="movie-hero-wrapper">
        <div className="movie-poster">
          {posterUrl && <img src={posterUrl} alt={movie.title} />}
        </div>

        <div className="movie-details">
          <h1 className="movie-title">{movie.title}</h1>
          {movie.genres.map((genre) => (
            <span key={genre.id} className="movie-genre">
              {genre.name}
            </span>
          ))}
          <div className="inline-content">
            <span className="movie-rating">
            <Star className="star-icon" />
            {movie.vote_average.toFixed(1)}/10
          </span>

          <span className="movie-release-date">
            <FontAwesomeIcon icon={faCalendar} className="inline-icon" />
            {releaseYear}
          </span>

          <span className="movie-time">
            <FontAwesomeIcon icon={faClock} className="inline-icon" />
            {movie.runtime} mins
          </span>

          <span className="movie-language">
            <FontAwesomeIcon icon={faEarthAmericas} className="inline-icon" />
            {movie.original_language}
          </span>

           <span className="movie-director">Director: {movie.director}</span>
          </div>

          <p className="movie-description">
            {movie.overview}
          </p>

          <div className="movie-verdict-box">
            <h4><Sparkles /> Imdb Verdict</h4>
          </div>

          <div className="movie-btns">
              <div className="hero-banner__actions">
                      <button type="button" className="hero-banner__trailer">
                        <FontAwesomeIcon icon={faPlay} />
                        <span>Watch Trailer</span>
                      </button>

                 <button
                            type="button"
                            className={`hero-banner__watchlist hero-banner__toggle-button${
                              isInWatchlist ? " is-active" : ""
                            }`}
                            aria-label={
                              isInWatchlist ? "Remove from watchlist" : "Add to watchlist"
                            }
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
                
                            <span
                              className="hero-banner__toggle-label-stack"
                              aria-hidden="true"
                            >
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
                            aria-label={
                              isInFavorites ? "Remove from favorites" : "Add to favorites"
                            }
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
                
                            <span
                              className="hero-banner__toggle-label-stack"
                              aria-hidden="true"
                            >
                              <span className="hero-banner__toggle-label hero-banner__toggle-label--inactive">
                             Like
                              </span>
                              <span className="hero-banner__toggle-label hero-banner__toggle-label--active">
                                {isInFavorites ? "In Favorites" : "Add to Favorites"}
                              </span>
                            </span>
                          </button>

                          <p><FontAwesome icon={faTv} /> Find Where to Watch </p>
                          <div className="where-to-watch-btn">

                          </div>

          </div>
         
        </div>

      </div>

    </div>
</div>

  );
}

export default MovieHeroSection;
