import CastModal from "./CastModal";
import CastSection from "./CastSection";
import MovieHeroSection from "./MovieHeroSection";
import MovieRatings from "./MovieRatings";
import MovieReviews from "./MovieReviews";
import MovieStoryline from "./MovieStoryline";
import SimilarTitles from "./SimilarTitles";

function MovieDetailsContent({
  movie,
  isInWatchlist,
  isInFavorites,
  isCastModalOpen,
  onBack,
  onToggleWatchlist,
  onToggleFavorite,
  onOpenCast,
  onCloseCast,
  onOpenTitle,
}) {
  return (
    <main className="movie-details-experience">
      <MovieHeroSection
        movie={movie}
        isInWatchlist={isInWatchlist}
        isInFavorites={isInFavorites}
        onBack={onBack}
        onToggleWatchlist={onToggleWatchlist}
        onToggleFavorite={onToggleFavorite}
      />

      <MovieRatings movie={movie} />

      <CastSection
        cast={movie.cast}
        director={movie.director}
        onViewFullCast={onOpenCast}
      />

      <MovieReviews reviews={movie.reviews} />

      <SimilarTitles
        titles={movie.recommendations}
        onOpenTitle={onOpenTitle}
      />

      <MovieStoryline movie={movie} />

      {isCastModalOpen && (
        <CastModal cast={movie.cast} onClose={onCloseCast} />
      )}
    </main>
  );
}

export default MovieDetailsContent;
