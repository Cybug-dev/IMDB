import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MoviesHeroBanner from "./MoviesHeroBanner";
import MoviesSection from "./MoviesSection";
import { useFeaturedHeroMedia } from "./useHeroCarousel";
import {
  fetchGenresListOnly,
  fetchMovies,
  getLatestMovies,
  getNowShowing,
  getPopularMovieCards,
  getTopRatedMovieCards,
  getUpcomingMovies,
} from "../../services/tmdb";

function MoviesPage({
  onToggleWatchlist,
  onToggleFavorite,
  watchlist,
  favorites,
}) {
  const navigate = useNavigate();
  const [nowShowingMovies, setNowShowingMovies] = useState(null);
  const [latestMovies, setLatestMovies] = useState(null);
  const [upcomingMovies, setUpcomingMovies] = useState(null);
  const [popularMovies, setPopularMovies] = useState(null);
  const [topRatedMovies, setTopRatedMovies] = useState(null);
  const [sectionErrors, setSectionErrors] = useState({
    nowShowing: null,
    latest: null,
    upcoming: null,
    popular: null,
    topRated: null,
  });

  const fetchPopular = useCallback(() => fetchMovies(), []);

  useEffect(() => {
    let isMounted = true;
    const collectedIds = new Set();

    const loadSection = async (fetcher, setter, errorKey, excludeIds = []) => {
      try {
        const movies = await fetcher(12, excludeIds);
        if (!isMounted) return;

        setter(movies);
        movies.forEach((movie) => {
          if (movie?.id) {
            collectedIds.add(movie.id);
          }
        });
      } catch (loadError) {
        if (!isMounted) return;

        setSectionErrors((prev) => ({
          ...prev,
          [errorKey]: loadError.message || "Failed to load movies.",
        }));
        setter([]);
      }
    };

    const loadAllSections = async () => {
      await loadSection(getNowShowing, setNowShowingMovies, "nowShowing");
      await loadSection(getLatestMovies, setLatestMovies, "latest", [...collectedIds]);
      await loadSection(getUpcomingMovies, setUpcomingMovies, "upcoming", [...collectedIds]);
      await loadSection(getPopularMovieCards, setPopularMovies, "popular", [...collectedIds]);
      await loadSection(getTopRatedMovieCards, setTopRatedMovies, "topRated", [...collectedIds]);
    };

    loadAllSections();

    return () => {
      isMounted = false;
    };
  }, []);

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
        loading={nowShowingMovies === null}
        error={sectionErrors.nowShowing}
      />
      <MoviesSection
        title="Latest Movies"
        movies={latestMovies}
        loading={latestMovies === null}
        error={sectionErrors.latest}
      />
      <MoviesSection
        title="Upcoming Movies"
        movies={upcomingMovies}
        loading={upcomingMovies === null}
        error={sectionErrors.upcoming}
      />
      <MoviesSection
        title="Popular"
        movies={popularMovies}
        loading={popularMovies === null}
        error={sectionErrors.popular}
      />
      <MoviesSection
        title="Top Rated"
        movies={topRatedMovies}
        loading={topRatedMovies === null}
        error={sectionErrors.topRated}
      />
    </main>
  );
}

export default MoviesPage;
