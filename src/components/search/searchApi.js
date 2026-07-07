import { posterUrl, requestTMDB } from "../../queries/movieQueries";

export const HEADER_SEARCH_MIN_CHARS = 4;
export const HEADER_SEARCH_MAX_FETCH_CHARS = 5;
export const HEADER_SEARCH_RESULT_LIMIT = 5;
export const SEARCH_HISTORY_LIMIT = 8;

const MEDIA_TYPE_LABELS = {
  movie: "Movie",
  person: "Person",
  tv: "TV",
};

export const normalizeSearchTerm = (value) =>
  value.trim().replace(/\s+/g, " ");

export const getHeaderSearchLookupTerm = (value) => {
  const normalizedValue = normalizeSearchTerm(value);

  if (normalizedValue.length < HEADER_SEARCH_MIN_CHARS) {
    return "";
  }

  // Header suggestions are intentionally capped at the first 4-5 typed chars
  // to avoid firing a new request for every longer query refinement.
  return normalizedValue.slice(0, HEADER_SEARCH_MAX_FETCH_CHARS);
};

const getKnownForText = (knownFor = []) =>
  knownFor
    .map((item) => item.title || item.name)
    .filter(Boolean)
    .slice(0, 2)
    .join(", ");

const getResultYear = (item) => {
  const date = item.release_date || item.first_air_date;

  return date ? date.slice(0, 4) : "";
};

export const getSearchResultPath = (result) => {
  if (!result?.id) return "/";

  const paths = {
    movie: `/movie/${result.id}`,
    person: `/person/${result.id}`,
    tv: `/tv/${result.id}`,
  };

  return paths[result.mediaType] ?? "/";
};

export const normalizeSearchResult = (item) => {
  const mediaType = item.media_type ?? "movie";
  const title = item.title || item.name || "Untitled";
  const year = getResultYear(item);
  const knownForText = mediaType === "person" ? getKnownForText(item.known_for) : "";
  const posterPath = item.poster_path || item.profile_path || null;

  return {
    id: item.id,
    mediaType,
    mediaTypeLabel: MEDIA_TYPE_LABELS[mediaType] ?? "Result",
    title,
    subtitle:
      knownForText ||
      year ||
      item.known_for_department ||
      item.original_title ||
      item.original_name ||
      "",
    overview: item.overview ?? "",
    posterPath,
    posterUrl: posterUrl(posterPath, "w92"),
    backdropPath: item.backdrop_path ?? null,
    backdropUrl: posterUrl(item.backdrop_path, "w300"),
    releaseDate: item.release_date ?? item.first_air_date ?? null,
    popularity: item.popularity ?? 0,
    voteAverage: item.vote_average ?? null,
    voteCount: item.vote_count ?? null,
    knownForDepartment: item.known_for_department ?? null,
    raw: item,
  };
};

const uniqueResults = (items) => {
  const seen = new Set();

  return items.filter((item) => {
    const key = `${item.mediaType}-${item.id}`;

    if (!item.id || seen.has(key)) return false;

    seen.add(key);
    return true;
  });
};

const normalizeSearchResults = (items) =>
  uniqueResults(
    items
      .filter((item) => ["movie", "person", "tv"].includes(item.media_type ?? "movie"))
      .map(normalizeSearchResult),
  );

export const fetchMultiSearch = async ({ query, page = 1 }) => {
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
  const data = await requestTMDB(`/search/multi?${params.toString()}`);

  return {
    page: data.page ?? page,
    results: normalizeSearchResults(Array.isArray(data.results) ? data.results : []),
    totalPages: data.total_pages ?? 0,
    totalResults: data.total_results ?? 0,
  };
};

export const fetchHeaderSuggestions = async (limit = 6) => {
  const [latestData, popularData] = await Promise.all([
    requestTMDB("/movie/now_playing?language=en-US&page=1"),
    requestTMDB("/movie/popular?language=en-US&page=1"),
  ]);

  const latest = Array.isArray(latestData.results) ? latestData.results : [];
  const popular = Array.isArray(popularData.results) ? popularData.results : [];
  const mergedMovies = [...latest, ...popular].map((movie) => ({
    ...movie,
    media_type: "movie",
  }));

  return normalizeSearchResults(mergedMovies).slice(0, limit);
};
