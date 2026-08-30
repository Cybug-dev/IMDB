import MovieDetailsContent from "./MovieDetailsContent";
import MovieDetailsState from "./MovieDetailsState";
import useMovieDetailsPage from "./useMovieDetailsPage";
import "./MovieDetails.scss";

function MovieDetailsPage({
  mediaType = "movie",
  onToggleWatchlist,
  onToggleFavorite,
  watchlist,
  favorites,
}) {
  const page = useMovieDetailsPage({
    mediaType,
    onToggleWatchlist,
    onToggleFavorite,
    watchlist,
    favorites,
  });

  if (!page.id) {
    return (
      <MovieDetailsState
        type="empty"
        title="Movie ID not found"
        message="Choose a movie to view its details."
      />
    );
  }

  if (page.isLoading) {
    return <MovieDetailsState type="loading" />;
  }

  if (page.error) {
    return (
      <MovieDetailsState
        type="error"
        message={page.error}
        onRetry={page.retry}
      />
    );
  }

  if (!page.movie) {
    return (
      <MovieDetailsState
        type="empty"
        title="Movie not found"
        message="This title is not available right now."
      />
    );
  }

  return <MovieDetailsContent {...page} />;
}

export default MovieDetailsPage;
