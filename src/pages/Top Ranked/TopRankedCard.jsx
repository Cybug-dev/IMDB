import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faEye, faPlus, faStar } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import ImageWithSkeleton from "../../components/ImageWithSkeleton/ImageWithSkeleton";
import MovieCardActions from "../../components/MovieCardActions/MovieCardActions";
import MovieCardWithCollections from "../../components/MovieCardWithCollections";

const IMG_BASE = "https://image.tmdb.org/t/p/w500";

const formatVotes = (count) => {
  if (!count || typeof count !== "number") return "0";
  return count >= 1000 ? `${(count / 1000).toFixed(0)}K` : count;
};

const formatRuntime = (minutes) => {
  if (minutes == null) return "N/A";
  const mins = Number(minutes);
  if (Number.isNaN(mins) || mins <= 0) return "N/A";
  const hours = Math.floor(mins / 60);
  const remaining = mins % 60;
  if (hours > 0) {
    return remaining > 0 ? `${hours}h ${remaining}m` : `${hours}h`;
  }
  return `${remaining}m`;
};

function TopRankedCard({ movie = {}, rank, variant = "featured", ...actions }) {
  const navigate = useNavigate();
  const posterPath = movie.poster_path
    ? `${IMG_BASE}${movie.poster_path}`
    : null;
  const title = movie.title || movie.name || "Untitled";
  const releaseDate = movie.release_date || movie.first_air_date;
  const releaseYear = releaseDate ? releaseDate.split("-")[0] : "TBA";
  const runtimeMinutes =
    typeof movie.runtime === "number"
      ? movie.runtime
      : Array.isArray(movie.episode_run_time) && movie.episode_run_time.length
      ? movie.episode_run_time[0]
      : null;
  const runtime = formatRuntime(runtimeMinutes);
  const ratingCert = movie.rating || movie.certification || movie.content_rating || "R";
  const rating =
    typeof movie.vote_average === "number"
      ? movie.vote_average.toFixed(1)
      : "N/A";
  const overview = movie.overview || "No description available.";
  const cardClassName = `top-ranked-card top-ranked-card--${variant}`;

  const goToDetails = () => {
    navigate(`/movie/${movie.id}`);
  };

  const handleKeyDown = (event) => {
    if (event.target !== event.currentTarget) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      goToDetails();
    }
  };

  if (variant === "compact") {
    return (
      <article
        className={cardClassName}
        data-movie-actions
        role="button"
        tabIndex={0}
        onClick={goToDetails}
        onKeyDown={handleKeyDown}
      >
        <div className="top-ranked-card__poster">
          <span className="top-ranked-card__badge">#{rank}</span>
          {posterPath ? (
            <ImageWithSkeleton src={posterPath} alt={title} />
          ) : (
            <div className="top-ranked-card__poster-fallback">No Image</div>
          )}
          <MovieCardActions movie={movie} {...actions} />
        </div>

        <div className="top-ranked-card__body">
          <h3 className="top-ranked-card__title compact">{title}</h3>
        </div>
      </article>
    );
  }

  return (
    <article
      className={cardClassName}
      data-movie-actions
      role="button"
      tabIndex={0}
      onClick={goToDetails}
      onKeyDown={handleKeyDown}
    >
      <div className="top-ranked-card__poster">
        <button
          type="button"
          className="top-ranked-card__add"
          aria-label={`${actions.isInWatchlist ? "Remove from" : "Add to"} watchlist: ${title}`}
          aria-pressed={actions.isInWatchlist}
          onClick={(event) => {
            event.stopPropagation();
            actions.onToggleWatchlist(movie);
          }}
        >
          <FontAwesomeIcon icon={actions.isInWatchlist ? faCheck : faPlus} />
        </button>
        {posterPath ? (
          <ImageWithSkeleton src={posterPath} alt={title} />
        ) : (
          <div className="top-ranked-card__poster-fallback">No Image</div>
        )}
        <MovieCardActions movie={movie} {...actions} onToggleWatchlist={undefined} />
      </div>

      <div className="top-ranked-card__body">
        <span className="top-ranked-card__badge">#{rank}</span>
        <h3 className="top-ranked-card__title">{title}</h3>

        <div className="top-ranked-card__meta">
          <span>{releaseYear}</span>
          <span>{runtime}</span>
          <span>{ratingCert}</span>
        </div>

        <div className="top-ranked-card__rating">
          <span className="top-ranked-card__rating-score">
            <FontAwesomeIcon icon={faStar} />
            <span>{rating}</span>
            <span>({formatVotes(movie.vote_count)})</span>
          </span>

          <button
            type="button"
            className="top-ranked-card__rate"
            onClick={(event) => event.stopPropagation()}
          >
            <FontAwesomeIcon icon={faStar} />
            <span>Rate</span>
          </button>
        </div>

        <button
          type="button"
          className="top-ranked-card__watched"
          onClick={(event) => event.stopPropagation()}
        >
          <FontAwesomeIcon icon={faEye} />
          <span>Mark as watched</span>
        </button>

        <p className="top-ranked-card__overview">{overview}</p>
      </div>
    </article>
  );
}

export default function ConnectedTopRankedCard(props) {
  return <MovieCardWithCollections {...props} component={TopRankedCard} />;
}
