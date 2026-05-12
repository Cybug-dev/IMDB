import { useEffect, useState } from "react";
import { fetchMoviesByGenre } from "../../services/tmdb";
import MovieCard from "../Home/MovieCard";

function GenrePage({
  genre,
  onNavigate,
  onToggleWatchlist,
  onToggleFavorite,
  watchlist,
  favorites,
}) {
  const [requestState, setRequestState] = useState({
    genreId: null,
    movies: [],
    error: null,
  });

  useEffect(() => {
    if (!genre?.id) {
      return;
    }

    let cancelled = false;

    fetchMoviesByGenre(genre.id)
      .then((genreMovies) => {
        if (!cancelled) {
          setRequestState({
            genreId: genre.id,
            error: null,
            movies: genreMovies.map((movie) => ({
              ...movie,
              genres: [{ id: genre.id, name: genre.name }],
            })),
          });
        }
      })
      .catch((loadError) => {
        if (!cancelled) {
          setRequestState({
            genreId: genre.id,
            movies: [],
            error: loadError.message || "Failed to load genre movies.",
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [genre]);

  if (!genre?.id) return <div className="page-error">Genre not found.</div>;
  const isLoading = requestState.genreId !== genre.id && !requestState.error;
  const movies = requestState.movies;
  const error = requestState.error;

  if (isLoading) return <div className="page-loading">Loading...</div>;
  if (error) return <div className="page-error">{error}</div>;

  return (
    <main className="collection-page">
      <div className="collection-page__inner">
        <div className="collection-page__topbar">
          <div>
            <h1 className="collection-page__heading">{genre.name}</h1>
            <p className="collection-page__subtitle">
              Popular {genre.name.toLowerCase()} movies to watch and add to your collection
            </p>
          </div>

          <button
            type="button"
            className="collection-clear"
            onClick={() => onNavigate("home")}
          >
            Back home
          </button>
        </div>

        <div className="featured-movies__grid">
          {movies.slice(0, 12).map((movie) => (
            <MovieCard
              key={movie.id}
              movie={movie}
              onToggleWatchlist={onToggleWatchlist}
              onToggleFavorite={onToggleFavorite}
              isInWatchlist={watchlist.some((item) => item.id === movie.id)}
              isInFavorites={favorites.some((item) => item.id === movie.id)}
            />
          ))}
        </div>
      </div>
    </main>
  );
}

export default GenrePage;
