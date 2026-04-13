import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
// import { faBookMark } from "@fortawesome/free-regular-svg-icons";
// import { faHeart } from "@fortawesome/free-solid-svg-icons";

const IMG_BASE = "https://image.tmdb.org/t/p/w500";
const FALLBACK_POSTER =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 300'%3E%3Crect width='200' height='300' fill='%23333'/%3E%3Ctext x='100' y='150' font-family='Arial' font-size='20' fill='white' text-anchor='middle'%3ENo Image%3C/text%3E%3C/svg%3E";

function CollectionItem({ movie, type, onToggleWatchlist, onToggleFavorite }) {
  const posterSrc = movie.poster_path
    ? `${IMG_BASE}${movie.poster_path}`
    : FALLBACK_POSTER;

  const handleRemove = () => {
    type === "watchlist" ? onToggleWatchlist(movie) : onToggleFavorite(movie);
  };

  return (
    <div className="collection-item">
      <img
        src={posterSrc}
        alt={movie.title}
        className="collection-item__poster"
        loading="lazy"
      />

      <div className="collection-item__hover">
        <div className="collection-item__hover-top">
          <span className="collection-item__title">{movie.title}</span>
        </div>
        <button
          className="collection-item__remove"
          type="button"
          aria-label={`Remove ${movie.title}`}
          onClick={handleRemove}
        >
          <FontAwesomeIcon icon={faTrash} />
          <span>Remove</span>
        </button>
      </div>
    </div>
  );
}

export default CollectionItem;
