import { useState } from "react";
import { useParams } from "react-router-dom";
import { useMediaDetails } from "../../queries/movieQueries";
import MovieHeroSection from "./MovieHeroSection";
import CastSection from "./CastSection";
import CastModal from "./CastModal";
import SectionState from "../../components/Section State/SectionState";

function MovieDetailsPage({
  mediaType = "movie",
  onToggleWatchlist,
  onToggleFavorite,
  watchlist,
  favorites,
}) {
  const { id } = useParams();
  const [isCastModalOpen, setIsCastModalOpen] = useState(false);
  const { data: movie, error, isPending } = useMediaDetails(mediaType, id);
  const isLoading = Boolean(isPending);
  const currentError = error?.message ?? null;
  const hasData = Boolean(movie);

  if (!id) return <div className="page-error">Movie ID not found.</div>;

  if (isLoading || currentError || !hasData) {
    return (
      <div className="movie-details-page">
        <SectionState loading={isLoading} error={currentError} data={hasData ? [1] : []} />
      </div>
    );
  }

  return (
    <div className="movie-details-page">
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
    </div>
  );
}

export default MovieDetailsPage;
