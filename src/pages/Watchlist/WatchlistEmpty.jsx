import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar } from "@fortawesome/free-regular-svg-icons";

function WatchlistEmpty({ onBrowse }) {
  return (
    <div className="watchlist-empty">

      <FontAwesomeIcon icon={faStar} className="watchlist-empty__icon" />

      <h2 className="watchlist-empty__title">Your watchlist is empty</h2>

      <p className="watchlist-empty__description watchlist-empty__desc">
        Browse movies and add them to your watchlist to keep track of what you
        want to watch.
      </p>

      <button 
      type="button"
      className="watchlist-empty__cta"
      onClick={onBrowse}
      >
        Browse Movies
      </button>

    </div>
  );
}

export default WatchlistEmpty;
