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

export const fetchTrendingMovies = async () => {
  return readResults("/trending/movie/week");
};
export const fetchTopRated = async () => {
  return readResults("/movie/top_rated");
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

export const fetchMoviesByGenre = async (genreId) => {
  return readResults(
    `/discover/movie?with_genres=${genreId}&sort_by=popularity.desc`,
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
  const fallbackMovies = await readResults(fallbackMoviePaths[randomIndex]);

  return withMediaType(fallbackMovies, "movie");
};

export const fetchWhatToWatchDataset = async (tabId) => {
  let results = [];

  if (tabId === "movie") {
    const [trendingMovies, actionMovies] = await Promise.all([
      fetchTrendingMovies(),
      fetchMoviesByGenre(28),
    ]);

    results = uniqueById([
      ...withMediaType(trendingMovies, "movie"),
      ...withMediaType(actionMovies, "movie"),
    ]);
  } else if (tabId === "tv") {
    const tvShows = await readResults("/trending/tv/week");
    results = withMediaType(tvShows, "tv");
  } else {
    const mixedResults = await readResults("/trending/all/week");
    results = mixedResults.filter(
      (item) => item.media_type === "movie" || item.media_type === "tv",
    );
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
