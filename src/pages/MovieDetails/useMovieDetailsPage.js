import { useCallback, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMediaDetails } from "../../queries/movieQueries";
import { createMovieDetailsViewModel } from "./MovieDetailsViewModel";
import { getMovieKey } from "../../utils/movieCollections";

function useMovieDetailsPage({
  mediaType,
  onToggleWatchlist,
  onToggleFavorite,
  watchlist = [],
  favorites = [],
}) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isCastModalOpen, setIsCastModalOpen] = useState(false);
  const query = useMediaDetails(mediaType, id);

  const movie = useMemo(
    () => createMovieDetailsViewModel(query.data, mediaType),
    [mediaType, query.data],
  );

  const movieId = movie?.raw?.id;
  const isInWatchlist = Boolean(
    movieId && watchlist.some((item) => getMovieKey(item) === getMovieKey(movie.raw)),
  );
  const isInFavorites = Boolean(
    movieId && favorites.some((item) => getMovieKey(item) === getMovieKey(movie.raw)),
  );

  const toggleWatchlist = useCallback(() => {
    if (movie?.raw) onToggleWatchlist?.(movie.raw);
  }, [movie, onToggleWatchlist]);

  const toggleFavorite = useCallback(() => {
    if (movie?.raw) onToggleFavorite?.(movie.raw);
  }, [movie, onToggleFavorite]);

  const openTitle = useCallback(
    (title) => {
      if (!title?.id) return;

      navigate((title.mediaType === "tv" ? "/tv/" : "/movie/") + title.id);
    },
    [navigate],
  );

  const goBack = useCallback(() => {
    if (window.history.state?.idx > 0) {
      navigate(-1);
      return;
    }

    navigate("/movies");
  }, [navigate]);

  return {
    id,
    movie,
    error: query.error?.message ?? null,
    isLoading: Boolean(id && query.isPending),
    isInWatchlist,
    isInFavorites,
    isCastModalOpen,
    onBack: goBack,
    onToggleWatchlist: toggleWatchlist,
    onToggleFavorite: toggleFavorite,
    onOpenCast: () => setIsCastModalOpen(true),
    onCloseCast: () => setIsCastModalOpen(false),
    onOpenTitle: openTitle,
    retry: query.refetch,
  };
}

export default useMovieDetailsPage;
