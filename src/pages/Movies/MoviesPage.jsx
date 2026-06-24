import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import MoviesHeroBanner from "./MoviesHeroBanner";
import { useFeaturedHeroMedia } from "./useHeroCarousel";
import {
  fetchGenresListOnly,
  fetchNowPlayingMovies,
  fetchPopularMovies,
} from "../../services/tmdb";

function MoviesPage({
  onToggleWatchlist,
  onToggleFavorite,
  watchlist,
  favorites,
}) {
  const navigate = useNavigate();

  const fetchPopular = useCallback(() => fetchPopularMovies(1), []);
  const fetchRecent = useCallback(() => fetchNowPlayingMovies(1), []);

  const { items, loading, error } = useFeaturedHeroMedia({
    fetchPopular,
    fetchRecent,
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
    </main>
  );
}

export default MoviesPage;
