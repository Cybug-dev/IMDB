import { useCallback, useMemo } from "react";
import MovieCard from "../Movies/MovieCard";
import GenrePagination from "./GenrePagination";
import ScrollToTopButton from "./ScrollToTopButton";
import { useGenreMovies } from "./useGenreMovies";
import SectionState from "../../components/Section State/SectionState";
import "../Movies/MoviesSection.scss";
import "./GenrePage.scss";
function GenrePage({ genre, onNavigate }) {
  const { error, loading, movies, pagination } = useGenreMovies(genre);
  const genreName = genre?.name ?? "Genre";
  const hasData = movies.length > 0;
  const resultSummary = useMemo(() => {
    if (pagination.totalResults === 0) return "No Movies Found";
    return `${pagination.totalResults} ${genreName} movies found`;
  }, [pagination.totalResults, genreName]);

  const handlePageChange = useCallback(
    (nextPage) => {
      // 1. Early validation - prevent invalid page changes
      if (
        typeof nextPage !== "number" ||
        nextPage < 1 ||
        nextPage > (pagination?.totalPages ?? 0) ||
        nextPage === pagination?.page ||
        loading === true
      ) {
        return;
      }

      // 2. Update the page (core behavior - unchanged)
      pagination.setPage(nextPage);

      // 3. Smooth scroll to results section with safe fallback
      const resultsElement = document.getElementById("genre-results");
      if (resultsElement) {
        resultsElement.scrollIntoView({
          block: "start",
          behavior: "smooth",
        });
      }
    },
    [pagination, loading],
  ); // Keep original dependency style for compatibility

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
              Popular {genreName.toLowerCase()} movies to watch and add to your
              collection
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
          {(error || !hasData) && (
            <SectionState
              loading={loading}
              error={error}
              data={movies}
              loadingMessage={`Loading ${genreName.toLowerCase()} movies...`}
              emptyMessage={`There are no ${genreName.toLowerCase()} movies available right now.`}
              onRetry={handleRetry}
            />
          )}

          {hasData && (
            <div className="genre-page__list-wrap">
              {loading && (
                <SectionState
                  variant="inline"
                  className="genre-page__page-loading"
                  loading
                  data={movies}
                  loadingMessage={`Loading page ${pagination.page}...`}
                />
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
