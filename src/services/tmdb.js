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
  if (!TOKEN) {
    throw new Error("TMDB API token is missing.");
  }

  const response = await fetch(`${BASE_URL}${path}`, options);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.status_message || "TMDB request failed.");
  }

  if (!Array.isArray(data.results)) {
    throw new Error("TMDB returned an unexpected response.");
  }

  return data.results;
};

export const fetchTrendingMovies = async () => {
  return readResults("/trending/movie/week");
};

export const fetchTopRated = async () => {
  return readResults("/movie/top_rated");
};
