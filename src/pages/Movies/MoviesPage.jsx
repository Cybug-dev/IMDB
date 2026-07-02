import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import MoviesHeroBanner from "./MoviesHeroBanner";
import MoviesSection from "./MoviesSection";
import { useFeaturedHeroMedia } from "./useHeroCarousel";
import {
  fetchGenresListOnly,
  fetchMovies,
  useMoviesPageSections,
} from "../../queries/movieQueries";

function MoviesPage({
  onToggleWatchlist,
  onToggleFavorite,
  watchlist,
  favorites,
}) {
  const navigate = useNavigate();
  const fetchPopular = useCallback(() => fetchMovies(), []);
  const {
    data: sectionData = {},
    isPending: sectionsLoading,
  } = useMoviesPageSections();
  const {
    latestMovies = [],
    nowShowingMovies = [],
    popularMovies = [],
    sectionErrors = {},
    topRatedMovies = [],
    upcomingMovies = [],
  } = sectionData;

  const { items, loading, error } = useFeaturedHeroMedia({
    fetchPopular,
    fetchGenres: fetchGenresListOnly,
    mediaType: "movie",
    limit: 8,
  });

  const handlePlay = useCallback(
    (movie) => {
      navigate(`/movie/${movie.id}`);
    },
    [navigate],
  );

  return (
    <main>
      <MoviesHeroBanner
        items={items}
        loading={loading}
        error={error}
        watchlist={watchlist}
        favorites={favorites}
        onPlay={handlePlay}
        onToggleWatchlist={onToggleWatchlist}
        onToggleFavorite={onToggleFavorite}
      />

      <MoviesSection
        title="Now Showing"
        movies={nowShowingMovies}
        loading={sectionsLoading}
        error={sectionErrors.nowShowing}
      />
      <MoviesSection
        title="Latest Movies"
        movies={latestMovies}
        loading={sectionsLoading}
        error={sectionErrors.latest}
      />
      <MoviesSection
        title="Upcoming Movies"
        movies={upcomingMovies}
        loading={sectionsLoading}
        error={sectionErrors.upcoming}
      />
      <MoviesSection
        title="Popular"
        movies={popularMovies}
        loading={sectionsLoading}
        error={sectionErrors.popular}
      />
      <MoviesSection
        title="Top Rated"
        movies={topRatedMovies}
        loading={sectionsLoading}
        error={sectionErrors.topRated}
      />
    </main>
  );
}

export default MoviesPage;
