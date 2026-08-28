import { useEffect, useRef, useState } from "react";
import FilterTabs from "../../components/FilterTabs";
import { useWhatToWatchDataset } from "../../queries/movieQueries";
import { WATCH_FILTERS } from "../../utils/movieFilters";
import MovieCard2 from "./MovieCard2";
import SectionState from "../../components/Section State/SectionState";

function WhatToWatch({
  onToggleWatchlist,
  onToggleFavorite,
  watchlist,
  favorites,
}) {
  const railRef = useRef(null);
  const [activeTab, setActiveTab] = useState(WATCH_FILTERS[0].id);
  const { data: movies = [], error, isFetching, isPending, refetch } =
    useWhatToWatchDataset(activeTab);

  useEffect(() => {
    railRef.current?.scrollTo({
      left: 0,
      behavior: "smooth",
    });
  }, [activeTab]);

  const isLoading = isPending || (isFetching && movies.length === 0);
  const visibleMovies = movies.slice(0, 15);

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

        {isLoading || error || visibleMovies.length === 0 ? (
          <SectionState
            loading={isLoading}
            error={error}
            data={visibleMovies}
            loadingMessage="Loading picks..."
            emptyTitle="No picks found"
            emptyMessage="There are no recommendations available right now."
            onRetry={refetch}
          />
        ) : (
          <div className="what-to-watch__rail" ref={railRef}>
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
        )}
      </div>
    </section>
  );
}

export default WhatToWatch;
