import {
  hasCompleteMediaData,
  posterUrl,
  requestTMDB,
} from "../../queries/movieQueries";

export const HEADER_SEARCH_MIN_CHARS = 3;
export const HEADER_SEARCH_RESULT_LIMIT = 5;
export const SEARCH_HISTORY_LIMIT = 8;

const MEDIA_TYPE_LABELS = {
  movie: "Movie",
  tv: "TV",
};

const VALID_SEARCH_MEDIA_TYPES = new Set(["movie", "tv"]);
let genreMapsPromise;

export const normalizeSearchTerm = (value) =>
  value.trim().replace(/\s+/g, " ");

export const getHeaderSearchLookupTerm = (value) => {
  const normalizedValue = normalizeSearchTerm(value);

  if (normalizedValue.length < HEADER_SEARCH_MIN_CHARS) {
    return "";
  }

  return normalizedValue;
};

const getResultYear = (item) => {
  const date = item.release_date || item.first_air_date;

  return date ? date.slice(0, 4) : "";
};

export const getSearchResultPath = (result) => {
  if (!result?.id) return "/";

  return `/${result.mediaType}/${result.id}`;
};

const loadGenreMaps = async () => {
  if (!genreMapsPromise) {
    genreMapsPromise = Promise.all([
      requestTMDB("/genre/movie/list?language=en-US"),
      requestTMDB("/genre/tv/list?language=en-US"),
    ]).then(([movieGenres, tvGenres]) => ({
      movie: new Map((movieGenres.genres ?? []).map((genre) => [genre.id, genre.name])),
      tv: new Map((tvGenres.genres ?? []).map((genre) => [genre.id, genre.name])),
    }));
  }

  return genreMapsPromise;
};

export const normalizeSearchResult = (item, genreMaps = {}) => {
  const mediaType = item.media_type ?? "movie";
  const title = item.title || item.name || "Untitled";
  const year = getResultYear(item);
  const posterPath = item.poster_path || null;
  const primaryGenreId = item.genre_ids?.[0] ?? null;
  const primaryGenre = primaryGenreId
    ? genreMaps[mediaType]?.get(primaryGenreId) ?? null
    : null;
  const voteAverage =
    typeof item.vote_average === "number" ? item.vote_average : null;

  return {
    id: item.id,
    mediaType,
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
    posterPath,
    posterUrl: posterUrl(posterPath, "w92"),
    backdropPath: item.backdrop_path ?? null,
    backdropUrl: posterUrl(item.backdrop_path, "w300"),
    releaseDate: item.release_date ?? item.first_air_date ?? null,
    popularity: item.popularity ?? 0,
    voteAverage,
    ratingLabel: voteAverage === null ? "N/A" : voteAverage.toFixed(1),
    voteCount: item.vote_count ?? null,
    raw: item,
  };
};

const hasCompleteSearchResult = (result) =>
  Boolean(
    result?.id &&
      VALID_SEARCH_MEDIA_TYPES.has(result.mediaType) &&
      normalizeSearchTerm(result.title).length > 0 &&
      normalizeSearchTerm(result.overview).length > 0 &&
      result.posterPath &&
      result.releaseDate &&
      result.voteAverage > 0 &&
      result.primaryGenre,
  );

const uniqueResults = (items) => {
  const seen = new Set();

  return items.filter((item) => {
    const key = `${item.mediaType}-${item.id}`;

    if (!item.id || seen.has(key)) return false;

    seen.add(key);
    return true;
  });
};

const normalizeSearchResults = (items, genreMaps) =>
  uniqueResults(
    items
      .filter((item) => VALID_SEARCH_MEDIA_TYPES.has(item.media_type ?? "movie"))
      .filter(hasCompleteMediaData)
      .map((item) => normalizeSearchResult(item, genreMaps))
      .filter(hasCompleteSearchResult),
  );

export const fetchMultiSearch = async ({ query, page = 1, signal }) => {
  const normalizedQuery = normalizeSearchTerm(query);

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

export const fetchHeaderSuggestions = async (limit = 6) => {
  const [latestData, popularData, genreMaps] = await Promise.all([
    requestTMDB("/movie/now_playing?language=en-US&page=1"),
    requestTMDB("/movie/popular?language=en-US&page=1"),
    loadGenreMaps(),
  ]);

  const latest = Array.isArray(latestData.results) ? latestData.results : [];
  const popular = Array.isArray(popularData.results) ? popularData.results : [];
  const mergedMovies = [...latest, ...popular].map((movie) => ({
    ...movie,
    media_type: "movie",
  }));

  return normalizeSearchResults(mergedMovies, genreMaps).slice(0, limit);
};
