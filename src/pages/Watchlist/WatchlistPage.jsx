import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar } from "@fortawesome/free-regular-svg-icons";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import WatchlistEmpty from "./WatchlistEmpty";

function Watchlist() {
  const [watchlist, setWatchlist] = useState([]);
  const handleClear = () => setWatchlist([]);
  const handleBrowse = () => {
    // TODO: navigate to Movies page when routing is added
  };

  return (
    <main className="watchlist-page">
      <div className="watchlist-page__inner">
        <div className="watchlist-page__topbar">
          <div className="watchlist-page__heading">
            <FontAwesomeIcon icon={faStar} className="watchlist-page__star" />
            <h1>Your Watchlist</h1>
          </div>

          <button
            type="button"
            className="watchlist-clear"
            onClick={handleClear}
            disabled={watchlist.length === 0}
          >
            <FontAwesomeIcon icon={faXmark} />
            <span>Clear</span>
          </button>
        </div>

        {watchlist.length === 0 ? (
          <>
            <p className="watchlist-page__subtitle">
              Your watchlist is empty. Start adding movies you want to watch!
            </p>
            <WatchlistEmpty onBrowse={handleBrowse} />
          </>
        ) : (
          <div className="watchlist-grid">
            {/* TODO: Add watchlist movie cards here */}
          </div>
        )}
        
      </div>
    </main>
  );
}

export default Watchlist;
