import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchGenreMoviePage, fetchMovieDetails } from "../../services/tmdb";

const MOVIES_PER_PAGE = 12;
const TMDB_PAGE_SIZE = 10;
const MAX_CONCURRENT_ENRICH = 6; // Adjust this if needed (4-8 is reasonable)

// Helper to limit concurrent enrich operations
const createConcurrentLimiter = (limit = MAX_CONCURRENT_ENRICH) => {
  let running = 0;
  const queue = [];

  const run = async (task) => {
    if (running >= limit) {
      await new Promise((resolve) => queue.push(resolve));
    }
    running++;
    try {
      return await task();
    } finally {
      running--;
      if (queue.length > 0) {
        const next = queue.shift();
        next();
      }
    }
  };

  return run;
};

const enrichWithLimit = createConcurrentLimiter();

const enrichMovie = async (movie, fallbackGenre) => {
  if (!movie?.id || !fallbackGenre?.id || !fallbackGenre?.name) {
    return movie;
  }

  try {
    const details = await fetchMovieDetails(movie.id);

    return {
      ...movie,
      ...details,
      genres:
        details?.genres?.length > 0
          ? details.genres
          : [{ id: fallbackGenre.id, name: fallbackGenre.name }],
    };
  } catch (error) {
    console.warn(`Failed to enrich movie ${movie.id}:`, error);

    return {
      ...movie,
      runtime: movie.runtime ?? null,
      genres: [{ id: fallbackGenre.id, name: fallbackGenre.name }],
    };
  }
};

const getApiPagesForUiPage = (page) => {
  const startIndex = (page - 1) * MOVIES_PER_PAGE;
  const endIndex = startIndex + MOVIES_PER_PAGE - 1;

  return {
    startIndex,
    startApiPage: Math.floor(startIndex / TMDB_PAGE_SIZE) + 1,
    endApiPage: Math.floor(endIndex / TMDB_PAGE_SIZE) + 1,
  };
};

export function useGenreMovies(genre) {
  const [page, setPage] = useState(1);
  const [refreshKey, setRefreshKey] = useState(0);

  const [state, setState] = useState({
    error: null,
    loading: true,
    movies: [],
    totalPages: 1,
    totalResults: 0,
  });

  // Reset page when genre changes
  useEffect(() => {
    setPage(1);
  }, [genre?.id]);

  useEffect(() => {
    if (!genre?.id) return undefined;

    let cancelled = false;

    const { startIndex, startApiPage, endApiPage } = getApiPagesForUiPage(page);

    setState((prev) => ({
      ...prev,
      error: null,
      loading: true,
    }));

    const loadMovies = async () => {
      try {
        const apiPages = [];

        for (let apiPage = startApiPage; apiPage <= endApiPage; apiPage += 1) {
          apiPages.push(fetchGenreMoviePage(genre.id, apiPage));
        }

        const pageResponses = await Promise.all(apiPages);
        const allResults = pageResponses.flatMap((response) => response?.results || []);

        const firstResponse = pageResponses[0] ?? {};
        const pageOffset = startIndex % TMDB_PAGE_SIZE;

        const pageResults = allResults
          .slice(pageOffset, pageOffset + MOVIES_PER_PAGE)
          .filter((movie) => movie?.id && movie.poster_path);

        // Enrich with controlled concurrency
        const detailedResults = await Promise.all(
          pageResults.map((movie) =>
            enrichWithLimit(() => enrichMovie(movie, genre))
          )
        );

        if (cancelled) return;

        const cappedResultCount = Math.min(
          firstResponse.totalResults ?? detailedResults.length,
          (firstResponse.totalPages ?? 1) * TMDB_PAGE_SIZE
        );

        setState({
          error: null,
          loading: false,
          movies: detailedResults,
          totalPages: Math.max(1, Math.ceil(cappedResultCount / MOVIES_PER_PAGE)),
          totalResults: cappedResultCount,
        });
      } catch (loadError) {
        if (cancelled) return;

        setState((prev) => ({
          ...prev,
          error: loadError?.message || "Failed to load genre movies.",
          loading: false,
          movies: [],
        }));
      }
    };

    loadMovies();

    return () => {
      cancelled = true;
    };
  }, [genre, page, refreshKey]);

  const reload = useCallback(() => {
    setRefreshKey((key) => key + 1);
  }, []);

  const pagination = useMemo(
    () => ({
      canGoNext: page < state.totalPages,
      canGoPrevious: page > 1,
      page,
      reload,
      setPage,
      totalPages: state.totalPages,
      totalResults: state.totalResults,
    }),
    [page, reload, state.totalPages, state.totalResults]
  );

  return {
    ...state,
    pagination,
  };
}