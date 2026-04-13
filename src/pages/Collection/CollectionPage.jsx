import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar, faHeart } from "@fortawesome/free-regular-svg-icons";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import CollectionEmpty from "./CollectionEmpty";
import CollectionItem from "./CollectionItem";

const config = {
  watchlist: {
    icon: faStar,
    heading: "Your Watchlist",
    subtitle: "Your watchlist is empty. Start adding movies you want to watch!",
    emptyTitle: "Your Watchlist is empty",
    emptyDesc:
      "Browse movies and add them to your watchlist to keep track of what you want to watch.",
  },
  favorites: {
    icon: faHeart,
    heading: "Your Favorites",
    subtitle: "You haven't added any favorites yet.!",
    emptyTitle: "Your Favorites list is empty",
    emptyDesc:
      "Browse movies and add them to your favorites to keep track of what you love.",
  },
};

function CollectionPage({
  type,
  items,
  onClear,
  onToggleWatchlist,
  onToggleFavorite,
}) {
  const [visibleCount, setVisibleCount] = useState(10);
  const visibleItems = items.slice(0, visibleCount);
  const hasMore = visibleCount < items.length;
  // const [items, setItems] = useState([]);
  const { icon, heading, subtitle, emptyTitle, emptyDesc } = config[type];
  const iconColor =
    type === "watchlist" ? "var(--imdb-yellow)" : "var(--heart-color)";
  // const handleClear = () => setItems([]);
  const handleBrowse = () => {
    // TODO: navigate to Movies page when routing is added
  };
  const handleLoadMore = () => setVisibleCount((prev) => prev + 5);

  return (
    <main className="collection-page">
      <div className="collection-page__inner">
        <div className="collection-page__topbar">
          <div className="collection-page__heading">
            <FontAwesomeIcon
              icon={icon}
              className="collection-page__icon"
              style={{ color: iconColor }}
            />
            <h1 className="heading">{heading}</h1>
          </div>

          <button
            type="button"
            className="collection-clear"
            onClick={onClear}
            disabled={items.length === 0}
          >
            <FontAwesomeIcon icon={faXmark} />
            <span>Clear</span>
          </button>
        </div>

        {items.length === 0 ? (
          <>
            <p className="collection-page__subtitle">{subtitle}</p>
            <CollectionEmpty
              title={emptyTitle}
              desc={emptyDesc}
              icon={icon}
              iconColor={iconColor}
              onBrowse={handleBrowse}
            />
          </>
        ) : (
          <>
            <div className="collection-page__count">
              <span>Showing {visibleItems.length} movies</span>
              <span className="collection-page__count-dot">•</span>
              <span>
                {items.length} total{" "}
                {type === "watchlist" ? "in watchlist" : "favorites"}
              </span>
            </div>

            <div className="collection-grid">
              {visibleItems.map((movie) => (
                <CollectionItem
                  key={movie.id}
                  movie={movie}
                  type={type}
                  onToggleWatchlist={onToggleWatchlist}
                  onToggleFavorite={onToggleFavorite}
                />
              ))}
            </div>

            {hasMore && (
              <div className="collection">
                <button
                  type="button"
                  className="collection-load-more"
                  onClick={handleLoadMore}
                >
                  Load More ({items.length - visibleCount} remaining)
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}

export default CollectionPage;
