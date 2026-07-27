import { useState } from "react";
import { useParams } from "react-router-dom";
import { useMediaDetails } from "../../queries/movieQueries";
import MovieHeroSection from "./MovieHeroSection";
import CastSection from "./CastSection";
import CastModal from "./CastModal";

function MovieDetailsPage({
  mediaType = "movie",
  onToggleWatchlist,
  onToggleFavorite,
  watchlist,
  favorites,
}) {
  const { id } = useParams();
  const [isCastModalOpen, setIsCastModalOpen] = useState(false);
  const { data: movie, error, isPending, refetch } = useMediaDetails(mediaType, id);
  const isLoading = Boolean(isPending);
  const currentError = error?.message ?? null;
  const hasData = Boolean(movie);

  if (!id) return <div className="page-error">Movie ID not found.</div>;

  return (
    <div className="movie-details-page">
      {isLoading || currentError || !hasData ? (
        <MovieHeroSection
          loading={isLoading}
          error={currentError}
          onRetry={refetch}
        />
      ) : (
        <>
          <MovieHeroSection
            movie={movie}
            onToggleWatchlist={() => onToggleWatchlist(movie)}
            onToggleFavorite={() => onToggleFavorite(movie)}
            isInWatchlist={watchlist.some((m) => m.id === movie.id)}
            isInFavorites={favorites.some((m) => m.id === movie.id)}
          />
          <CastSection
            cast={movie.cast}
            onViewFullCast={() => setIsCastModalOpen(true)}
            isCastModalOpen={isCastModalOpen}
          />

          {isCastModalOpen && (
            <CastModal
              cast={movie.cast}
              onClose={() => setIsCastModalOpen(false)}
            />
          )}
        </>
      )}
    </div>
  );
}

export default MovieDetailsPage;
