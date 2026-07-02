/**
 * ============================================================================
 * TMDB API SERVICE LAYER
 * ============================================================================
 * Centralizes every network call this app makes to The Movie Database (TMDB).
 *
 * Responsibilities:
 *  - Attaches the auth token (from env) to every request
 *  - In-memory caching (5 min TTL) to avoid redundant network calls
 *  - Retries transient failures (network errors / 5xx) with exponential backoff
 *  - Normalizes payloads (tags media_type, de-duplicates by id)
 *  - Builds ready-to-render "movie card" datasets for UI sections
 *    (Now Showing, Top Rated, Popular, Upcoming, Latest, etc.)
 *
 * IMPORTANT NOTES (read before modifying):
 *  - The cache is a plain in-memory Map -> it resets on every page reload
 *    and is NOT shared across browser tabs.
 *  - VITE_API_TOKEN must exist in .env, otherwise every call throws
 *    "TMDB API token is missing."
 *  - Many fetchers default to a randomPage() -> results are intentionally
 *    non-deterministic across renders/reloads (good for variety, but means
 *    you'll get different movies every refresh; keep this in mind when
 *    debugging "why did the list change").
 * ============================================================================
 */

const BASE_URL = "https://api.themoviedb.org/3";
const TOKEN = import.meta.env.VITE_API_TOKEN;

// In-memory cache
// Keyed by "results:<path>" or "data:<path>" (see readResults / readData below).
// NOTE: the two prefixes mean the SAME path fetched via readResults() and
// readData() will be cached under two separate keys, not shared.
const cache = new Map();
const CACHE_TTL = 1000 * 60 * 5; // 5 minutes

const options = {
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization: `Bearer ${TOKEN}`,
  },
};

// ==================== UTILITY FUNCTIONS ====================

/**
 * Retry helper with exponential backoff.
 *
 * @param {() => Promise<any>} fn        - async function to attempt
 * @param {number} maxRetries            - max retry attempts (default 2, so 3 total tries)
 * @returns {Promise<any>} the resolved value of fn()
 * @throws  the last error if all retries are exhausted
 *
 * IMPORTANT:
 *  - Only retries on network failures (TypeError, e.g. fetch failing outright)
 *    or server errors (error.status >= 500). Client errors (4xx, like a bad
 *    query param or 401) are re-thrown immediately WITHOUT retrying, since
 *    retrying a bad request just wastes time/quota.
 *  - Backoff delay: 300ms * 2^attempt, capped at 2000ms.
 */
const withRetry = async (fn, maxRetries = 2) => {
  let lastError;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (attempt === maxRetries) break;

      // Only retry on network or server errors
      if (error.name === "TypeError" || (error.status && error.status >= 500)) {
        const delay = Math.min(300 * Math.pow(2, attempt), 2000);
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }
      throw error; // Don't retry client errors (4xx)
    }
  }
  throw lastError;
};

/**
 * Clears the in-memory cache, entirely or by key prefix.
 * @param {string|null} prefix - e.g. "results:/movie/popular" to clear a subset;
 *                                omit/null to wipe everything.
 *
 * Exported so components can force-refresh stale data (e.g. after the user
 * performs an action that should invalidate a cached list).
 */
export const clearTMDBCache = (prefix = null) => {
  if (!prefix) {
    cache.clear();
    return;
  }
  for (const key of cache.keys()) {
    if (key.startsWith(prefix)) {
      cache.delete(key);
    }
  }
};

// ==================== CORE FETCH HELPERS ====================

/**
 * Fetches a TMDB endpoint that returns a paginated `{ results: [...] }` shape,
 * with caching + retry baked in.
 *
 * @param {string} path - TMDB path + querystring, e.g. "/movie/popular?page=1"
 * @returns {Promise<Array>} the `results` array from the response
 * @throws if TOKEN is missing, the request fails, or `results` isn't an array
 *
 * IMPORTANT: this will NOT work on TMDB endpoints that don't return a
 * `results` array (e.g. a single movie object) — use readData() for those.
 */
const readResults = async (path) => {
  if (!TOKEN) throw new Error("TMDB API token is missing.");

  const cacheKey = `results:${path}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  const fetchFn = async () => {
    const response = await fetch(`${BASE_URL}${path}`, options);
    const data = await response.json();

    if (!response.ok)
      throw new Error(data.status_message || "TMDB request failed.");

    if (!Array.isArray(data.results))
      throw new Error("TMDB returned an unexpected response.");

    return data.results;
  };

  const results = await withRetry(fetchFn);
  cache.set(cacheKey, { data: results, timestamp: Date.now() });
  return results;
};

/**
 * Fetches a TMDB endpoint and returns the raw JSON body (no `results` shape
 * assumption) — use for single-resource endpoints like movie details or the
 * genres list.
 *
 * @param {string} path - TMDB path + querystring
 * @returns {Promise<object>} the full parsed JSON response
 * @throws if TOKEN is missing or the request fails
 */
const readData = async (path) => {
  if (!TOKEN) throw new Error("TMDB API token is missing.");

  const cacheKey = `data:${path}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  const fetchFn = async () => {
    const response = await fetch(`${BASE_URL}${path}`, options);
    const data = await response.json();

    if (!response.ok)
      throw new Error(data.status_message || "TMDB request failed.");

    return data;
  };

  const data = await withRetry(fetchFn);
  cache.set(cacheKey, { data, timestamp: Date.now() });
  return data;
};

// ==================== OTHER UTILITIES ====================

/** Picks a random page number between 1 and maxPage (inclusive). Used to
 *  add variety to "trending/popular" style lists on each load. */
const randomPage = (maxPage = 10) => Math.floor(Math.random() * maxPage) + 1;

/** Builds a full TMDB image CDN URL from a poster/backdrop path.
 *  @returns {string|null} null if `path` is falsy — callers MUST handle this
 *  (e.g. render a placeholder) rather than assume a URL always exists. */
const posterUrl = (path, size = "w500") =>
  path ? `https://image.tmdb.org/t/p/${size}${path}` : null;

/** Tags every item with a `media_type` if it doesn't already have one.
 *  Uses `??` so an existing media_type (e.g. from a /trending/all endpoint,
 *  which already includes it) is preserved rather than overwritten. */
const withMediaType = (items, mediaType) =>
  items.map((item) => ({
    ...item,
    media_type: item.media_type ?? mediaType,
  }));

/** De-duplicates a mixed movie/TV list by a composite "media_type-id" key.
 *  IMPORTANT: defaults media_type to "movie" if missing — so a TV show and
 *  a movie that happen to share an id would only collide if one is missing
 *  its media_type. */
const uniqueById = (items) => {
  const seen = new Set();
  return items.filter((item) => {
    const key = `${item.media_type ?? "movie"}-${item.id}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

// ==================== PUBLIC API FUNCTIONS (unchanged logic) ====================

/** Trending movies for a time window ("day" | "week"), random page by default. */
export const fetchTrendingMovies = async (
  timeWindow = "day",
  page = randomPage()
) => readResults(`/trending/movie/${timeWindow}?page=${page}`);

/** Top-rated movies (TMDB's own ranking), random page by default. */
export const fetchTopRated = async (page = randomPage()) =>
  readResults(`/movie/top_rated?page=${page}`);

/** Currently popular movies, random page by default. */
export const fetchPopularMovies = async (page = randomPage()) =>
  readResults(`/movie/popular?page=${page}`);

/** Movies currently in theaters, random page by default. */
export const fetchNowPlayingMovies = async (page = randomPage()) =>
  readResults(`/movie/now_playing?page=${page}`);

/** Movies with upcoming release dates, random page by default. */
export const fetchUpcomingMovies = async (page = randomPage()) =>
  readResults(`/movie/upcoming?page=${page}`);

/** Full list of TMDB movie genres (id + name pairs), used to build genre nav/cards. */
export const fetchGenresListOnly = async () => {
  const data = await readData("/genre/movie/list");
  return data.genres;
};

/** Movies belonging to a single genre id, sorted by popularity desc. */
export const fetchMoviesByGenre = async (genreId, page = randomPage()) =>
  readResults(
    `/discover/movie?with_genres=${genreId}&sort_by=popularity.desc&page=${page}`
  );

/**
 * Paginated genre browse (used by a dedicated "genre page" view, unlike
 * fetchMoviesByGenre which just grabs one random page).
 *
 * IMPORTANT: totalPages is hard-capped at 5 via Math.min(5, ...) regardless
 * of how many pages TMDB actually has — intentional limit to avoid deep,
 * mostly-irrelevant pagination, but worth remembering if "page 6" ever
 * seems to disappear unexpectedly.
 */
export const fetchGenreMoviePage = async (genreId, page = 1) => {
  const data = await readData(
    `/discover/movie?with_genres=${genreId}&sort_by=popularity.desc&page=${page}`
  );

  return {
    page: data.page ?? page,
    results: Array.isArray(data.results) ? data.results : [],
    totalPages: Math.min(5, data.total_pages ?? 1),
    totalResults: data.total_results ?? 0,
  };
};

const fallbackMoviePaths = [
  "/movie/popular",
  "/movie/now_playing",
  "/movie/upcoming",
  "/movie/top_rated",
];

/**
 * Last-resort fetcher used when a "real" query comes back empty (e.g. a
 * niche genre/date filter yields zero results). Picks ONE random endpoint
 * from fallbackMoviePaths so the UI never shows a totally blank section.
 *
 * IMPORTANT: this is a generic fallback — it has no relation to whatever
 * the original query was asking for (genre, date range, etc.), so the
 * movies shown may be tonally unrelated to the section they appear in.
 */
const fetchRandomMovieFallback = async () => {
  const randomIndex = Math.floor(Math.random() * fallbackMoviePaths.length);
  const fallbackMovies = await readResults(
    `${fallbackMoviePaths[randomIndex]}?page=${randomPage()}`
  );
  return withMediaType(fallbackMovies, "movie");
};

/**
 * Home-page style dataset: merges "trending today" with "trending action
 * movies", de-duplicated. Falls back to fetchRandomMovieFallback() if the
 * merge somehow yields nothing.
 */
export const fetchMovies = async () => {
  let results = [];

  const [trendingMovies, actionMovies] = await Promise.all([
    fetchTrendingMovies("day", randomPage()),
    fetchMoviesByGenre(28, randomPage()),
  ]);

  results = uniqueById([
    ...withMediaType(trendingMovies, "movie"),
    ...withMediaType(actionMovies, "movie"),
  ]);

  if (results.length > 0) return results;
  return fetchRandomMovieFallback();
};

/**
 * Powers a "What to Watch" tabbed section. Behavior branches on `tabId`:
 *  - "movie": trending-day movies + action-genre movies
 *  - "tv":    trending-day TV + popular TV
 *  - default: mixed trending (movies+TV only — filtered to exclude "person"
 *             results that /trending/all can return) + popular movies
 *
 * Falls back to fetchRandomMovieFallback() if the branch yields nothing.
 */
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
      // /trending/all can include media_type "person" — explicitly excluded
      ...mixedResults.filter(
        (item) => item.media_type === "movie" || item.media_type === "tv"
      ),
      ...withMediaType(popularMovies, "movie"),
    ]);
  }

  if (results.length > 0) return results;
  return fetchRandomMovieFallback();
};

/**
 * Builds genre "cards" for a genre browsing UI: takes the first `limit`
 * genres and, for each, fetches a page of movies to pull poster thumbnails.
 *
 * IMPORTANT (perf): this issues one extra API call PER genre (N+1 pattern).
 * With the default limit=6 that's 6 parallel /discover/movie calls — fine
 * at this scale, but don't casually bump `limit` way up without considering
 * rate limits / load time.
 *
 * @param {number} limit      - how many genres to build cards for (default 6)
 * @param {number} maxPosters - how many poster thumbnails per genre (default 5)
 */
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
    })
  );

  return genresWithImages;
};

/** Full movie details (single movie) with cast/crew credits appended in one call. */
export const fetchMovieDetails = async (movieId) => {
  return readData(`/movie/${movieId}?append_to_response=credits`);
};

// Genre ids treated as "high interest" for prioritization/sorting purposes
// (Action, Adventure, Sci-Fi, Thriller, Crime, Fantasy).
const HIGH_INTEREST_GENRE_IDS = new Set([28, 12, 878, 53, 80, 14]);
// Same ids, pipe-joined for TMDB's `with_genres` query param.
// NOTE: "|" means OR in TMDB's discover API (any of these genres),
// whereas a comma would mean AND (all of these genres) — don't swap them.
const HIGH_INTEREST_GENRES = "28|12|878|53|80|14";

const today = () => new Date().toISOString().slice(0, 10);
const dateDaysAgo = (days) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().slice(0, 10);
};

/**
 * Gatekeeper for whether a movie has enough data to render a MovieCard
 * (poster, title, a real rating, a real runtime).
 *
 * IMPORTANT: this is a STRICT filter. Movies missing runtime or vote data
 * (common for very new or obscure releases) are silently dropped. Combined
 * with the slice(limit * 2) in getMovieCardDetails below, this means the
 * final card count can end up LOWER than the requested `limit` if too many
 * candidates fail this check.
 */
const hasRequiredMovieCardData = (movie) =>
  Boolean(
    movie?.id &&
      movie.poster_path &&
      (movie.title || movie.name) &&
      typeof movie.vote_average === "number" &&
      movie.vote_average > 0 &&
      typeof movie.runtime === "number" &&
      movie.runtime > 0
  );

/** Removes movies whose id is in `excludeIds` — used to avoid showing the
 *  same movie twice across different sections on the same page. */
const excludeMovieIds = (movies, excludeIds = []) => {
  const excluded = new Set(excludeIds.filter(Boolean));
  return movies.filter((movie) => movie?.id && !excluded.has(movie.id));
};

/** Sorts movies so "high interest" genres (see HIGH_INTEREST_GENRE_IDS)
 *  bubble to the top; within each group, sorts by popularity desc. */
const prioritizeHighInterestMovies = (movies) =>
  [...movies].sort((a, b) => {
    const aHasPriorityGenre = a.genre_ids?.some((id) =>
      HIGH_INTEREST_GENRE_IDS.has(id)
    );
    const bHasPriorityGenre = b.genre_ids?.some((id) =>
      HIGH_INTEREST_GENRE_IDS.has(id)
    );

    if (aHasPriorityGenre !== bHasPriorityGenre) {
      return aHasPriorityGenre ? -1 : 1;
    }
    return (b.popularity ?? 0) - (a.popularity ?? 0);
  });

/**
 * Takes a list of movie summaries and hydrates them into full MovieCard-ready
 * detail objects.
 *
 * IMPORTANT (perf + reliability):
 *  - Fetches full details for up to `limit * 2` candidates (extra buffer
 *    to compensate for ones that get filtered out below), each via its own
 *    fetchMovieDetails() call — i.e. up to 2x `limit` additional API calls.
 *  - Uses Promise.allSettled so ONE failed detail fetch doesn't reject the
 *    whole batch — failures are just filtered out.
 *  - Final list is de-duplicated, filtered by hasRequiredMovieCardData,
 *    then truncated to `limit`. As noted above, the result can still come
 *    back shorter than `limit` if too many candidates lack required data.
 */
const getMovieCardDetails = async (movies, limit) => {
  const detailResults = await Promise.allSettled(
    movies.slice(0, limit * 2).map((movie) => fetchMovieDetails(movie.id))
  );

  return uniqueById(
    detailResults
      .filter((result) => result.status === "fulfilled")
      .map((result) => result.value)
      .filter(hasRequiredMovieCardData)
  ).slice(0, limit);
};

/** Fallback dataset (generic popular/trending/etc.) hydrated into full
 *  MovieCard details — used when a section's real query yields nothing. */
const fetchFallbackMovieCardDataset = async (limit) => {
  const fallbackMovies = await fetchRandomMovieFallback();
  return getMovieCardDetails(fallbackMovies, limit);
};

/**
 * Shared pipeline behind every `get*MovieCards`/`get*Movies` export below:
 *   1. fetch the section's raw movie list (swallows errors -> [] rather
 *      than throwing, so one broken section doesn't crash the page)
 *   2. exclude ids already shown elsewhere on the page
 *   3. prioritize "high interest" genres
 *   4. hydrate into full MovieCard detail objects
 *   5. if that yields zero cards, fall back to generic fallback data
 *
 * @param {() => Promise<Array>} fetchSectionMovies - the section-specific query
 * @param {number} limit       - max cards to return (default 12)
 * @param {Array}  excludeIds  - ids to skip (avoid duplicate cards across sections)
 */
const getMovieCardDataset = async (
  fetchSectionMovies,
  limit = 12,
  excludeIds = []
) => {
  const sectionMovies = await fetchSectionMovies().catch(() => []);
  const movies = prioritizeHighInterestMovies(
    excludeMovieIds(sectionMovies, excludeIds)
  );
  const movieCards = await getMovieCardDetails(movies, limit);

  if (movieCards.length > 0) return movieCards;
  return fetchFallbackMovieCardDataset(limit);
};

/** Public wrapper to get generic fallback movie cards directly, if a
 *  component ever needs the fallback dataset on its own. */
export const getFallbackMovieCards = async (limit) =>
  fetchFallbackMovieCardDataset(limit);

/** "Now Showing" section: movies currently in theaters. */
export const getNowShowing = (limit, excludeIds = []) =>
  getMovieCardDataset(() => fetchNowPlayingMovies(randomPage()), limit, excludeIds);

/**
 * "Latest" section: movies released in the last 120 days, sorted by most
 * recent release date, requiring at least 100 votes (filters out obscure/
 * unreleased-in-practice titles that would otherwise clutter "latest").
 */
export const getLatestMovies = (limit, excludeIds = []) =>
  getMovieCardDataset(
    () =>
      readResults(
        `/discover/movie?primary_release_date.gte=${dateDaysAgo(
          120
        )}&primary_release_date.lte=${today()}&sort_by=primary_release_date.desc&vote_count.gte=100&page=1`
      ),
    limit,
    excludeIds
  );

/** "Upcoming" section: movies with future release dates. */
export const getUpcomingMovies = (limit, excludeIds = []) =>
  getMovieCardDataset(() => fetchUpcomingMovies(), limit, excludeIds);

/** "Popular" section: movies in the high-interest genres, sorted by popularity. */
export const getPopularMovieCards = (limit, excludeIds = []) =>
  getMovieCardDataset(
    () =>
      readResults(
        `/discover/movie?with_genres=${HIGH_INTEREST_GENRES}&sort_by=popularity.desc&page=${randomPage()}`
      ),
    limit,
    excludeIds
  );

/**
 * "Top Rated" section: high-interest genre movies with at least 500 votes,
 * sorted by rating desc.
 *
 * NOTE: unlike most other sections, this always uses page=1 (no randomPage())
 * — intentional, since "top rated" should be a stable/deterministic ranking
 * rather than shuffled on every load.
 */
export const getTopRatedMovieCards = (limit, excludeIds = []) =>
  getMovieCardDataset(
    () =>
      readResults(
        `/discover/movie?with_genres=${HIGH_INTEREST_GENRES}&vote_count.gte=500&sort_by=vote_average.desc&page=1`
      ),
    limit,
    excludeIds
  );

/**
 * Builds a custom "best of the best" ranking by blending three TMDB lists
 * (popular, trending, top rated) and scoring each unique movie with a
 * weighted formula.
 *
 * Score formula: vote_average * 2 + popularity / 100 + vote_count / 1000
 *   - vote_average is weighted heaviest (x2, and it's on a 0–10 scale)
 *   - popularity and vote_count are divided down since they're on much
 *     larger, unbounded scales — these divisors are tuned by feel, not a
 *     formal formula, so adjust them here if the ranking ever "feels off"
 *     (e.g. a low-rated but hyper-popular movie outranking a beloved one).
 *
 * NOTE: de-dupes by `movie.id` only (not media_type) — safe here since all
 * three source lists are movie-only endpoints.
 *
 * @returns {Promise<Array>} movies sorted by customScore, descending
 */
export async function discoverRankingEngine() {
  const [popularMovies, trendingMovies, topRated] = await Promise.all([
    readResults(`/movie/popular?page=${randomPage()}`),
    readResults(`/trending/movie/day?page=${randomPage(3)}`),
    readResults(`/movie/top_rated?page=${randomPage()}`),
  ]);

  const MoviesTypes = [...popularMovies, ...trendingMovies, ...topRated];

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