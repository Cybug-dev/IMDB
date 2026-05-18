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

  // const isLoading = requestState.tabId !== activeTab;
  const currentError =
    requestState.tabId === activeTab ? requestState.error : null;
  const visibleMovies = requestState.movies.slice(0, 10);

  return (
    <section className="what-to-watch">
      <div className="what-to-watch__header">
        <h2 className="heading what-to-watch__title">What to Watch</h2>
      </div>

      <div className="what-to-watch__panel">
        <div className="what-to-watch__intro">
          <p className="what-to-watch__eyebrow">Top picks just for you</p>

          <FilterTabs
            tabs={WATCH_FILTERS}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            className="what-to-watch__tabs"
          />
        </div>

        <div className="what-to-watch__rail">
          {visibleMovies.map((movie) => (
            <MovieCard2
              key={movie.id}
              movie={movie}
              onToggleWatchlist={onToggleWatchlist}
              onToggleFavorite={onToggleFavorite}
              isInWatchlist={watchlist.some((m) => m.id === movie.id)}
              isInFavorites={favorites.some((m) => m.id === movie.id)}
            />
            
          ))
                      }
        </div>
        {currentError && (
          <div className="what-to-watch__status">{currentError}</div>
        )}
      </div>
    </section>
  );
}

export default WhatToWatch;
