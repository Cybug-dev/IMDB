import { useQuery } from "@tanstack/react-query";
import { fetchMovies } from "../../services/tmdb";

const FOOTER_MOVIE_LIMIT = 8;

export const useFooterMovies = () =>
  useQuery({
    queryKey: ["footer-movies"],
    queryFn: async () => {
      const movies = await fetchMovies();

      return movies
        .filter((movie) => movie?.id && movie?.poster_path)
        .slice(0, FOOTER_MOVIE_LIMIT);
    },
    staleTime: 1000 * 60 * 5,
  });
