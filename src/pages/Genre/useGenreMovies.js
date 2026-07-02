import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchGenreMoviePage, fetchMovieDetails } from "../../services/tmdb";

const MOVIES_PER_PAGE = 12;
const TMDB_PAGE_SIZE = 20;

const enrichMovie = async (movie, fallbackGenre) => {
  try {
    const details = await fetchMovieDetails(movie.id);

    return {
      ...movie,
      ...details,
      genres:
        details.genres?.length > 0
          ? details.genres
          : [{ id: fallbackGenre.id, name: fallbackGenre.name }],
    };
  } catch {
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

  useEffect(() => {
    setPage(1);
  }, [genre?.id]);

  useEffect(() => {
    if (!genre?.id) {
      return undefined;
    }

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
        const allResults = pageResponses.flatMap((response) => response.results);
        const firstResponse = pageResponses[0] ?? {};
        const pageOffset = startIndex % TMDB_PAGE_SIZE;
        const pageResults = allResults
          .slice(pageOffset, pageOffset + MOVIES_PER_PAGE)
          .filter((movie) => movie?.id && movie.poster_path);

        const detailedResults = await Promise.all(
          pageResults.map((movie) => enrichMovie(movie, genre)),
        );

        if (cancelled) return;

        const cappedResultCount = Math.min(
          firstResponse.totalResults ?? detailedResults.length,
          (firstResponse.totalPages ?? 1) * TMDB_PAGE_SIZE,
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
          error: loadError.message || "Failed to load genre movies.",
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
    [page, reload, state.totalPages, state.totalResults],
  );

  return {
    ...state,
    pagination,
  };
}
