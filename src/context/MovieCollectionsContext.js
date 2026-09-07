import { createContext, useContext } from "react";
import { getMovieKey } from "../utils/movieCollections";

export const MovieCollectionsContext = createContext(null);

export function useMovieActions(movie) {
  const collections = useContext(MovieCollectionsContext);
  if (!collections) throw new Error("Movie actions require MovieCollectionsContext");
  const key = getMovieKey(movie);
  return {
    onToggleWatchlist: collections.onToggleWatchlist,
    onToggleFavorite: collections.onToggleFavorite,
    isInWatchlist: collections.watchlist.some((item) => getMovieKey(item) === key),
    isInFavorites: collections.favorites.some((item) => getMovieKey(item) === key),
  };
}
