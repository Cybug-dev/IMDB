import { hasCompleteMediaData, posterUrl, requestTMDB } from "../../queries/movieQueries";

// Search configuration constants
export const HEADER_SEARCH_MIN_CHARS = 3;      // Minimum characters needed to trigger search
export const HEADER_SEARCH_RESULT_LIMIT = 5;  // Max results displayed in header dropdown
export const SEARCH_HISTORY_LIMIT = 8;        // Maximum items kept in search history

// Display labels for media types
const MEDIA_TYPE_LABELS = {
  movie: "Movie",
  tv: "TV",
};

const VALID_SEARCH_MEDIA_TYPES = new Set(["movie", "tv"]); // Whitelist of searchable media types

let genreMapsPromise; // Shared promise cache for genre mappings (prevents duplicate API calls)

// Normalizes user search input by trimming and collapsing whitespace
export const normalizeSearchTerm = (value) =>
  value.trim().replace(/\s+/g, " ");

// Prepares search term for header lookup (returns empty if too short)
export const getHeaderSearchLookupTerm = (value) => {
  const normalizedValue = normalizeSearchTerm(value); // Cleaned search string

  if (normalizedValue.length < HEADER_SEARCH_MIN_CHARS) {
    return "";
  }

  return normalizedValue;
};

// Extracts 4-digit year from release or first air date
const getResultYear = (item) => {
  const date = item.release_date || item.first_air_date; // Prefer movie then TV date
  return date ? date.slice(0, 4) : "";
};

// Generates client-side route path for a search result
export const getSearchResultPath = (result) => {
  if (!result?.id) return "/";
  return `/${result.mediaType}/${result.id}`;
};

// Loads genre maps for movies and TV from TMDB (cached via promise)
const loadGenreMaps = async () => {
    genreMapsPromise = Promise.all([
      requestTMDB("/genre/movie/list?language=en-US"),
      requestTMDB("/genre/tv/list?language=en-US"),
    ]).then(([movieGenres, tvGenres]) => ({
      movie: new Map((movieGenres.genres ?? []).map((genre) => [genre.id, genre.name])),
      tv: new Map((tvGenres.genres ?? []).map((genre) => [genre.id, genre.name])),
    }))
    .catch((err) => {
      genreMapsPromise = null; // Allow retry on failure
      throw err;
    });

  return genreMapsPromise;
};

// Core function: transforms raw TMDB result into clean, UI-ready object
export const normalizeSearchResult = (item, genreMaps = {}) => {
  const mediaType = item.media_type ?? "movie";           // Default to movie
  const title = item.title || item.name || "Untitled";   // Handle movie vs TV naming
  const year = getResultYear(item);
  const posterPath = item.poster_path || null;           // Important for image display
  const primaryGenreId = item.genre_ids?.[0] ?? null;    // First genre only
  const primaryGenre = primaryGenreId
    ? genreMaps[mediaType]?.get(primaryGenreId) ?? null
    : null;
  const voteAverage = typeof item.vote_average === "number" ? item.vote_average : null;

  return {
    id: item.id,
    mediaType,                    // Critical for routing & filtering
    mediaTypeLabel: MEDIA_TYPE_LABELS[mediaType] ?? "Result",
    title,
    subtitle:
      primaryGenre ||
      year ||
      item.original_title ||
      item.original_name ||
      "",
    primaryGenre,
    overview: item.overview ?? "",
    posterPath,                   // Used for poster image URL
    posterUrl: posterUrl(posterPath, "w92"),   // Small poster size
    backdropPath: item.backdrop_path ?? null,
    backdropUrl: posterUrl(item.backdrop_path, "w300"), // Very small backdrop
    releaseDate: item.release_date ?? item.first_air_date ?? null,
    popularity: item.popularity ?? 0,
    voteAverage,                  // Rating value (major display metric)
    ratingLabel: voteAverage === null ? "N/A" : voteAverage.toFixed(1),
    voteCount: item.vote_count ?? null,
    raw: item,                    // Original data for debugging / extra fields
  };
};

// Validates whether a normalized result is complete enough to show
const hasCompleteSearchResult = (result) => Boolean(
  result?.id &&
  VALID_SEARCH_MEDIA_TYPES.has(result.mediaType) &&
  normalizeSearchTerm(result.title).length > 0 &&
  normalizeSearchTerm(result.overview).length > 0 &&
  result.posterPath &&
  result.releaseDate &&
  result.voteAverage > 0 &&
  result.primaryGenre,
);

// Deduplicates results using mediaType + id as composite key
const uniqueResults = (items) => {
  const seen = new Set(); // Track already processed items

  return items.filter((item) => {
    const key = `${item.mediaType}-${item.id}`; // Unique identifier
    if (!item.id || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

// Full results processing pipeline: filter → normalize → dedupe → validate
const normalizeSearchResults = (items, genreMaps) =>
  uniqueResults(
    items
      .filter((item) => VALID_SEARCH_MEDIA_TYPES.has(item.media_type ?? "movie"))
      .filter(hasCompleteMediaData)                    // External completeness check
      .map((item) => normalizeSearchResult(item, genreMaps))
      .filter(hasCompleteSearchResult),
  );

// Main search function: queries TMDB /search/multi and normalizes results
export const fetchMultiSearch = async ({ query, page = 1, signal }) => {
  const normalizedQuery = normalizeSearchTerm(query); // Clean input

  if (!normalizedQuery) {
return {
      page,
      results: [],
      totalPages: 0,
      totalResults: 0,
    };
  }

  const params = new URLSearchParams({
    include_adult: "false",
    language: "en-US",
    page: String(page),
    query: normalizedQuery,
  });

  const [data, genreMaps] = await Promise.all([
    requestTMDB(`/search/multi?${params.toString()}`, { signal }),
    loadGenreMaps(),
  ]);

  return {
    page: data.page ?? page,
    results: normalizeSearchResults(
      Array.isArray(data.results) ? data.results : [],
      genreMaps,
    ),
    totalPages: data.total_pages ?? 0,
    totalResults: data.total_results ?? 0,
  };
};

// Loads combined suggestions for header (now playing + popular movies)
export const fetchHeaderSuggestions = async (limit = 6) => {
  // Always reset genre cache before fetching suggestions to prevent stale data
  genreMapsPromise = null;

  // 1. Pick a random page (e.g., between 1 and 5) so the movies actually change
  const randomPageLatest = Math.floor(Math.random() * 5) + 1;
  const randomPagePopular = Math.floor(Math.random() * 5) + 1;

  // 2. Create a unique timestamp to force the browser/network to bypass cached responses
  const cacheBuster = `&_ts=${Date.now()}`;

  const [latestData, popularData, genreMaps] = await Promise.all([
    requestTMDB(`/movie/now_playing?language=en-US&page=${randomPageLatest}${cacheBuster}`),
    requestTMDB(`/movie/popular?language=en-US&page=${randomPagePopular}${cacheBuster}`),
    loadGenreMaps(),
  ]);

  const latest = Array.isArray(latestData.results) ? latestData.results : [];
  const popular = Array.isArray(popularData.results) ? popularData.results : [];
  
  // 3. Merge and randomly shuffle the results so the display order is never identical
  const mergedMovies = [...latest, ...popular]
    .map((movie) => ({
      ...movie,
      media_type: "movie",
    }))
    .sort(() => Math.random() - 0.5); 

  return normalizeSearchResults(mergedMovies, genreMaps).slice(0, limit);
};