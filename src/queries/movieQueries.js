import { useQuery } from "@tanstack/react-query";
import { queryClient } from "./queryClient";

const BASE_URL = "https://api.themoviedb.org/3";
const TOKEN = import.meta.env.VITE_API_TOKEN;
const DEFAULT_STALE_TIME = 1000 * 60 * 5;
const LONG_STALE_TIME = 1000 * 60 * 60;
const MOVIE_DETAIL_STALE_TIME = 1000 * 60 * 30;
export const GENRE_DISCOVER_PAGE_CAP = 5;

const HIGH_INTEREST_GENRE_IDS = new Set([28, 12, 878, 53, 80, 14]);
const HIGH_INTEREST_GENRES = "28|12|878|53|80|14";

const APP_REFRESH_SEED = Math.floor(Math.random() * 100000);
const randomPage = (maxPage = 10) => Math.floor(Math.random() * maxPage) + 1;
export const getSessionGenrePage = (
  genreId,
  maxPage = GENRE_DISCOVER_PAGE_CAP,
) => {
  const numericGenreId = Number(genreId) || 0;
  return ((numericGenreId * 37 + APP_REFRESH_SEED) % maxPage) + 1;
};
const today = () => new Date().toISOString().slice(0, 10);
const dateDaysAgo = (days) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().slice(0, 10);
};

export const posterUrl = (path, size = "w500") =>
  path ? `https://image.tmdb.org/t/p/${size}${path}` : null;

export const requestTMDB = async (path) => {
  if (!TOKEN) throw new Error("TMDB API token is missing.");

  const response = await fetch(`${BASE_URL}${path}`, {
    method: "GET",
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${TOKEN}`,
    },
  });
  const data = await response.json();

  if (!response.ok) {
    const error = new Error(data.status_message || "TMDB request failed.");
    error.status = response.status;
    throw error;
  }

  return data;
};

export const requestResults = async (path) => {
  const data = await requestTMDB(path);

  if (!Array.isArray(data.results)) {
    throw new Error("TMDB returned an unexpected response.");
  }

  return data.results;
};

const withMediaType = (items, mediaType) =>
  items.map((item) => ({
    ...item,
    media_type: item.media_type ?? mediaType,
  }));

const uniqueById = (items) => {
  const seen = new Set();

  return items.filter((item) => {
    const key = `${item.media_type ?? "movie"}-${item.id}`;

    if (seen.has(key)) return false;

    seen.add(key);
    return true;
  });
};

const hasRequiredMovieCardData = (movie) =>
  Boolean(
    movie?.id &&
      movie.poster_path &&
      (movie.title || movie.name) &&
      typeof movie.vote_average === "number" &&
      movie.vote_average > 0,
  );

const excludeMovieIds = (movies, excludeIds = []) => {
  const excluded = new Set(excludeIds.filter(Boolean));
  return movies.filter((movie) => movie?.id && !excluded.has(movie.id));
};

const prioritizeHighInterestMovies = (movies) =>
  [...movies].sort((a, b) => {
    const aHasPriorityGenre = a.genre_ids?.some((id) =>
      HIGH_INTEREST_GENRE_IDS.has(id),
    );
    const bHasPriorityGenre = b.genre_ids?.some((id) =>
      HIGH_INTEREST_GENRE_IDS.has(id),
    );

    if (aHasPriorityGenre !== bHasPriorityGenre) {
      return aHasPriorityGenre ? -1 : 1;
    }

    return (b.popularity ?? 0) - (a.popularity ?? 0);
  });

const normalizeMovieDetails = (movieDetails) => {
  const director = movieDetails.credits?.crew?.find(
    (person) => person.job === "Director",
  )?.name;

  return {
    ...movieDetails,
    director,
    cast: movieDetails.credits?.cast,
    genres: movieDetails.genres ?? [],
  };
};

export const movieQueryKeys = {
  all: ["tmdb"],
  rawData: (path) => [...movieQueryKeys.all, "data", path],
  rawResults: (path) => [...movieQueryKeys.all, "results", path],
  movieDetails: (movieId) => [...movieQueryKeys.all, "movie", String(movieId)],
  genreMoviePage: (genreId, page) => [
    ...movieQueryKeys.all,
    "genre",
    Number(genreId),
    Number(page),
  ],
  genreMovies: (genreId, page) => [
    ...movieQueryKeys.all,
    "genreMovies",
    Number(genreId),
    Number(page),
  ],
  genresWithImages: (limit, maxPosters) => [
    ...movieQueryKeys.all,
    "genresWithImages",
    limit,
    maxPosters,
  ],
  movies: () => [...movieQueryKeys.all, "movies"],
  homePageMovies: () => [...movieQueryKeys.all, "homePageMovies"],
  moviesPageSections: () => [...movieQueryKeys.all, "moviesPageSections"],
  movieCards: (section, limit, excludeIds) => [
    ...movieQueryKeys.all,
    "movieCards",
    section,
    limit,
    ...excludeIds,
  ],
  whatToWatch: (tabId) => [...movieQueryKeys.all, "whatToWatch", tabId],
  rankingEngine: () => [...movieQueryKeys.all, "rankingEngine"],
};

export const movieQueryOptions = {
  data: (path) => ({
    queryKey: movieQueryKeys.rawData(path),
    queryFn: () => requestTMDB(path),
    staleTime: DEFAULT_STALE_TIME,
  }),
  results: (path) => ({
    queryKey: movieQueryKeys.rawResults(path),
    queryFn: () => requestResults(path),
    staleTime: DEFAULT_STALE_TIME,
  }),
  movieDetails: (movieId) => ({
    queryKey: movieQueryKeys.movieDetails(movieId),
    queryFn: () => requestTMDB(`/movie/${movieId}?append_to_response=credits`),
    enabled: Boolean(movieId),
    staleTime: MOVIE_DETAIL_STALE_TIME,
  }),
  genreMoviePage: (genreId, page = 1) => ({
    queryKey: movieQueryKeys.genreMoviePage(genreId, page),
    queryFn: async () => {
      const data = await requestTMDB(
        `/discover/movie?with_genres=${genreId}&sort_by=popularity.desc&page=${page}`,
      );

      return {
        page: data.page ?? page,
        results: Array.isArray(data.results) ? data.results : [],
        totalPages: Math.min(GENRE_DISCOVER_PAGE_CAP, data.total_pages ?? 1),
        totalResults: data.total_results ?? 0,
      };
    },
    enabled: Boolean(genreId),
    staleTime: DEFAULT_STALE_TIME,
  }),
};

const readData = (path) => queryClient.fetchQuery(movieQueryOptions.data(path));
const readResults = (path) =>
  queryClient.fetchQuery(movieQueryOptions.results(path));

export const clearTMDBCache = (prefix = null) => {
  if (!prefix) {
    queryClient.clear();
    return;
  }

  queryClient.removeQueries({
    predicate: (query) => query.queryHash.includes(prefix),
  });
};

export const fetchTrendingMovies = (timeWindow = "day", page = randomPage()) =>
  readResults(`/trending/movie/${timeWindow}?page=${page}`);

export const fetchTopRated = (page = randomPage()) =>
  readResults(`/movie/top_rated?page=${page}`);

export const fetchPopularMovies = (page = randomPage()) =>
  readResults(`/movie/popular?page=${page}`);

export const fetchNowPlayingMovies = (page = randomPage()) =>
  readResults(`/movie/now_playing?page=${page}`);

export const fetchUpcomingMovies = (page = randomPage()) =>
  readResults(`/movie/upcoming?page=${page}`);

export const fetchGenresListOnly = async () => {
  const data = await readData("/genre/movie/list");
  return data.genres;
};

export const fetchMoviesByGenre = (genreId, page = randomPage()) =>
  readResults(
    `/discover/movie?with_genres=${genreId}&sort_by=popularity.desc&page=${page}`,
  );

export const fetchGenreMoviePage = (genreId, page = 1) =>
  queryClient.fetchQuery(movieQueryOptions.genreMoviePage(genreId, page));

const fallbackMoviePaths = [
  "/movie/popular",
  "/movie/now_playing",
  "/movie/upcoming",
  "/movie/top_rated",
];

const fetchRandomMovieFallback = async () => {
  const randomIndex = Math.floor(Math.random() * fallbackMoviePaths.length);
  const fallbackMovies = await readResults(
    `${fallbackMoviePaths[randomIndex]}?page=${randomPage()}`,
  );

  return withMediaType(fallbackMovies, "movie");
};

const buildMoviesDataset = async () => {
  const [trendingMovies, actionMovies] = await Promise.all([
    fetchTrendingMovies("day", randomPage()),
    fetchMoviesByGenre(28, randomPage()),
  ]);

  const results = uniqueById([
    ...withMediaType(trendingMovies, "movie"),
    ...withMediaType(actionMovies, "movie"),
  ]);

  return results.length > 0 ? results : fetchRandomMovieFallback();
};

export const fetchMovies = () =>
  queryClient.fetchQuery({
    queryKey: movieQueryKeys.movies(),
    queryFn: buildMoviesDataset,
    staleTime: DEFAULT_STALE_TIME,
  });

const buildWhatToWatchDataset = async (tabId) => {
  let results = [];

  if (tabId === "movie") {
    const [trendingMovies, actionMovies] = await Promise.all([
      fetchTrendingMovies("day", randomPage(3)),
      fetchMoviesByGenre(28, randomPage()),
    ]);

    results = uniqueById([
      ...withMediaType(trendingMovies, "movie"),
      ...withMediaType(actionMovies, "movie"),
    ]);
  } else if (tabId === "tv") {
    const [trendingTvShows, popularTvShows] = await Promise.all([
      readResults(`/trending/tv/day?page=${randomPage(3)}`),
      readResults(`/tv/popular?page=${randomPage()}`),
    ]);

    results = uniqueById([
      ...withMediaType(trendingTvShows, "tv"),
      ...withMediaType(popularTvShows, "tv"),
    ]);
  } else {
    const [mixedResults, popularMovies] = await Promise.all([
      readResults(`/trending/all/day?page=${randomPage()}`),
      fetchPopularMovies(randomPage()),
    ]);

    results = uniqueById([
      ...mixedResults.filter(
        (item) => item.media_type === "movie" || item.media_type === "tv",
      ),
      ...withMediaType(popularMovies, "movie"),
    ]);
  }

  return results.length > 0 ? results : fetchRandomMovieFallback();
};

export const fetchWhatToWatchDataset = (tabId) =>
  queryClient.fetchQuery({
    queryKey: movieQueryKeys.whatToWatch(tabId),
    queryFn: () => buildWhatToWatchDataset(tabId),
    staleTime: DEFAULT_STALE_TIME,
  });

const buildGenresWithImages = async (limit = 6, maxPosters = 5) => {
  const genres = await fetchGenresListOnly();
  const visibleGenres = genres.slice(0, limit);

  return Promise.all(
    visibleGenres.map(async (genre) => {
          const movies = await fetchMoviesByGenre(
            genre.id,
            getSessionGenrePage(genre.id),
          );
      const posters = movies
        .map((movie) => posterUrl(movie.poster_path))
        .filter(Boolean)
        .slice(0, maxPosters);

      return {
        id: genre.id,
        name: genre.name,
        slug: genre.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        posters,
      };
    }),
  );
};

export const fetchGenresWithImages = (limit = 6, maxPosters = 5) =>
  queryClient.fetchQuery({
    queryKey: movieQueryKeys.genresWithImages(limit, maxPosters),
    queryFn: () => buildGenresWithImages(limit, maxPosters),
    staleTime: LONG_STALE_TIME,
  });

export const fetchMovieDetails = (movieId) =>
  queryClient.fetchQuery(movieQueryOptions.movieDetails(movieId));

const getMovieCardDetails = async (movies, limit) => {
  const genres = await fetchGenresListOnly().catch(() => []);
  const genreMap = new Map(genres.map((genre) => [genre.id, genre.name]));

  return uniqueById(
    movies
      .filter(hasRequiredMovieCardData)
      .map((movie) => ({
        ...movie,
        genres:
          movie.genres ??
          (movie.genre_ids ?? []).map((id) => ({
            id,
            name: genreMap.get(id) ?? "Unknown",
          })),
      })),
  ).slice(0, limit);
};

const fetchFallbackMovieCardDataset = async (limit) => {
  const fallbackMovies = await fetchRandomMovieFallback();
  return getMovieCardDetails(fallbackMovies, limit);
};

const getMovieCardDataset = async (
  fetchSectionMovies,
  limit = 12,
  excludeIds = [],
) => {
  const sectionMovies = await fetchSectionMovies().catch(() => []);
  const movies = prioritizeHighInterestMovies(
    excludeMovieIds(sectionMovies, excludeIds),
  );
  const movieCards = await getMovieCardDetails(movies, limit);

  return movieCards.length > 0
    ? movieCards
    : fetchFallbackMovieCardDataset(limit);
};

const fetchMovieCardsQuery = (section, limit, excludeIds, queryFn) =>
  queryClient.fetchQuery({
    queryKey: movieQueryKeys.movieCards(section, limit, excludeIds),
    queryFn,
    staleTime: DEFAULT_STALE_TIME,
  });

export const getFallbackMovieCards = (limit) =>
  fetchFallbackMovieCardDataset(limit);

export const getNowShowing = (limit, excludeIds = []) =>
  fetchMovieCardsQuery("nowShowing", limit, excludeIds, () =>
    getMovieCardDataset(() => fetchNowPlayingMovies(randomPage()), limit, excludeIds),
  );

export const getLatestMovies = (limit, excludeIds = []) =>
  fetchMovieCardsQuery("latest", limit, excludeIds, () =>
    getMovieCardDataset(
      () =>
        readResults(
          `/discover/movie?primary_release_date.gte=${dateDaysAgo(
            120,
          )}&primary_release_date.lte=${today()}&sort_by=primary_release_date.desc&vote_count.gte=100&page=1`,
        ),
      limit,
      excludeIds,
    ),
  );

export const getUpcomingMovies = (limit, excludeIds = []) =>
  fetchMovieCardsQuery("upcoming", limit, excludeIds, () =>
    getMovieCardDataset(() => fetchUpcomingMovies(), limit, excludeIds),
  );

export const getPopularMovieCards = (limit, excludeIds = []) =>
  fetchMovieCardsQuery("popular", limit, excludeIds, () =>
    getMovieCardDataset(
      () =>
        readResults(
          `/discover/movie?with_genres=${HIGH_INTEREST_GENRES}&sort_by=popularity.desc&page=${randomPage()}`,
        ),
      limit,
      excludeIds,
    ),
  );

export const getTopRatedMovieCards = (limit, excludeIds = []) =>
  fetchMovieCardsQuery("topRated", limit, excludeIds, () =>
    getMovieCardDataset(
      () =>
        readResults(
          `/discover/movie?with_genres=${HIGH_INTEREST_GENRES}&vote_count.gte=500&sort_by=vote_average.desc&page=1`,
        ),
      limit,
      excludeIds,
    ),
  );

export const discoverRankingEngine = () =>
  queryClient.fetchQuery({
    queryKey: movieQueryKeys.rankingEngine(),
    queryFn: async () => {
      const [popularMovies, trendingMovies, topRated] = await Promise.all([
        readResults(`/movie/popular?page=${randomPage()}`),
        readResults(`/trending/movie/day?page=${randomPage(3)}`),
        readResults(`/movie/top_rated?page=${randomPage()}`),
      ]);
      const movies = [...popularMovies, ...trendingMovies, ...topRated];
      const uniqueMovies = Array.from(
        new Map(movies.map((movie) => [movie.id, movie])).values(),
      );
      const scoredMovies = uniqueMovies.map((movie) => ({
        ...movie,
        customScore:
          movie.vote_average * 2 +
          movie.popularity / 100 +
          movie.vote_count / 1000,
      }));

      return [...scoredMovies].sort((a, b) => b.customScore - a.customScore);
    },
    staleTime: DEFAULT_STALE_TIME,
  });

const enrichWithGenres = (movies, genreMap) =>
  movies.map((movie) => ({
    ...movie,
    genres: (movie.genre_ids ?? []).map((id) => ({
      id,
      name: genreMap.get(id) ?? "Unknown",
    })),
  }));

const enrichHomeMoviesWithDetails = async (movies) => {
  const detailedMovies = await Promise.allSettled(
    movies.map(async (movie) => {
      const details = await fetchMovieDetails(movie.id);
      const director = details.credits?.crew?.find(
        (person) => person.job === "Director",
      )?.name;

      return {
        ...movie,
        runtime: details.runtime,
        director,
      };
    }),
  );

  return detailedMovies.map((result, index) =>
    result.status === "fulfilled" ? result.value : movies[index],
  );
};

const buildHomePageMovies = async () => {
  const page = randomPage(5);
  const [
    trendingData,
    topRatedData,
    featuredData,
    heroData,
    topRankedData,
    genreList,
  ] = await Promise.all([
    fetchTrendingMovies("day"),
    fetchTopRated(),
    fetchPopularMovies(page),
    fetchTrendingMovies("week"),
    discoverRankingEngine(),
    fetchGenresListOnly(),
  ]);
  const genreMap = new Map(genreList.map((genre) => [genre.id, genre.name]));
  const enrichedTrending = enrichWithGenres(trendingData, genreMap).slice(0, 4);
  const enrichedTopRated = enrichWithGenres(topRatedData, genreMap).slice(0, 6);
  const enrichedFeatured = enrichWithGenres(featuredData, genreMap).slice(0, 3);
  const enrichedHero = enrichWithGenres(heroData, genreMap).slice(0, 5);
  const enrichedTopRanked = enrichWithGenres(topRankedData, genreMap).slice(0, 10);
  const [
    trending,
    topRated,
    featured,
    heroMovies,
    topRankedMovies,
  ] = await Promise.all([
    enrichHomeMoviesWithDetails(enrichedTrending),
    enrichHomeMoviesWithDetails(enrichedTopRated),
    enrichHomeMoviesWithDetails(enrichedFeatured),
    enrichHomeMoviesWithDetails(enrichedHero),
    enrichHomeMoviesWithDetails(enrichedTopRanked),
  ]);

  return {
    featured,
    heroMovies,
    topRankedMovies,
    topRated,
    trending,
  };
};

const buildMoviesPageSections = async () => {
  const collectedIds = new Set();
  const sectionErrors = {
    nowShowing: null,
    latest: null,
    upcoming: null,
    popular: null,
    topRated: null,
  };
  const sections = {
    latestMovies: [],
    nowShowingMovies: [],
    popularMovies: [],
    topRatedMovies: [],
    upcomingMovies: [],
  };

  const loadSection = async (key, errorKey, fetcher) => {
    try {
      const movies = await fetcher(12, [...collectedIds]);
      sections[key] = movies;
      movies.forEach((movie) => {
        if (movie?.id) collectedIds.add(movie.id);
      });
    } catch (loadError) {
      sectionErrors[errorKey] = loadError.message || "Failed to load movies.";
      sections[key] = [];
    }
  };

  await loadSection("nowShowingMovies", "nowShowing", getNowShowing);
  await loadSection("latestMovies", "latest", getLatestMovies);
  await loadSection("upcomingMovies", "upcoming", getUpcomingMovies);
  await loadSection("popularMovies", "popular", getPopularMovieCards);
  await loadSection("topRatedMovies", "topRated", getTopRatedMovieCards);

  return {
    ...sections,
    sectionErrors,
  };
};

export const useHomePageMovies = () =>
  useQuery({
    queryKey: movieQueryKeys.homePageMovies(),
    queryFn: buildHomePageMovies,
    staleTime: DEFAULT_STALE_TIME,
  });

export const useMoviesPageSections = () =>
  useQuery({
    queryKey: movieQueryKeys.moviesPageSections(),
    queryFn: buildMoviesPageSections,
    staleTime: DEFAULT_STALE_TIME,
  });

export const useWhatToWatchDataset = (tabId) =>
  useQuery({
    queryKey: movieQueryKeys.whatToWatch(tabId),
    queryFn: () => buildWhatToWatchDataset(tabId),
    staleTime: DEFAULT_STALE_TIME,
  });

export const useGenresWithImages = (limit = 6, maxPosters = 5) =>
  useQuery({
    queryKey: movieQueryKeys.genresWithImages(limit, maxPosters),
    queryFn: () => buildGenresWithImages(limit, maxPosters),
    staleTime: LONG_STALE_TIME,
  });

export const useMovieDetails = (movieId) =>
  useQuery({
    ...movieQueryOptions.movieDetails(movieId),
    select: normalizeMovieDetails,
  });
