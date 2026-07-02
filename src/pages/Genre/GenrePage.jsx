import { useCallback, useMemo } from "react";
import MovieCard from "../Movies/MovieCard";
import GenrePagination from "./GenrePagination";
import ScrollToTopButton from "./ScrollToTopButton";
import { useGenreMovies } from "./useGenreMovies";
import "../Movies/MoviesSection.scss";
import "./GenrePage.scss";

function GenrePage({
  genre,
  onNavigate,
}) {
  const { error, loading, movies, pagination } = useGenreMovies(genre);
  const genreName = genre?.name ?? "Genre";
  const hasData = movies.length > 0;
  const resultSummary = useMemo(() => {
    if (pagination.totalResults === 0) return "No Movies Found";
     return `${pagination.totalResults} ${genreName} movies found`;
  }, [pagination.totalResults, genreName]);

  const handlePageChange = useCallback(
    (nextPage) => {
    if (
      nextPage < 1 ||
      nextPage > pagination.totalPages ||
      nextPage === pagination.page ||
      loading
     ) {
      return;
     }

    pagination.setPage(nextPage);
    document.getElementById("genre-results")?.scrollIntoView({ block: "start", behavior: "smooth" });
    }, [pagination, loading]
  );

const handleRetry = useCallback(() => {
  pagination.reload();
}, [pagination]);

if (!genre?.id) return <div className="page-error">Genre not found.</div>;

  return (
              <main className="genre-page">
      <div className="genre-page__inner">
        <div className="genre-page__topbar">
          <div>
            <h1 className="genre-page__heading">{genreName}</h1>
            <p className="genre-page__subtitle">
              Popular {genreName.toLowerCase()} movies to watch and add to your collection
            </p>
          </div>

          <button
            type="button"
            className="genre-page__back-button"
            onClick={() => onNavigate("home")}
          >
            Back home
          </button>
        </div>

              <div className="genre-page__count" aria-live="polite">
          <span>{resultSummary}</span>
          {pagination.totalPages > 1 && (
            <>
              <span className="genre-page__count-dot" aria-hidden="true">
                -
              </span>
              <span>
                Page {pagination.page} of {pagination.totalPages}
              </span>
            </>
          )}
        </div>

        <section
          id="genre-results"
          className="genre-page__results"
          aria-label={`${genreName} movie results`}
          aria-busy={loading}
        >
          {loading && !hasData && (
            <div className="genre-page__state" role="status" aria-live="polite">
              <span className="genre-page__spinner" aria-hidden="true" />
              <p>Loading {genreName.toLowerCase()} movies...</p>
            </div>
          )}

          {!loading && error && (
            <div className="genre-page__state" role="alert">
              <h2>Unable to load movies</h2>
              <p>{error}</p>
              <button
                type="button"
                className="genre-page__state-action"
                onClick={handleRetry}
              >
                Retry
              </button>
            </div>
          )}

          {!loading && !error && !hasData && (
            <div className="genre-page__state">
              <h2>No movies found</h2>
              <p>There are no {genreName.toLowerCase()} movies available right now.</p>
            </div>
          )}

          {hasData && (
            <div className="genre-page__list-wrap">
              {loading && (
                <div className="genre-page__page-loading" role="status" aria-live="polite">
                  <span className="genre-page__spinner" aria-hidden="true" />
                  <span>Loading page {pagination.page}...</span>
                </div>
              )}

              <div className="movies-section__list genre-page__list">
                {movies.map((movie) => (
                  <MovieCard key={movie.id} movie={movie} />
                ))}
              </div>
            </div>
          )}
        </section>

        {!error && hasData && (
          <div className="genre-page__footer">
            <GenrePagination
              canGoNext={pagination.canGoNext}
              canGoPrevious={pagination.canGoPrevious}
              currentPage={pagination.page}
              disabled={loading}
              onPageChange={handlePageChange}
              totalPages={pagination.totalPages}
            />
          </div>
        )}

        <ScrollToTopButton />
      
      </div>
    </main>
  );
}

export default GenrePage;
