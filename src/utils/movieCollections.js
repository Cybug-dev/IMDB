export const COLLECTIONS_STORAGE_KEY = "imdb.movie-collections.v1";

export const getMediaType = (movie) =>
  movie?.media_type || movie?.mediaType || (movie?.first_air_date ? "tv" : "movie");

export const getMovieKey = (movie) => `${getMediaType(movie)}:${movie?.id}`;
export const getMoviePath = (movie) => `/${getMediaType(movie)}/${movie.id}`;

// Store card metadata only, not the large credits/reviews payload from details.
const snapshot = (movie) => {
  if (!movie || !Number.isSafeInteger(Number(movie.id)) || Number(movie.id) <= 0 ||
      !["movie", "tv"].includes(getMediaType(movie))) return null;
  const fields = ["title", "name", "poster_path", "backdrop_path", "release_date",
    "first_air_date", "vote_average", "vote_count", "overview", "genre_ids",
    "genres", "runtime", "episode_run_time", "popularity", "director"];
  return {
    ...Object.fromEntries(fields.filter((key) => movie[key] !== undefined).map((key) => [key, movie[key]])),
    id: Number(movie.id),
    media_type: getMediaType(movie),
  };
};

export const parseCollections = (value) => {
  try {
    const parsed = JSON.parse(value);
    const sanitize = (items) => [...new Map(
      (Array.isArray(items) ? items : []).map(snapshot).filter(Boolean)
        .map((movie) => [getMovieKey(movie), movie]),
    ).values()];
    return { watchlist: sanitize(parsed?.watchlist), favorites: sanitize(parsed?.favorites) };
  } catch {
    return { watchlist: [], favorites: [] };
  }
};

export const toggleMovie = (items, movie) => {
  const item = snapshot(movie);
  if (!item) return items;
  const key = getMovieKey(item);
  return items.some((entry) => getMovieKey(entry) === key)
    ? items.filter((entry) => getMovieKey(entry) !== key)
    : [...items, item];
};
