import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { fetchMovieDetails } from "../../services/tmdb";
import MovieHeroSection from "./MovieHeroSection";
import CastSection from "./CastSection";
import CastModal from "./CastModal";

function MovieDetailsPage({
  onToggleWatchlist,
  onToggleFavorite,
  watchlist,
  favorites,
}) {
  const { id } = useParams();
  const [requestState, setRequestState] = useState({
    movieId: null,
    movie: null,
    error: null,
  });
  const [isCastModalOpen, setIsCastModalOpen] = useState(false);

  useEffect(() => {
    if (!id) return undefined;

    let cancelled = false;

    const loadMovieDetails = async () => {
      try {
        const movieDetails = await fetchMovieDetails(id);
        const director = movieDetails.credits?.crew?.find(
          (person) => person.job === "Director",
        )?.name;
       const cast = movieDetails.credits?.cast;

        const movieWithDetails = {
          ...movieDetails,
          director,
          cast,
          genres: movieDetails.genres ?? [],
        };

        if (!cancelled) {
          setRequestState({
            movieId: id,
            movie: movieWithDetails,
            error: null,
          });
        }
      } catch (loadError) {
        if (!cancelled) {
          setRequestState({
            movieId: id,
            movie: null,
            error: loadError.message || "Failed to load movie details.",
          });
        }
      }
    };

    loadMovieDetails();

    return () => {
      cancelled = true;
    };
  }, [id]);

  const isLoading = requestState.movieId !== id;
  const currentError =
    requestState.movieId === id ? requestState.error : null;
  const movie = requestState.movie;

  if (isLoading) return <div className="page-loading">Loading...</div>;
  if (currentError) return <div className="page-error">{currentError}</div>;
  if (!movie) return <div className="page-error">Movie not found.</div>;

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
