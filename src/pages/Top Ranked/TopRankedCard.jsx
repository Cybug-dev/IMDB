import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faPlus, faStar } from "@fortawesome/free-solid-svg-icons";

const IMG_BASE = "https://image.tmdb.org/t/p/w500";

const formatVotes = (count) => {
  if (!count || typeof count !== "number") return "0";
  return count >= 1000 ? `${(count / 1000).toFixed(0)}K` : count;
};

function TopRankedCard({ movie = {}, rank, variant = "featured" }) {
  const posterPath = movie.poster_path
    ? `${IMG_BASE}${movie.poster_path}`
    : null;
  const title = movie.title || movie.name || "Untitled";
  const releaseDate = movie.release_date || movie.first_air_date;
  const releaseYear = releaseDate ? releaseDate.split("-")[0] : "TBA";
  const runtime = movie.runtime ? `${movie.runtime}m` : "N/A";
  const ratingCert = movie.rating || movie.certification || movie.content_rating || "R";
  const rating =
    typeof movie.vote_average === "number"
      ? movie.vote_average.toFixed(1)
      : "N/A";
  const overview = movie.overview || "No description available.";
  const cardClassName = `top-ranked-card top-ranked-card--${variant}`;

  if (variant === "compact") {
    return (
      <article className={cardClassName}>
        <div className="top-ranked-card__poster">
          {/* <button type="button" className="top-ranked-card__add" aria-label={`Add ${title}`}>
            <FontAwesomeIcon icon={faPlus} />
          </button> */}
          <span className="top-ranked-card__badge">#{rank}</span>
          {posterPath ? (
            <img src={posterPath} alt={title} />
          ) : (
            <div className="top-ranked-card__poster-fallback">No Image</div>
          )}
        </div>

        <div className="top-ranked-card__body">
          <h3 className="top-ranked-card__title compact">{title}</h3>
        </div>
      </article>
    );
  }

  return (
    <article className={cardClassName}>
      <div className="top-ranked-card__poster">
        <button type="button" className="top-ranked-card__add" aria-label={`Add ${title}`}>
          <FontAwesomeIcon icon={faPlus} />
        </button>
        {posterPath ? (
          <img src={posterPath} alt={title} />
        ) : (
          <div className="top-ranked-card__poster-fallback">No Image</div>
        )}
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

          <button type="button" className="top-ranked-card__rate">
            <FontAwesomeIcon icon={faStar} />
            <span>Rate</span>
          </button>
        </div>

        <button type="button" className="top-ranked-card__watched">
          <FontAwesomeIcon icon={faEye} />
          <span>Mark as watched</span>
        </button>

        <p className="top-ranked-card__overview">{overview}</p>
      </div>
    </article>
  );
}

export default TopRankedCard;
