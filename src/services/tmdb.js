const BASE_URL = "https://api.themoviedb.org/3";
const TOKEN = import.meta.env.VITE_API_TOKEN;

const options = {
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization: `Bearer ${TOKEN}`,
  },
};

const readResults = async (path) => {
  if (!TOKEN) throw new Error("TMDB API token is missing.");
  const response = await fetch(`${BASE_URL}${path}`, options);
  const data = await response.json();
  if (!response.ok)
    throw new Error(data.status_message || "TMDB request failed.");
  if (!Array.isArray(data.results))
    throw new Error("TMDB returned an unexpected response.");

  return data.results;
};

const readData = async (path) => {
  if (!TOKEN) throw new Error("TMDB API token is missing.");
  const response = await fetch(`${BASE_URL}${path}`, options);
  const data = await response.json();
  if (!response.ok)
    throw new Error(data.status_message || "TMDB request failed.");
  return data;
};

const randomPage = (maxPage = 10) => Math.floor(Math.random() * maxPage) + 1;

export const fetchTrendingMovies = async (timeWindow = "day", page = randomPage() ) => {
  return readResults(`/trending/movie/${timeWindow}?page=${page}`);
};
export const fetchTopRated = async (page = randomPage()) => {
  return readResults(`/movie/top_rated?page=${page}`);
};
export const fetchPopularMovies = async (page = randomPage()) => {
  return readResults(`/movie/popular?page=${page}`);
};
export const fetchNowPlayingMovies = async (page = randomPage()) => {
  return readResults(`/movie/now_playing?page=${page}`);
};
export const fetchUpcomingMovies = async (page = randomPage()) => {
  return readResults(`/movie/upcoming?page=${page}`);
};
export const fetchGenresListOnly = async () => {
  const data = await readData("/genre/movie/list");
  return data.genres;
};

const posterUrl = (path, size = "w500") =>
  path ? `https://image.tmdb.org/t/p/${size}${path}` : null;

const withMediaType = (items, mediaType) =>
  items.map((item) => ({
    ...item,
    media_type: item.media_type ?? mediaType,
  }));

const uniqueById = (items) => {
  const seen = new Set();

  return items.filter((item) => {
    const key = `${item.media_type ?? "movie"}-${item.id}`;

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
};

export const fetchMoviesByGenre = async (genreId, page = randomPage()) => {
  return readResults(
    `/discover/movie?with_genres=${genreId}&sort_by=popularity.desc&page=${page}`,
  );
};

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

export const fetchMovies = async () => {
  let results = [];

    const [trendingMovies, actionMovies] = await Promise.all([
      fetchTrendingMovies("day", randomPage()),
      fetchMoviesByGenre(28, randomPage()),
    ]);

    results = uniqueById([
      ...withMediaType(trendingMovies, "movie"),
      ...withMediaType(actionMovies, "movie"),
    ])

 if (results.length > 0) {
    return results;
  }

  return fetchRandomMovieFallback();
}

export const fetchWhatToWatchDataset = async (tabId) => {
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

  if (results.length > 0) {
    return results;
  }

  return fetchRandomMovieFallback();
};

export const fetchGenresWithImages = async (limit = 6, maxPosters = 5) => {
  const genres = await fetchGenresListOnly();
  const visibleGenres = genres.slice(0, limit);

  const genresWithImages = await Promise.all(
    visibleGenres.map(async (genre) => {
      const movies = await fetchMoviesByGenre(genre.id);
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

  return genresWithImages;
};
export const fetchMovieDetails = async (movieId) => {
  return readData(`/movie/${movieId}?append_to_response=credits`);
};

const HIGH_INTEREST_GENRE_IDS = new Set([28, 12, 878, 53, 80, 14]);
const HIGH_INTEREST_GENRES = "28|12|878|53|80|14";

const today = () => new Date().toISOString().slice(0, 10);
const dateDaysAgo = (days) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().slice(0, 10);
};

const hasRequiredMovieCardData = (movie) =>
  Boolean(
    movie?.id &&
      movie.poster_path &&
      (movie.title || movie.name) &&
      typeof movie.vote_average === "number" &&
      movie.vote_average > 0 &&
      typeof movie.runtime === "number" &&
      movie.runtime > 0,
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

const getMovieCardDetails = async (movies, limit) => {
  const detailResults = await Promise.allSettled(
    movies.slice(0, limit * 2).map((movie) => fetchMovieDetails(movie.id)),
  );

  return uniqueById(
    detailResults
      .filter((result) => result.status === "fulfilled")
      .map((result) => result.value)
      .filter(hasRequiredMovieCardData),
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

  if (movieCards.length > 0) {
    return movieCards;
  }

  return fetchFallbackMovieCardDataset(limit);
};

export const getFallbackMovieCards = async (limit) =>
  fetchFallbackMovieCardDataset(limit);

export const getNowShowing = (limit, excludeIds = []) =>
  getMovieCardDataset(() => fetchNowPlayingMovies(1), limit, excludeIds);

export const getLatestMovies = (limit, excludeIds = []) =>
  getMovieCardDataset(
    () =>
      readResults(
        `/discover/movie?primary_release_date.gte=${dateDaysAgo(
          120,
        )}&primary_release_date.lte=${today()}&sort_by=primary_release_date.desc&vote_count.gte=100&page=1`,
      ),
    limit,
    excludeIds,
  );

export const getUpcomingMovies = (limit, excludeIds = []) =>
  getMovieCardDataset(() => fetchUpcomingMovies(1), limit, excludeIds);

export const getPopularMovieCards = (limit, excludeIds = []) =>
  getMovieCardDataset(
    () =>
      readResults(
        `/discover/movie?with_genres=${HIGH_INTEREST_GENRES}&sort_by=popularity.desc&page=1`,
      ),
    limit,
    excludeIds,
  );

export const getTopRatedMovieCards = (limit, excludeIds = []) =>
  getMovieCardDataset(
    () =>
      readResults(
        `/discover/movie?with_genres=${HIGH_INTEREST_GENRES}&vote_count.gte=500&sort_by=vote_average.desc&page=1`,
      ),
    limit,
    excludeIds,
  );

export async function discoverRankingEngine() {
  const fetchPopularMovies = async (page = 1) => {
    return readResults(`/movie/popular?page=${page}`);
  };
  const fetchTrendingMovies = async (timeWindow = "day", page = 1) => {
    return readResults(`/trending/movie/${timeWindow}?page=${page}`);
  };
  const fetchTopRated = async (page = randomPage()) => {
    return readResults(`/movie/top_rated?page=${page}`);
  };

  const [fetchPopularMoviesCopied, fetchTrendingMoviesCopied, fetchTopRatedCopied] =
    await Promise.all([
      fetchPopularMovies(randomPage()),
      fetchTrendingMovies("day", randomPage(3)),
      fetchTopRated(randomPage()),
    ]);

  const MoviesTypes = [
    ...fetchPopularMoviesCopied,
    ...fetchTrendingMoviesCopied,
    ...fetchTopRatedCopied,
  ];

  const uniqueMovies = Array.from(
    new Map(MoviesTypes?.map((movie) => [movie.id, movie])).values()
  );

  const scoredMovies = uniqueMovies.map((movie) => ({
    ...movie,
    customScore:
      movie.vote_average * 2 + movie.popularity / 100 + movie.vote_count / 1000,   
  }));


  return [...scoredMovies].sort((a, b) => b.customScore - a.customScore);
}
