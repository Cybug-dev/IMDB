import { useEffect, useState } from "react";
import SectionState from "../../components/Section State/SectionState";
import MovieCard from "./MovieCard";
import "./MoviesSection.scss";

function MoviesSection({
  title,
  fetchMovies,
  movies,
  loading = false,
  error = null,
  onRetry,
  limit = 12,
}) {
  const headingId = `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-heading`;
  const [sectionState, setSectionState] = useState({
    loading: true,
    error: null,
    movies: [],
  });

  const isControlled = movies !== undefined;

  useEffect(() => {
    if (isControlled || typeof fetchMovies !== "function") {
      return undefined;
    }

    let cancelled = false;

    fetchMovies(limit)
      .then((moviesResult) => {
        if (!cancelled) {
          setSectionState({
            loading: false,
            error: null,
            movies: moviesResult,
          });
        }
      })
      .catch((fetchError) => {
        if (!cancelled) {
          setSectionState({
            loading: false,
            error: fetchError.message || "Failed to load movies.",
            movies: [],
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [fetchMovies, limit, isControlled]);

  const currentState = isControlled
    ? { loading, error, movies }
    : sectionState;

  const hasMovies = currentState.movies?.length > 0;

  return (
    <section className="movies-section" aria-labelledby={headingId}>
      <header className="movies-section__header">
        <h2 id={headingId}>{title}</h2>
      </header>

      <SectionState
        loading={currentState.loading}
        error={currentState.error}
        data={currentState.movies}
        onRetry={onRetry}
      />

      {!currentState.loading && !currentState.error && hasMovies && (
        <div className="movies-section__list">
          {currentState.movies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      )}
    </section>
  );
}

export default MoviesSection;
