import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useCallback, useMemo, useState } from "react";
import {
  fetchGenreMoviePage,
  fetchMovieDetails,
  GENRE_DISCOVER_PAGE_CAP,
  getSessionGenrePage,
  movieQueryKeys,
} from "../../queries/movieQueries";

const MOVIES_PER_PAGE = 12;
const TMDB_PAGE_SIZE = 20;
const MAX_CONCURRENT_ENRICH = 6;

const createConcurrentLimiter = (limit = MAX_CONCURRENT_ENRICH) => {
  let running = 0;
  const queue = [];

  return async (task) => {
    if (running >= limit) {
      await new Promise((resolve) => queue.push(resolve));
    }

    running += 1;

    try {
      return await task();
    } finally {
      running -= 1;
      queue.shift()?.();
    }
  };
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
    endApiPage: Math.min(
      GENRE_DISCOVER_PAGE_CAP,
      Math.floor(endIndex / TMDB_PAGE_SIZE) + 1,
    ),
  };
};

const loadGenreMovies = async (genre, page) => {
  const { startIndex, startApiPage, endApiPage } = getApiPagesForUiPage(page);
  const sessionStartPage = getSessionGenrePage(genre.id);
  const apiPages = [];
  const toSessionPage = (apiPage) =>
    ((sessionStartPage - 1 + apiPage - 1) % GENRE_DISCOVER_PAGE_CAP) + 1;

  for (let apiPage = startApiPage; apiPage <= endApiPage; apiPage += 1) {
    apiPages.push(fetchGenreMoviePage(genre.id, toSessionPage(apiPage)));
  }

  const pageResponses = await Promise.all(apiPages);
  const allResults = pageResponses.flatMap((response) => response?.results || []);
  const firstResponse = pageResponses[0] ?? {};
  const pageOffset = startIndex % TMDB_PAGE_SIZE;
  const pageResults = allResults
    .slice(pageOffset, pageOffset + MOVIES_PER_PAGE)
    .filter((movie) => movie?.id && movie.poster_path);

  const detailedResults = await Promise.all(
    pageResults.map((movie) => enrichWithLimit(() => enrichMovie(movie, genre))),
  );
  const cappedResultCount = Math.min(
    firstResponse.totalResults ?? detailedResults.length,
    Math.min(firstResponse.totalPages ?? 1, GENRE_DISCOVER_PAGE_CAP) *
      TMDB_PAGE_SIZE,
  );

  return {
    movies: detailedResults,
    totalPages: Math.max(1, Math.ceil(cappedResultCount / MOVIES_PER_PAGE)),
    totalResults: cappedResultCount,
  };
};

export function useGenreMovies(genre) {
  const genreId = genre?.id ?? null;
  const [paginationState, setPaginationState] = useState({
    genreId: null,
    page: 1,
  });
  const page = paginationState.genreId === genreId ? paginationState.page : 1;
  const setPage = useCallback(
    (nextPage) => {
      setPaginationState({
        genreId,
        page: nextPage,
      });
    },
    [genreId],
  );

  const query = useQuery({
    queryKey: movieQueryKeys.genreMovies(genreId, page),
    queryFn: () => loadGenreMovies(genre, page),
    enabled: Boolean(genreId),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 5,
  });

  const { refetch } = query;
  const reload = useCallback(() => {
    refetch();
  }, [refetch]);

  const pagination = useMemo(
    () => ({
      canGoNext: page < (query.data?.totalPages ?? 1),
      canGoPrevious: page > 1,
      page,
      reload,
      setPage,
      totalPages: query.data?.totalPages ?? 1,
      totalResults: query.data?.totalResults ?? 0,
    }),
    [page, query.data?.totalPages, query.data?.totalResults, reload, setPage],
  );

  return {
    error: query.error?.message ?? null,
    loading: query.isPending || query.isFetching,
    movies: query.data?.movies ?? [],
    pagination,
  };
}
