import { useEffect, useState } from "react";
import FilterTabs from "../../components/FilterTabs";
import { fetchWhatToWatchDataset } from "../../services/tmdb";
import { WATCH_FILTERS } from "../../utils/movieFilters";
import MovieCard2 from "./MovieCard2";
  
function WhatToWatch({
  onToggleWatchlist,
  onToggleFavorite,
  watchlist,
  favorites,
}) {
  const [activeTab, setActiveTab] = useState(WATCH_FILTERS[0].id);
  const [requestState, setRequestState] = useState({
    tabId: null,
    movies: [],
    error: null,
  });

  useEffect(() => {
    let cancelled = false;

    fetchWhatToWatchDataset(activeTab)
      .then((movies) => {
        if (!cancelled) {
          setRequestState({
            tabId: activeTab,
            movies,
            error: null,
          });
        }
      })
      .catch((error) => {
        if (!cancelled) {
          setRequestState({
            tabId: activeTab,
            movies: [],
            error:
              error.message || "Failed to load recommendations right now.",
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [activeTab]);

  const isLoading = requestState.tabId !== activeTab;
  const currentError =
    requestState.tabId === activeTab ? requestState.error : null;
  const visibleMovies = requestState.movies.slice(0, 10);

  return (
    <section className="what-to-watch">
      <h2 className="heading">What to Watch</h2>

      <FilterTabs
        tabs={WATCH_FILTERS}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        className="what-to-watch-tabs"
      />

      {isLoading && <div className="what-to-watch-status">Loading...</div>}
      {currentError && (
        <div className="what-to-watch-status">{currentError}</div>
      )}

      <div className="what-to-watch-grid">
        {visibleMovies.map((movie) => (
          <MovieCard2
            key={movie.id}
            movie={movie}
            onToggleWatchlist={onToggleWatchlist}
            onToggleFavorite={onToggleFavorite}
            isInWatchlist={watchlist.some((m) => m.id === movie.id)}
            isInFavorites={favorites.some((m) => m.id === movie.id)}
          />
        ))}
      </div>
    </section>
  );
}

export default WhatToWatch;
