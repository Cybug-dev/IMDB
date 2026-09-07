import { useCallback, useEffect, useRef, useState } from "react";
import { COLLECTIONS_STORAGE_KEY, parseCollections, toggleMovie } from "../utils/movieCollections";
import { showCollectionToast } from "../utils/collectionToast";

function useStoredMovieCollections() {
  const [collections, setCollections] = useState(() => {
    try {
      return parseCollections(window.localStorage.getItem(COLLECTIONS_STORAGE_KEY));
    } catch {
      return parseCollections(null);
    }
  });
  const current = useRef(collections);

  const commit = useCallback((next) => {
    current.current = next;
    setCollections(next);
    try {
      window.localStorage.setItem(COLLECTIONS_STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Private mode or a full storage quota must not prevent in-session toggles.
    }
  }, []);

  useEffect(() => {
    const sync = (event) => {
      if (event.storageArea !== window.localStorage ||
          (event.key !== COLLECTIONS_STORAGE_KEY && event.key !== null)) return;
      const next = parseCollections(event.newValue);
      current.current = next;
      setCollections(next);
    };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);

  const toggle = useCallback((collection, movie) => {
    const previous = current.current[collection];
    const next = toggleMovie(previous, movie);
    if (next === previous) return;
    commit({ ...current.current, [collection]: next });
    showCollectionToast({
      movie,
      type: collection === "favorites" ? "favorite" : "watchlist",
      action: next.length < previous.length ? "removed" : "added",
    });
  }, [commit]);

  const onToggleWatchlist = useCallback((movie) => toggle("watchlist", movie), [toggle]);
  const onToggleFavorite = useCallback((movie) => toggle("favorites", movie), [toggle]);
  const onClearCollection = useCallback((type) => {
    if (type === "watchlist" || type === "favorites") commit({ ...current.current, [type]: [] });
  }, [commit]);

  return { ...collections, onToggleWatchlist, onToggleFavorite, onClearCollection };
}

export default useStoredMovieCollections;
